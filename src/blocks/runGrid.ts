import { GameRoom } from "../colyseus/room.js";
import BaseDevice from "../objects/devices/base.js";
import Player from "../objects/player.js";
import { CodeGrid } from "../types.js";
import { runBlock } from "./runBlock.js";

export function runGrid(grid: CodeGrid, device: BaseDevice, room: GameRoom, player: Player) {
    let variables = {};

    for(let block of grid.json.blocks.blocks) {
        runBlock(block, variables, device.customBlocks, room, player);
    }
}