import type { Express } from 'express';
import type PluginApi from '../plugins/api';

export interface UserConfig {
    address: string;
    apiPort: number;
    gamePort: number;
    visibleGamePort?: number;
    plugins: Plugin[];
    mapPlugins?: Record<string, Plugin | Plugin[]>;
}

type Modify<T, R> = Omit<T, keyof R> & R;

export type ServerConfig = Modify<Required<UserConfig>, {
    mapPlugins: Record<string, Plugin[]>;
}>;

export interface Plugin {
    name: string;
    onExpress?: (express: Express) => void;
    onRoom?: (api: PluginApi) => void;
}

export type PluginFunctions = Omit<Plugin, "name">;