import { colyseusPort, defaultCosmetics } from '../consts.js';
import express from './express.js';
import { generateGameCode } from '../utils.js';
import MapData from './mapData.js';
import { Cosmetics } from '../types.js';

interface ClientIntent {
    name: string;
    cosmetics: Cosmetics;
}

export interface Game {
    intentId: string;
    clientIntents: Map<string, ClientIntent>;
    roomId: string;
    colyseusRoomId?: string;
    mapId: string;
    code: string;
}

export default class Matchmaker {
    static games: Game[] = [];
    static serverUrl = `http://localhost:${colyseusPort}`;

    static getByHostIntent(intentId: string) {
        let game = this.games.find(g => g.intentId === intentId);
        return game;
    }
    
    static getByCode(code: string) {
        let game = this.games.find(g => g.code === code);
        return game;
    }

    static getByRoomId(roomId: string) {
        let game = this.games.find(g => g.roomId === roomId);
        return game;
    }

    static init() {
        // creating games
        express.post("/api/matchmaker/intent/map/play/create", async (req, res) => {
            let map = MapData.getById(req.body.experienceId);
            if(!map) {
                res.status(404).send();
                return;
            }

            // random map for now
            let game: Game = {
                intentId: crypto.randomUUID(),
                roomId: crypto.randomUUID(),
                clientIntents: new Map(),
                mapId: map.mapId,
                code: generateGameCode()
            };

            let name = req.body.name ?? "Host";
            let cosmetics = req.body.cosmetics ?? defaultCosmetics;
            game.clientIntents.set(game.intentId, { name, cosmetics });

            this.games.push(game);

            console.log("Room created with code", game.code);
            res.send(`${game.intentId}&custom=true`);
        });

        express.get("/api/matchmaker/intent/fetch-source/:id", (req, res) => {
            res.send("map");
        });

        express.get("/api/matchmaker/intent/map/summary/:id", (req, res) => {
            let game = this.getByHostIntent(req.params.id);
            if(game) res.json({ mapId: game.mapId });
            else res.status(404).send();
        });

        express.post("/api/matchmaker/find-server-to-host-game", (req, res) => {
            res.json({ url: this.serverUrl });
        });

        // joining games
        express.post("/api/matchmaker/find-info-from-code", (req, res) => {
            let game = this.getByCode(req.body.code);
            if(game) res.json({ roomId: game.roomId, useRandomNamePicker: false });
            else res.status(404).json({ message: { text: "Game not found" }, code: 404 });
        });

        express.post("/api/matchmaker/join", (req, res) => {
            let room = this.getByRoomId(req.body.roomId);
            if(!room.colyseusRoomId) {
                res.status(404).send();
                return;
            }

            let intentId = crypto.randomUUID();

            if(!req.body.name) return;
            let cosmetics = req.body.cosmetics ?? defaultCosmetics;
            room.clientIntents.set(intentId, { name: req.body.name, cosmetics });

            res.json({
                source: "map",
                serverUrl: this.serverUrl,
                roomId: room.colyseusRoomId,
                intentId
            });
        });
    }
}