import { config } from "./src/utils.js";

export default config({
    // The address that the server uses
    address: "localhost",

    // The port for the matchmaker to use 
    apiPort: 5823,

    // The port for game servers to use 
    gamePort: 5824,

    // Plugins for the server to use
    plugins: []
});