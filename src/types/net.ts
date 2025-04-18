export interface MCKitAnswer {
    correct: boolean;
    _id: string;
    text?: string;
    image?: string;
}

export interface TextKitAnswer {
    correct: boolean;
    _id: string;
    text: string;
    textType?: number; // 2 means include, undefined means match exactly
}

export type KitQuestion = {
    _id: string;
    position?: number;
    isActive?: boolean;
    game?: string;
    text: string;
} & (
    { type: "mc", answers: MCKitAnswer[] } |
    { type: "text", answers: TextKitAnswer[] }
)

export interface DropItemOptions {
    amount: number;
    itemId?: string;
    interactiveSlotNumber: number;
}

export interface FireOptions {
    x: number;
    y: number;
    angle: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface ProjectileAdded {
    id: string;
    startTime: number;
    endTime: number;
    start: Point;
    end: Point;
    radius: number;
    appearance: string;
    ownerId: string;
    ownerTeamId: string;
    damage: number;
}

export enum DamageType {
    brokenShield = "b",
    shield = "s",
    health = "h",
    fragility = "f"
}

export interface CharacterHit {
    characterId: string;
    damage: number;
    type: DamageType;
}

export interface ProjectileHit {
    hits: CharacterHit[];
    id: string;
    x: number;
    y: number;
}