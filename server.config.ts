import { config } from "./src/utils.js";

export default config({
    // The port for the matchmaker to use 
    apiPort: 5823,

    // The port for game servers to use 
    gamePort: 5824,    

    // Plugins for the server to use
    plugins: []
});