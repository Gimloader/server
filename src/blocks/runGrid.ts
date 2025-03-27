import { GameRoom } from "../colyseus/room";
import BaseDevice from "../objects/devices/base";
import Player from "../objects/player/player";
import { CodeGrid } from "../types";
import { runBlock } from "./runBlock";

export function runGrid(grid: CodeGrid, device: BaseDevice, room: GameRoom, player: Player) {
    let variables = {};

    for(let block of grid.json.blocks.blocks) {
        runBlock(block, variables, device.customBlocks, room, player);
    }
}