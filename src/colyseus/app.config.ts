import config from "@colyseus/tools";
import { GameRoom } from "./room.js";
import { BunWebSockets } from "@colyseus/bun-websockets";

// No idea why typescript doesn't think config is callable
let conf = config as unknown as typeof config.default;
export default conf({
    options: {
        transport: new BunWebSockets()
    },
    initializeGameServer(server) {
        server.define("MapRoom", GameRoom);
    }
});