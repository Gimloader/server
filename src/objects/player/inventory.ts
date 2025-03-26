import { GameRoom } from "../../colyseus/room.js";
import { Inventory as InventorySchema, SlotsItem } from "../../colyseus/schema.js"
import Player from "./player.js";

export default class Inventory {
    player: Player;
    room: GameRoom;
    inventory: InventorySchema;

    constructor(player: Player, room: GameRoom) {
        this.player = player;
        this.room = room;
        this.inventory = new InventorySchema({
            infiniteAmmo: room.mapSettings.infiniteAmmo
        });

        player.onMsg("DROP_ITEM", ({ amount, itemId }: { amount: number, itemId: string }) => {
            if(!this.hasItem(itemId, amount)) return;
            this.removeItem(itemId, amount);

            room.devices.createDevice({
                id: crypto.randomUUID(),
                x: player.player.x,
                y: player.player.y + 30,
                depth: player.player.y + 30,
                layer: "DepthSortedCharactersAndDevices",
                deviceId: "droppedItem",
                options: {
                    amount,
                    itemId,
                    placedByCharacterId: player.id,
                    useCurrentClipCount: false,
                    currentClip: 0,
                    useCurrentDurability: false,
                    currentDurability: 0,
                    decay: 0
                }
            }, true);
        });
    }

    addItem(id: string, amount: number) {
        if(this.inventory.slots.has(id)) {
            this.inventory.slots.get(id).amount += amount;
        } else {
            let slot = new SlotsItem({ amount });
            this.inventory.slots.set(id, slot);
        }
    }
    
    hasItem(id: string, amount: number) {
        if(!this.inventory.slots.has(id)) return false;
        return this.inventory.slots.get(id).amount >= amount;
    }

    removeItem(id: string, amount: number) {
        this.inventory.slots.get(id).amount -= amount;
        if(this.inventory.slots.get(id).amount <= 0) {
            this.inventory.slots.delete(id);
        }
    }
}