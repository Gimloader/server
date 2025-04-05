import type { Inventory } from "../colyseus/schema";
import type { MapInfo } from "./map";

export interface CharacterOptions {
    id: string;
    name: string;
    x: number;
    y: number;
    infiniteAmmo: boolean;
    cosmetics: Cosmetics;
    inventory: Inventory;
}

export interface SessionOptions {
    gameOwnerId: string;
    mapStyle: string;
}

export interface StateOptions {
    gameCode: string;
    ownerId: string;
    map: MapInfo;
    mapSettings: Record<string, any>;
}

export interface Cosmetics {
    character: { id: string, editStyles?: Record<string, string> };
    trail: string | null;
}

export interface InteractiveSlotOptions {
    currentClip: number;
    clipSize: number;
}