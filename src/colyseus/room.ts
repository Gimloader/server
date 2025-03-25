import { Client, Room } from "colyseus";
import Matchmaker, { Game } from "../net/matchmaker.js";
import { GimkitState } from "./schema.js";
import fs from 'fs';
import DeviceManager from "./deviceManager.js";
import { MapInfo } from "../types.js";
import TileManager from "./tileManager.js";
import Player from "../objects/player.js";
import PhysicsManager from "./physics.js";
import MapData from "../net/mapData.js";
import RAPIER from "@dimforge/rapier2d-compat";
import TeamManager from "./teamManager.js";

interface RoomOptions {
    intentId: string;
    authToken: string; // not currently used
}

interface ClientOptions {
    intentId: string;
}

export class GameRoom extends Room<GimkitState> {
    game: Game;
    map: MapInfo;
    physics: PhysicsManager;
    world: RAPIER.World;
    devices: DeviceManager;
    mapSettings: Record<string, any>;
    terrain: TileManager;
    updateTimeInterval: Timer;
    teams: TeamManager;
    players = new Map<Client, Player>();
    host: Player;
    gameStarted: number = 0;

    onCreate(options: RoomOptions) {
        this.game = Matchmaker.getByHostIntent(options.intentId);

        if(this.game) {
            this.game.colyseusRoomId = this.roomId;
            let map = MapData.getByMapId(this.game.mapId);

            this.map = JSON.parse(fs.readFileSync(`./maps/${map.file}`).toString());
            this.physics = new PhysicsManager(this);
            this.world = this.physics.world;
            this.devices = new DeviceManager(this.map, this);
            this.mapSettings = this.devices.getMapSettings();
            this.terrain = new TileManager(this.map, this);
            this.teams = new TeamManager(this);

            this.setState(new GimkitState({
                gameCode: this.game.code,
                ownerId: options.intentId,
                map: this.map,
                mapSettings: this.mapSettings
            }));
        } else {
            this.disconnect();
            return;
        }

        this.onMessage("REQUEST_INITIAL_WORLD", (client) => {
            client.send("DEVICES_STATES_CHANGES", this.devices.getInitialChanges());
            client.send("TERRAIN_CHANGES", this.terrain.getInitialMessage());
            client.send("WORLD_CHANGES", this.devices.getInitialMessage());

            let player = this.players.get(client);
            player.syncPhysics(true);
        });

        this.onMessage("INPUT", (client, input) => {
            let player = this.players.get(client);
            if(!player) return;

            player.onInput(input);
        });

        this.onMessage("START_GAME", (client) => {
            if(client.userData?.id !== this.game.intentId) return;
            if(this.state.session.phase !== "preGame") return;

            this.state.session.phase = "game";
            this.state.session.gameSession.phase = "game";
            this.gameStarted = Date.now() + 1200;
            this.showLoading(1200, () => {
                this.teams.start();
                for(let p of this.players.values()) p.moveToSpawnpoint();
            });
        });

        this.onMessage("END_GAME", (client) => {
            if(client.userData?.id !== this.game.intentId) return;
            if(this.state.session.phase !== "game") return;

            this.state.session.gameSession.phase = "results";
        });

        this.onMessage("RESTORE_MAP_EARLIER", (client) => {
            if(client.userData?.id !== this.game.intentId) return;
            if(this.state.session.phase !== "game" || this.state.session.gameSession.phase !== "results") return;

            this.state.session.phase = "preGame";
            this.showLoading(1200, () => {
                this.broadcast("RESET");
                this.devices.restore();
                this.teams.restore();
                for(let p of this.players.values()) p.moveToSpawnpoint();
            });
        });
        
        this.onMessage("*", () => {});

        this.updateTimeInterval = setInterval(() => {
			this.state.session.gameTime = Date.now();
		}, 500);
    }

    onDispose() {
        clearInterval(this.updateTimeInterval);
        this.physics.dispose();
    }

    async onJoin(client: Client, options: ClientOptions) {
        let name: string;
        
        // if the intentId is that of the game they are the host
        let intent = this.game.clientIntents.get(options?.intentId);
        if(!intent) {
            client.leave();
            return;
        }
        
        name = intent.name;
        this.game.clientIntents.delete(options.intentId);
        client.userData = { id: options.intentId };

        // create the player object
        await this.devices.devicesLoaded;

        let player = new Player(this, client, options.intentId, name);
        if(options.intentId === this.game.intentId) this.host = player;
        this.players.set(client, player);

        this.devices.onJoin(player);
    }

    onLeave(client: Client, consented: boolean) {
        const kickPlayer = () => {
            let player = this.players.get(client);
            if(!player) return;

            player.leaveGame();
            this.teams.onLeave(player);
            this.players.delete(client);
        }

        if(consented) {
            kickPlayer();
        } else {
            this.allowReconnection(client, 30).catch(kickPlayer);
        }
    }

    // as far as I can tell the loading screens are purely to mask teleports
    showLoading(duration: number, halfCallback?: () => void) {
        this.state.session.loadingPhase = true;

        if(halfCallback) {
            setTimeout(halfCallback, duration / 2);
        }

        setTimeout(() => {
            this.state.session.loadingPhase = false;
        }, duration);
    }
}