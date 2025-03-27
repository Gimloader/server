import config from "$config";
import { PluginFunctions } from "./types";

export default class PluginManager {
    static trigger<T extends keyof PluginFunctions>(method: T, ...args: Parameters<PluginFunctions[T]>) {
        for(let plugin of config.plugins) {
            plugin[method]?.apply(null, args);
        }
    }
}