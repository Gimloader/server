import Player from "../player/player.js";
import BaseDevice from "./base.js";

export default class ItemGranterDevice extends BaseDevice {
    onChannel(channel: string, player: Player) {
        if(channel !== this.options.grantWhenReceivingFromChannel) return;
        if(!this.options.itemId) return;

        player.inventory.addItem(this.options.itemId, this.options.itemChange);
    }
}