import { GameRoom } from "../../colyseus/room";
import { InteractiveSlotsItem, Inventory as InventorySchema, SlotsItem } from "../../colyseus/schema"
import { gadgetOptions, physicsScale, worldOptions } from "../../consts";
import Player from "./player";
import type { DropItemOptions, FireOptions } from "$types/net";
import { WaitOptions } from "$types/objects";

export default class Inventory {
    player: Player;
    room: GameRoom;
    inventory: InventorySchema;

    constructor(player: Player, room: GameRoom) {
        this.player = player;
        this.room = room;
        this.inventory = new InventorySchema(this.room.mapOptions);

        player.onMsg("DROP_ITEM", this.onDrop.bind(this));
        player.onMsg("SET_ACTIVE_INTERACTIVE_ITEM", this.onSetInteractive.bind(this));
        player.onMsg("FIRE", this.onFire.bind(this));
        player.onMsg("RELOAD", this.onReload.bind(this));
        player.onMsg("SET_INTERACTIVE_SLOTS_ORDER", this.setInteractiveSlotOrder.bind(this));
        player.onMsg("CONSUME", this.onConsume.bind(this));

        this.room.onRestore(this.restore.bind(this));
    }

    restore() {
        this.inventory.slots.clear();
        this.inventory.interactiveSlotsOrder.clear();
        this.inventory.interactiveSlotsOrder.push(1, 2, 3, 4, 5);
        this.inventory.activeInteractiveSlot = 0;
        for(let key of this.inventory.interactiveSlots.keys()) {
            this.inventory.interactiveSlots.set(key, new InteractiveSlotsItem());
        }
    }

    getActiveSlot() {
        return this.inventory.interactiveSlots.get(this.inventory.activeInteractiveSlot.toFixed());
    }

    getItemInfo(id: string) { return worldOptions.itemOptions.find((i: any) => i.id === id) }

    addItem(id: string, amount: number, currentClip?: number) {        
        let item = this.getItemInfo(id);
        if(!item) return;

        if(this.inventory.slots.has(id)) {
            this.inventory.slots.get(id).amount += amount;
        } else {
            let slot = new SlotsItem({ amount });
            this.inventory.slots.set(id, slot);
        }

        // if it's an interactive item put it in the interactive slots
        let slots = this.room.mapOptions.interactiveItemsSlots;

        if(item.type === "resource" || slots === 0) return 0;
        let maxStack = 1;
        if(item.type === "item") maxStack = item.maxStackSize;

        let remaining = amount;

        // attempt to stack the item first
        for(let i = 1; i <= slots && remaining > 0; i++) {
            let slot = this.inventory.interactiveSlots.get(i.toString());
            if(slot.itemId !== id) continue;
            
            if(slot.count < maxStack) {
                let transfer = Math.min(remaining, maxStack - slot.count);
                remaining -= transfer;
                slot.count += transfer;
            }
        }
        
        // put it in empty slots
        for(let i = 1; i <= slots && remaining > 0; i++) {
            let slot = this.inventory.interactiveSlots.get(i.toString());
            if(slot.itemId) continue;

            slot.itemId = id;
            if(item.type === "weapon" && item.weapon.type !== "melee") {
                let gadget = gadgetOptions[item.id];
                slot.currentClip = currentClip ?? gadget.clipSize;
                slot.clipSize = gadget.clipSize;
            }

            let transfer = Math.min(remaining, maxStack);
            remaining -= transfer;
            slot.count = transfer;
        }

        // if there are any items that can't be added remove them from the count
        if(remaining > 0) {
            this.inventory.slots.get(id).amount -= remaining;
        }

        return remaining;
    }

    removeItemAmount(id: string, amount: number) {
        if(!this.inventory.slots.has(id)) return false;
        if(this.inventory.slots.get(id).amount < amount) return false;

        this.inventory.slots.get(id).amount -= amount;
        if(this.inventory.slots.get(id).amount <= 0) {
            this.inventory.slots.delete(id);
        }

        return true;
    }
    
    removeItemSlot(amount: number, slotNum: number) {
        let slot = this.inventory.interactiveSlots.get(slotNum.toString());
        if(slot.count < amount) return false;

        slot.count -= amount;
        this.removeItemAmount(slot.itemId, amount);

        if(slot.count <= 0) {
            slot.itemId = "";
            slot.count = 0;

            if(this.inventory.activeInteractiveSlot === slotNum) {
                this.inventory.activeInteractiveSlot = 0;
            }
        }

        return true;
    }

    onDrop({ amount, itemId, interactiveSlotNumber }: DropItemOptions) {
        let useCurrentClipCount = false;
        let currentClip = 0;

        if(interactiveSlotNumber) {
            let item = this.inventory.interactiveSlots.get(interactiveSlotNumber.toString());
            if(!item) return;
            
            itemId = item.itemId;

            if(item.clipSize > 0) {
                useCurrentClipCount = true;
                currentClip = item.currentClip;
            }

            if(!this.removeItemSlot(amount, interactiveSlotNumber)) return;
        } else {
            if(!this.removeItemAmount(itemId, amount)) return;
        }

        let x = this.player.player.x;
        let y = this.player.player.y + 30;

        this.room.devices.createDevice({
            id: crypto.randomUUID(),
            x,
            y,
            depth: y,
            layer: "DepthSortedCharactersAndDevices",
            deviceId: "droppedItem",
            options: {
                amount,
                itemId,
                placedByCharacterId: this.player.id,
                useCurrentClipCount,
                currentClip,
                useCurrentDurability: false,
                currentDurability: 0,
                decay: 0,
                originX: x,
                originY: y
            }
        }, true);
    }

