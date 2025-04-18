import Player from "../player/player";
import BaseDevice from "./base";

export default class DroppedItemDevice extends BaseDevice<"droppedItem"> {
    globalState = {
        amount: 0,
        fallY: 16000,
        visible: true,
        canBeCollected: true,
        alreadyCollected: false
    }

    init() {
        this.updateGlobalState("amount", this.options.amount);
        this.updateGlobalState("fallY", this.y - 30);
    }

    onMessage(player: Player, key: string) {
        if(key !== "interacted") return;
        if(!this.globalState.canBeCollected) return;

        let overflow = player.inventory.addItem(this.options.itemId, this.globalState.amount, this.options.currentClip);

        if(overflow > 0) {
            this.updateGlobalState("amount", this.globalState.amount - overflow);
        } else {
            this.updateGlobalState("canBeCollected", false);
            this.updateGlobalState("alreadyCollected", true);
    
            // remove the device from the map
            setTimeout(() => this.deviceManager.removeDevice(this), 600);
        }
    }
}