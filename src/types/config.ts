import type { Express } from 'express';
import type { GameRoom } from '../colyseus/room';

export interface ServerConfig {
    address: string;
    apiPort: number;
    gamePort: number;
    visibleGamePort?: number;
    plugins: Plugin[];
}

export interface Plugin {
    name: string;
    onExpress?: (express: Express) => void;
    onRoom?: (room: GameRoom) => void;
}

export type PluginFunctions = Omit<Plugin, "name">;