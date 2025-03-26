import Player from "../player/player.js";
import BaseDevice from "./base.js";

export default class ButtonDevice extends BaseDevice {
    restore() {
        this.updateForAll(this.options.scope, "active", this.options.activeOnStart);
    }
    
    onJoin(player: Player) {
        this.updatePlayerState(player.id, "active", this.options.activeOnStart);
    }

    setActive(active: boolean, player: Player) {
        if(this.options.scope === "global") {
            this.updateGlobalState("active", active);
        } else if(this.options.scope === "team") {

        } else {
            this.updatePlayerState(player.id, "active", active);
        }
    }

    isActive(player: Player) {
        if(this.options.scope === "global") {
            return this.globalState.active;
        } else if(this.options.scope === "team") {

        } else {
            return this.playerStates[player.id].active;
        }
    }

    onChannel(channel: string, player: Player) {
        if(channel === this.options.activateChannel) this.setActive(true, player);
        else if(channel === this.options.deactivateChannel) this.setActive(false, player);
    }

    onMessage(player: Player, key: string) {
        if(key !== "interacted") return;
        if(!this.isActive(player)) return;

        // verify that the player is within the radius
        let { x, y } = player.player;
        let distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        if(distance > this.options.radius + 20) return;

        this.triggerWire("pressed", player);
        if(this.options.channel) {
            this.deviceManager.triggerChannel(this.options.channel, player);
        }
    }

    onWire(connection: string, player: Player) {
        if(connection === "enable") this.setActive(true, player);
        else if(connection === "disable") this.setActive(false, player);
    }
}