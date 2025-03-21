import { GameRoom } from "../colyseus/room.js";
import BaseDevice from "../objects/devices/base.js";
import Player from "../objects/player.js";
import { CodeGrid, CustomBlock } from "../types.js";
import { runBlock } from "./runBlock.js";

export function runGrid(grid: CodeGrid, device: BaseDevice, room: GameRoom, player: Player) {
    let customBlocks: Record<string, CustomBlock> = Object.assign({}, device.customBlocks);
    
    let gridBlocks = device.customGridBlocks[grid.triggerType];
    if(gridBlocks) {
        Object.assign(customBlocks, gridBlocks);
    }

    for(let block of grid.json.blocks.blocks) {
        runBlock(block, customBlocks, room, player);
    }
}