import { GameRoom } from "../../colyseus/room";
import { InteractiveSlotsItem, Inventory as InventorySchema, SlotsItem } from "../../colyseus/schema"
import { gadgetOptions, physicsScale, worldOptions } from "../../consts";
import Player from "./player";
import type { DropItemOptions, FireOptions } from "$types/net";

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

        player.onMsg("DROP_ITEM", this.onDrop.bind(this));
        player.onMsg("SET_ACTIVE_INTERACTIVE_ITEM", this.onSetInteractive.bind(this));
        player.onMsg("FIRE", this.onFire.bind(this));
        player.onMsg("RELOAD", this.onReload.bind(this));
    }

    getActiveSlot() {
        return this.inventory.interactiveSlots.get(this.inventory.activeInteractiveSlot.toFixed());
    }

    getItemInfo(id: string) { return worldOptions.itemOptions.find((i: any) => i.id === id) }

    addItem(id: string, amount: number) {        
        let item = this.getItemInfo(id);
        if(!item) return;

        if(this.inventory.slots.has(id)) {
            this.inventory.slots.get(id).amount += amount;
        } else {
            let slot = new SlotsItem({ amount });
            this.inventory.slots.set(id, slot);
        }

        // if it's an interactive item put it in the interactive slots
        if(item.type === "resource") return;
        for(let [slotId, slot] of this.inventory.interactiveSlots) {
            if(slot.itemId) continue;

            let newSlot: InteractiveSlotsItem;
            if(item.type === "weapon" && item.weapon.type !== "melee") {
                let gadget = gadgetOptions[item.id];
                newSlot = new InteractiveSlotsItem(id, gadget);
            } else {
                newSlot = new InteractiveSlotsItem(id);
            }

            this.inventory.interactiveSlots.set(slotId, newSlot);
            break;
        }
    }

    removeItemAmount(id: string, amount: number) {
        if(!this.inventory.slots.has(id)) return;
        if(this.inventory.slots.get(id).amount < amount) return;

        this.inventory.slots.get(id).amount -= amount;
        if(this.inventory.slots.get(id).amount <= 0) {
            this.inventory.slots.delete(id);
        }

        return true;
    }
    
    removeItemSlot(amount: number, slotNum: number) {
        let slot = this.inventory.interactiveSlots.get(slotNum.toString());
        if(slot.count < amount) return;

        if(this.inventory.activeInteractiveSlot === slotNum) {
            this.inventory.activeInteractiveSlot = 0;
        }

        slot.count -= amount;

        if(slot.count <= 0) {
            slot.itemId = "";
            slot.count = 0;
        }
        
        this.removeItemAmount(slot.itemId, amount);

        return true;
    }

    onDrop({ amount, itemId, interactiveSlotNumber }: DropItemOptions) {
        if(interactiveSlotNumber) {
            itemId = this.inventory.interactiveSlots.get(interactiveSlotNumber.toString()).itemId;
            if(!this.removeItemSlot(amount, interactiveSlotNumber)) return;
        } else {
            if(!this.removeItemAmount(itemId, amount)) return;
        }

        this.room.devices.createDevice({
            id: crypto.randomUUID(),
            x: this.player.player.x,
            y: this.player.player.y + 30,
            depth: this.player.player.y + 30,
            layer: "DepthSortedCharactersAndDevices",
            deviceId: "droppedItem",
            options: {
                amount,
                itemId,
                placedByCharacterId: this.player.id,
                useCurrentClipCount: false,
                currentClip: 0,
                useCurrentDurability: false,
                currentDurability: 0,
                decay: 0
            }
        }, true);
    }

    onSetInteractive({ slotNum }: { slotNum: number }) {
        if(slotNum < 0 || slotNum > this.room.mapSettings.interactiveItemsSlots) return;
        this.inventory.activeInteractiveSlot = slotNum;
    }

    onFire(options: FireOptions) {
        let activeItem = this.getActiveSlot();
        if(!activeItem) return;
        let gadget = gadgetOptions[activeItem.itemId];
        if(!gadget) return;

        if(gadget.clipSize) {
            if(activeItem.currentClip <= 0 || activeItem.waiting) return;

            // consume one shot
            activeItem.currentClip -= 1;
        }

        // TODO: Collision
        let distance = gadget.distance;
        let time = distance / gadget.speed;

        this.room.broadcast("PROJECTILE_CHANGES", {
            added: [
                {
                    id: crypto.randomUUID(),
                    startTime: Date.now(),
                    endTime: Date.now() + time,
                    start: {
                        x: options.x / physicsScale,
                        y: options.y / physicsScale
                    },
                    end: {
                        x: options.x / physicsScale + Math.cos(options.angle) * distance,
                        y: options.y / physicsScale + Math.sin(options.angle) * distance
                    },
                    radius: gadget.radius,
                    appearance: gadget.appearance,
                    ownerId: this.player.id,
                    ownerTeamId: this.player.player.teamId,
                    damage: gadget.damage * this.player.player.projectiles.damageMultiplier
                }
            ],
            hit: []
        });
    }

    onReload() {
        let activeItem = this.getActiveSlot();
        if(!activeItem || activeItem.currentClip === activeItem.clipSize || activeItem.waiting) return;
        let gadget = gadgetOptions[activeItem.itemId];
        if(!gadget || !gadget.clipSize) return;

        // temporarily disable the item
        activeItem.waiting = true;
        activeItem.waitingStartTime = Date.now();
        activeItem.waitingEndTime = Date.now() + gadget.reloadTime;

        setTimeout(() => {
            activeItem.waiting = false;
            activeItem.currentClip = activeItem.clipSize;
        }, gadget.reloadTime);
    }
}
