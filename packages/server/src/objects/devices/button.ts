import Player from "../player.js";
import BaseDevice from "./base.js";

export default class ButtonDevice extends BaseDevice {
    globalState = { active: true };

    restore() {
        this.updateGlobalState("active", this.options.activeOnStart);
    }

    onChannel(channel: string) {
        if(channel === this.options.activateChannel) {
            this.updateGlobalState("active", true);
        } else if(channel === this.options.deactivateChannel) {
            this.updateGlobalState("active", false);
        }
    }

    onMessage(player: Player, key: string): void {
        if(key !== "interacted") return;
        if(!this.globalState.active) return;

        // verify that the player is within the radius
        let { x, y } = player.player;
        let distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        if(distance > this.options.radius + 20) return;

        if(this.options.channel) {
            this.deviceManager.triggerChannel(this.options.channel);
        }
    }
}