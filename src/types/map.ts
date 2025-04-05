import type RAPIER from "@dimforge/rapier2d-compat";
import { DeviceOptions } from "./devices";

export interface DeviceInfo<T extends keyof DeviceOptions> {
    id: string;
    x: number;
    y: number;
    depth: number;
    layer: string;
    deviceId: T;
    options: DeviceOptions[T];
}

export interface TileInfo {
    terrain: string;
    depth: number;
    collides: boolean;
    rb: RAPIER.RigidBody;
    collider: RAPIER.Collider;
}

export interface CodeGrid {
    json: any;
    triggerType: string;
    triggerValue?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Wire {
    id: string;
    startDevice: string;
    endDevice: string;
    startConnection: string;
    endConnection: string;
}

type MapStyle = "platformer" | "topDown";

export interface MapMeta {
    name: string;
    tagline: string;
    imageUrl: string;
    tag: string;
    pageText: string;
    labels: {
        c: string; // complexity
        d: string; // duration
        s: string; // style
    }
}

export interface MapInfo {
    mapStyle: MapStyle;
    codeGrids: Record<string, Record<string, CodeGrid>>;
    devices: DeviceInfo<any>[];
    tiles: Record<string, TileInfo>;
    wires: Wire[];
    meta?: MapMeta;
}

export interface Map {
    file: string;
    id: string;
    mapId: string;
    meta: MapMeta;
    pageId: string;
}

export interface ExperienceCategory {
    _id: string;
    name: string;
    items: ExperienceInfo[];
}

export interface ExperienceInfo extends MapMeta {
    _id: string;
    source: "map";
    pageId?: string;
    mapId: string;
    isPremiumExperience: boolean;
}