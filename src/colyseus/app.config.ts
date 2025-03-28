import config from "@colyseus/tools";
import { GameRoom } from "./room";
import { BunWebSockets } from "@colyseus/bun-websockets";

export default config({
    options: {
        transport: new BunWebSockets(),
        devMode: false,
        greet: false
    },
    initializeGameServer(server) {
        server.define("MapRoom", GameRoom);
    }
});