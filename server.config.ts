import { config } from "./src/utils.js";

export default config({
    // The address that the server uses
    address: "localhost",

    // The internal ports to use 
    apiPort: 5823,
    gamePort: 5824,

    // The game server port to send to clients (if different)
    // visibleGamePort: 5824,

    // Plugins for the server to use
    plugins: [],

    // Plugins to apply per-map
    // mapPlugins: {}
});