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