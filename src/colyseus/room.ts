import { Client, Room } from "colyseus";
import Matchmaker, { Game } from "../net/matchmaker";
import { GimkitState } from "./schema";
import DeviceManager from "./deviceManager";
import TileManager from "./tileManager";
import Player from "../objects/player/player";
import PhysicsManager from "./physics";
import MapData from "../net/mapData";
import RAPIER, { World } from "@dimforge/rapier2d-compat";
import TeamManager from "./teamManager";
import EventEmitter from "node:events";
import PluginManager from "../plugins/manager";
import { join } from "node:path";
import { dataPath, mapsPath } from "../consts";
import type { MapInfo, WorldData } from "$types/map";
import { MapOptionsOptions } from "$types/devices";
import ProjectileManager from "./projectiles";

interface RoomOptions {
    intentId: string;
    authToken: string; // not currently used
}

interface ClientOptions {
    intentId: string;
}

type MsgCallback = (player: Player, message: any) => void;

export class GameRoom extends Room<GimkitState> {
    game: Game;
    map: MapInfo;
    physics: PhysicsManager;
    world: RAPIER.World;
    devices: DeviceManager;
    mapOptions: MapOptionsOptions;
    terrain: TileManager;
    updateTimeInterval: Timer;
    teams: TeamManager;
    projectiles: ProjectileManager;
    players: Player[] = [];
    host: Player;
    gameStarted: number = 0;
    data: WorldData;

    messageEvents = new EventEmitter();
    startCallbacks = new Set<() => void>();
    restoreCallbacks = new Set<() => void>();
    onMsg(type: string, callback: MsgCallback) { this.messageEvents.on(type, callback); }
    offMsg(type: string, callback: MsgCallback) { this.messageEvents.off(type, callback); }
    onStart(callback: () => void) { this.startCallbacks.add(callback); }
    offStart(callback: () => void) { this.startCallbacks.delete(callback); }
    onRestore(callback: () => void) { this.restoreCallbacks.add(callback); }
    offRestore(callback: () => void) { this.restoreCallbacks.delete(callback); }
    
    async onCreate(options: RoomOptions) {
        this.game = Matchmaker.getByHostIntent(options.intentId);

        if(this.game) {
            this.game.colyseusRoomId = this.roomId;

            let map = MapData.getByMapId(this.game.mapId);
            this.map = await Bun.file(join(mapsPath, map.file)).json();
            this.data = await this.loadData();

            this.physics = new PhysicsManager(this);
            this.projectiles = new ProjectileManager(this);
            this.world = this.physics.world;
            this.devices = new DeviceManager(this.map, this);
            this.mapOptions = this.devices.getMapSettings();
            this.terrain = new TileManager(this.map, this);
            this.teams = new TeamManager(this);

            this.setState(new GimkitState({
                gameCode: this.game.code,
                ownerId: options.intentId,
                map: this.map,
                mapSettings: this.mapOptions
            }));

            PluginManager.initRoom(this, map.file.replace(".json", ""));
        } else {
            this.disconnect();
            return;
        }

        this.onMsg("REQUEST_INITIAL_WORLD", (player) => {
            player.client.send("DEVICES_STATES_CHANGES", this.devices.getInitialChanges());
            player.client.send("TERRAIN_CHANGES", this.terrain.getInitialMessage());
            player.client.send("WORLD_CHANGES", this.devices.getInitialWorld());
            player.syncPhysics(true);
        });

        this.onMsg("START_GAME", (player) => {
            if(!player.isHost) return;
            if(this.state.session.phase !== "preGame") return;

            this.state.session.phase = "game";
            this.state.session.gameSession.phase = "game";
            this.gameStarted = Date.now() + 1200;
            this.showLoading(1200, () => {
                for(let cb of this.startCallbacks) cb();
            });
        });

        this.onMsg("END_GAME", (player) => {
            if(!player.isHost) return;
            if(this.state.session.phase !== "game") return;

            this.state.session.gameSession.phase = "results";
        });

        this.onMsg("RESTORE_MAP_EARLIER", (player) => {
            if(!player.isHost) return;
            if(this.state.session.phase !== "game" || this.state.session.gameSession.phase !== "results") return;

            this.state.session.phase = "preGame";
            this.showLoading(1200, () => {
                this.broadcast("RESET");
                for(let cb of this.restoreCallbacks) cb();
            });
        });
        
        this.onMessage("*", (client, type: string, message) => {
            let player = this.players.find((p) => p.client === client);
            if(!player) return;
            
            this.messageEvents.emit(type, player, message);
            player.messageEvents.emit(type, message);
        });

        this.updateTimeInterval = setInterval(() => {
			this.state.session.gameTime = Date.now();
		}, 500);
    }

    async loadData(): Promise<WorldData> {
        const readData = (name: string) => {
            return Bun.file(join(dataPath, `${name}.json`)).json();
        }

        const [worldOptions, propOptions, gadgetOptions] = await Promise.all([
            readData("worldOptions"),
            readData(`${this.map.mapStyle}PropOptions`),
            readData("gadgetOptions")
        ]);

        return { worldOptions, propOptions, gadgetOptions }
    }

    onDispose() {
        clearInterval(this.updateTimeInterval);
        this.physics.dispose();
        this.projectiles.dispose();
    }

    async onJoin(client: Client, options: ClientOptions) {
        let intent = this.game.clientIntents.get(options?.intentId);
        if(!intent) {
            client.leave();
            return;
        }
        
        let name = intent.name;
        this.game.clientIntents.delete(options.intentId);
        client.userData = { id: options.intentId };

        // create the player object
        await this.devices.devicesLoaded;

        let player = new Player(this, client, options.intentId, name, intent.cosmetics);

        // if the intentId is that of the game they are the host
        if(options.intentId === this.game.intentId) {
            this.host = player;
            player.isHost = true;
        }
        this.players.push(player);

        this.devices.onJoin(player);
    }

    onLeave(client: Client, consented: boolean) {
        const kickPlayer = () => {
            let index = this.players.findIndex((p) => p.client === client);
            if(index === -1) return;
            let player = this.players[index];

            player.leaveGame();
            this.teams.onLeave(player);
            this.players.splice(index, 1);
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