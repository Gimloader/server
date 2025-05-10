import config from "$config";
import { PluginFunctions } from "$types/config";
import type { GameRoom } from "../colyseus/room";
import PluginApi from "./api";

export default class PluginManager {
    static pluginLoaded(name: string, map?: string) {
        if(config.plugins.some((p) => p.name === name)) return true;
        if(!map) return false;

        // get an array of the plugins for the map
        let mapPlugins = config.mapPlugins[name];
        if(!mapPlugins) return false;

        return mapPlugins.some((p) => p.name === name);
    }

    static trigger<T extends keyof PluginFunctions>(method: T, map: string | null, ...args: Parameters<PluginFunctions[T]>) {
        for(let plugin of config.plugins) {
            plugin[method]?.apply(null, args);
        }

        let mapPlugins = config.mapPlugins[map];
        if(!mapPlugins) return;

        for(let plugin of mapPlugins) {
            plugin[method]?.apply(null, args);
        }
    }

    static initRoom(room: GameRoom, map: string) {
        const api = new PluginApi(room);
        this.trigger("onRoom", map, api);
    }
}