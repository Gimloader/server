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
    collides: boolean;
    rb?: RAPIER.RigidBody;
    collider?: RAPIER.Collider;
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
    requiredPlugins?: string[];
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

export interface ExperienceInfo {
    _id: string;
    source: "map";
    pageId?: string;
    mapId: string;
    isPremiumExperience: boolean;
    name: string;
    tagline: string;
    imageUrl: string;
    tag: string;
    labels: {
        c: string; // complexity
        d: string; // duration
        s: string; // style
    }
}

export interface TerrainOption {
    id: string;
    name: string;
    maskTilesUrl: string;
    borderTilesUrl: string;
    fillUrl: string;
    previewUrl: string;
    blockedMapStyles?: string[];
    minimumRoleLevel?: number;
    health?: number;
}

export interface BaseItemOption {
    id: string;
    name: string;
    editorName: string;
    description: string;
    previewImage: string;
}

export interface ResourceItemOption extends BaseItemOption {
    type: "resource";
}

export interface BaseWeaponOption {
    appearance: string;
    shared: {
        cooldownBetweenShots: number;
        allowAutoFire: boolean;
        startingProjectileDistanceFromCharacter: number;
    }
}

export interface BulletWeaponOption extends BaseWeaponOption {
    type: "bullet";
    bullet: {
        ammoItemId: string;
    }
}

export interface MeleeWeaponOption extends BaseWeaponOption {
    type: "melee";
}

export interface WeaponItemOption extends BaseItemOption {
    type: "weapon";
    rarity: string;
    weapon: BulletWeaponOption | MeleeWeaponOption;
}

export interface ItemItemOption extends BaseItemOption {
    type: "item";
    rarity: string;
    useCommand: string;
    consumeType: string;
    terrainId?: string;
    maxStackSize: number;
}

export interface DeviceOption {
    id: string;
    name: string;
    description: string;
    optionSchema: string;
    defaultState: string;
    codeGridSchema: string;
    wireConfig: string;
    minimumRoleLevel?: number;
}

export interface SkinOption {
    id: string;
    name: string;
    minimumRoleLevel?: number;
}

export interface WorldOptions {
    terrainOptions: TerrainOption[];
    itemOptions: (ResourceItemOption | WeaponItemOption | ItemItemOption)[];
    deviceOptions: DeviceOption[];
    codeGrids: any; // complicated and it really doesn't matter
    skinOptions: SkinOption[];
}

export interface PropOption {
    id: string;
    name: string;
    scaleMultip: number;
    originX: number;
    originY: number;
    imageUrl: string;
    rectColliders: {
        x: number;
        y: number;
        w: number;
        h: number;
        angle: number;
    }[];
    circleColliders: {
        x: number;
        y: number;
        r: number;
    }[];
    ellipseColliders: {
        x: number;
        y: number;
        r1: number;
        r2: number;
        angle: number;
    }[];
    shadows: {
        x: number;
        y: number;
        r1: number;
        r2: number;
    }[];
}

export interface GadgetOption {
    clipSize: number;
    reloadTime: number;
    damage: number;
    radius: number;
    distance: number;
    speed: number;
}

export interface WorldData {
    worldOptions: WorldOptions;
    propOptions: PropOption[];
    gadgetOptions: GadgetOption[];
}