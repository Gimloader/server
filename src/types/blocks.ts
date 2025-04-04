import type { GameRoom } from "../colyseus/room";
import type Player from "../objects/player/player";

export interface Block {
    type: string;
    id?: string;
    extraState?: Record<string, any>;
    inputs?: Record<string, Record<string, Block>>;
    fields?: Record<string, any>;
    next?: { block: Block };
}

export type CustomBlock = (info: {
    run: (name: string) => any;
    block: Block;
    room: GameRoom;
    player: Player;
}) => any;