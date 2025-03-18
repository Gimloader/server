import express from './net/express.js';
import { Server } from "colyseus";
import { BunWebSockets } from "@colyseus/bun-websockets";
import { GameRoom } from './colyseus/room.js';
import Matchmaker from './net/matchmaker.js';
import { colyseusPort } from './consts.js';
import RAPIER from "@dimforge/rapier2d-compat";
import MapData from './net/mapData.js';

RAPIER.init();

const server = new Server({ transport: new BunWebSockets() });

server.define("MapRoom", GameRoom);
server.listen(colyseusPort);

Matchmaker.init();
MapData.init();

// add fallbacks for unimplemented routes
express.get("*", (req, res) => {
    console.log("Client requested missing route with GET:", req.url);
    res.status(501).send("Not implemented");
});
express.post("*", (req, res) => {
    console.log("Client requested missing route with POST:", req.url);
    res.status(501).send("Not implemented");
});