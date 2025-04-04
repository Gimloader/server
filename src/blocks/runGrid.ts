import { GameRoom } from "../colyseus/room";
import BaseDevice from "../objects/devices/base";
import Player from "../objects/player/player";
import { runBlock } from "./runBlock";
import type { CodeGrid } from "$types/map";

export function runGrid(grid: CodeGrid, device: BaseDevice, room: GameRoom, player: Player) {
    let variables = {};

    for(let block of grid.json.blocks.blocks) {
        runBlock(block, variables, device.customBlocks, room, player);
    }
}