    onSetInteractive({ slotNum }: { slotNum: number }) {
        if(slotNum < 0 || slotNum > this.room.mapOptions.interactiveItemsSlots) return;
        this.inventory.activeInteractiveSlot = slotNum;
    }

    onFire(options: FireOptions) {
        let activeItem = this.getActiveSlot();
        if(!activeItem) return;

        let gadget = gadgetOptions[activeItem.itemId];
        let item = this.getItemInfo(activeItem.itemId);
        if(!gadget || item.type !== "weapon") return;

        if(gadget.clipSize) {
            if(activeItem.currentClip <= 0 || activeItem.waiting) return;

            // consume one shot
            activeItem.currentClip -= 1;
        }

        this.room.projectiles.fire({
            x: options.x,
            y: options.y,
            angle: options.angle,
            maxDistance: gadget.distance,
            startDistance: item.weapon.shared.startingProjectileDistanceFromCharacter,
            speed: gadget.speed,
            radius: gadget.radius,
            appearance: item.weapon.appearance,
            ownerId: this.player.id,
            ownerTeamId: this.player.player.teamId,
            damage: gadget.damage * this.player.player.projectiles.damageMultiplier
        });
    }

    onReload() {
        let activeItem = this.getActiveSlot();
        if(!activeItem || activeItem.currentClip === activeItem.clipSize || activeItem.waiting) return;

        let gadget = gadgetOptions[activeItem.itemId];
        if(!gadget || !gadget.clipSize) return;

        let newClip = activeItem.clipSize;

        // confirm that the player has the needed items if infinite ammo is disabled
        if(!this.room.mapOptions.infiniteAmmo) {
            let item = this.getItemInfo(activeItem.itemId);
            if(item.type !== "weapon" || item.weapon.type !== "bullet") return;

            let ammoId = item.weapon.bullet.ammoItemId;
            let amount = this.inventory.slots.get(ammoId)?.amount ?? 0;

            if(amount === 0) return;
            let consume = Math.min(activeItem.clipSize - activeItem.currentClip, amount);
            newClip = activeItem.currentClip + consume;

            this.removeItemAmount(ammoId, consume);
        }

        // temporarily disable the item
        this.startWait({
            slot: activeItem,
            duration: gadget.reloadTime,
            onComplete: () => {
                activeItem.currentClip = newClip;
            }
        });
    }

    startWait({ slot, duration, onComplete, moveCancels }: WaitOptions) {
        slot.waiting = true;
        slot.waitingStartTime = Date.now();
        slot.waitingEndTime = Date.now() + duration;

        let timeout = setTimeout(() => {
            slot.waiting = false;
            onComplete?.();
            if(moveCancels) this.player.offMove(cancel);
        }, duration);

        const cancel = () => {
            clearTimeout(timeout);
            slot.waiting = false;
            this.player.offMove(cancel);
        }
        
        if(moveCancels) this.player.onMove(cancel);
    }

    setInteractiveSlotOrder(message: { order: number[] }) {
        if(!message?.order || !Array.isArray(message.order)) return;
        if(message.order.length !== 5) return;
        for(let i = 1; i <= 5; i++) {
            if(!message.order.includes(i)) return;
        }

        this.inventory.interactiveSlotsOrder.clear();
        this.inventory.interactiveSlotsOrder.push(...message.order);
    }

    onConsume(message: { x: number, y: number }) {
        let slot = this.getActiveSlot();
        let item = this.getItemInfo(slot.itemId);

        if(slot.count <= 0 || !item || item.type !== "item") return;
        let health = this.player.player.health;
        
        // currently onConsume is only used by Gimkit to place terrain, but it appears as if
        // there is room to add other functionality to it
        if(item.consumeType === "buildTerrain") {
            if(typeof message?.x !== "number" || typeof message?.y !== "number") return;

            this.removeItemSlot(this.inventory.activeInteractiveSlot, 1);
    
            this.room.terrain.placeTile(6, message.x, message.y, item.terrainId, true);
        } else if(item.id === "shield-can") {
            // TODO: Move this elsewhere
            if(health.health === health.maxHealth) {
                this.player.client.send("CONSUME_ITEM_ERROR", {
                    slot: this.inventory.activeInteractiveSlot,
                    errorMessage: "Shield Can Limit Reached"
                });
                return;
            }

            this.startWait({
                slot: this.getActiveSlot(),
                duration: 3000,
                onComplete: () => health.shield = Math.min(health.maxShield, health.shield + 25),
                moveCancels: true
            });
        } else if(item.id === "medpack") {
            if(health.health === health.maxHealth) {
                this.player.client.send("CONSUME_ITEM_ERROR", {
                    slot: this.inventory.activeInteractiveSlot,
                    errorMessage: "Already At Full Health"
                });
                return;
            }

            this.startWait({
                slot: this.getActiveSlot(),
                duration: 6300,
                onComplete: () => health.health = health.maxHealth,
                moveCancels: true
            });
        }
    }
}
