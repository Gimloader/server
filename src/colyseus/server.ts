import { GameRoom } from "./room";
import { BunWebSockets } from "@colyseus/bun-websockets";
import { Server } from "colyseus";

const server = new Server({
    transport: new BunWebSockets(),
    greet: false
});
server.define("MapRoom", GameRoom);

export default server;