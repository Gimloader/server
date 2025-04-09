import type { Client } from "colyseus";
import type { GameRoom } from "../../colyseus/room";
import { CollisionGroups, createCollisionGroup, degToRad, randomItem } from "../../utils";
import { CharactersItem } from "../../colyseus/schema";
import { defaultPhysicsState, physicsConsts, physicsScale, worldOptions } from "../../consts";
import RAPIER from "@dimforge/rapier2d-compat";
import Inventory from "./inventory";
import { EventEmitter } from "node:stream";
import type { Cosmetics } from "$types/schema";
import type { PhysicsObjects, PhysicsState } from "$types/physics";

type MsgCallback = (message: any) => void;

export default class Player {
    room: GameRoom;
    client: Client;
    id: string;
    name: string;
    cosmetics: Cosmetics;
    player: CharactersItem;
    physicsObjects: PhysicsObjects;
    physicsState: PhysicsState = defaultPhysicsState;
    inventory: Inventory;
    messageEvents = new EventEmitter();
    isHost = false;
    
    constructor(room: GameRoom, client: Client, id: string, name: string, cosmetics: Cosmetics) {
        this.room = room;
        this.client = client;
        this.id = id;
        this.name = name;
        this.cosmetics = cosmetics;

        this.init();

        this.onMsg("INPUT", this.onInput.bind(this));
        this.onMsg("AIMING", ({ angle }: { angle: number }) => {
            this.player.projectiles.aimAngle = angle;
        });

        this.room.onStart(this.moveToSpawnpointBound);
        this.room.onRestore(this.moveToSpawnpointBound);
    }

    onMsg(type: string, callback: MsgCallback) {
        this.messageEvents.on(type, callback);
    }

    offMsg(type: string, callback: MsgCallback) {
        this.messageEvents.off(type, callback);
    }

    init() {
        let { x, y } = this.getSpawnpoint();

        this.inventory = new Inventory(this, this.room);

        this.player = new CharactersItem({
            id: this.id,
            x, y,
            name: this.name,
            infiniteAmmo: this.room.mapSettings.infiniteAmmo,
            cosmetics: this.cosmetics,
            inventory: this.inventory.inventory
        });
        this.room.state.characters.set(this.id, this.player);

        // send initial packets
        this.client.send("AUTH_ID", this.id);
        this.client.send("MY_TEAM", "__NO_TEAM_ID");

        // Unsure what these are for, but the client wants them
        this.client.send("MEMORY_COSTS_AND_LIMITS", [
            100000, 500, 3, 10, 10, 2, 10, 999999999999,
            2500, 5000, 999999, 999999999999, 75, 6
        ]);

        this.client.send("INFO_BEFORE_WORLD_SYNC", { x, y });

        // TODO: Only send needed world options
        this.client.send("WORLD_OPTIONS", worldOptions);

        let capsuleSize = this.room.map.mapStyle === "platformer" ? physicsConsts.capsule.platformer : physicsConsts.capsule.topDown;

        // create the player's rigidbody
        let rbDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x / physicsScale, y / physicsScale);
        let rb = this.room.world.createRigidBody(rbDesc);
        let colliderDesc = RAPIER.ColliderDesc.capsule(capsuleSize.height, capsuleSize.radius);
        colliderDesc.setCollisionGroups(createCollisionGroup({
            belongs: [CollisionGroups.characterMainBody],
            collidesWith: [CollisionGroups.staticWorldCollider, CollisionGroups.inactiveStaticWorldCollider]
        }));
        let collider = this.room.world.createCollider(colliderDesc, rb);
        let controller = this.room.world.createCharacterController(physicsConsts.controllerOffset);
        controller.setMaxSlopeClimbAngle(degToRad(999999999));
        controller.setMinSlopeSlideAngle(degToRad(999999999));

        if(this.room.map.mapStyle === "platformer") {
            controller.setUp(new RAPIER.Vector2(0, -1));
            controller.setMaxSlopeClimbAngle(degToRad(physicsConsts.climbAngle));
            controller.setMinSlopeSlideAngle(degToRad(physicsConsts.slideAngle));
            controller.enableAutostep(physicsConsts.autoStep.maxHeight, physicsConsts.autoStep.minWidth, true);
            controller.enableSnapToGround(physicsConsts.groundSnapHeight);
        }

        controller.setCharacterMass(500);

        rb.setRotation(degToRad(capsuleSize.angle), true);
        this.physicsObjects = { controller, rb, collider };

        this.player.completedInitialPlacement = true;
    }

    syncPhysics(teleport: boolean) {
        this.client.send("PHYSICS_STATE", {
            x: this.player.x,
            y: this.player.y,
            teleport,
            physicsState: JSON.stringify(this.physicsState)
        });
    }

    getSpawnpoint() {
        let phase = this.room.state.session.phase;
        let spawnpadPhase = phase === "preGame" ? "Pre-Game" : "Game";
        let spawnPads = this.room.devices.getAllByDeviceId("characterSpawnPad");
        spawnPads = spawnPads.filter((s) => s.options.phase === spawnpadPhase || s.options.phase === "All");
        
        let x = 16000, y = 16000;
        if(spawnPads.length > 0) {
            let pad = randomItem(spawnPads);
            x = pad.x;
            y = pad.y;
        }

        return { x, y }
    }

    moveToSpawnpointBound = this.moveToSpawnpoint.bind(this);
    moveToSpawnpoint() {
        let { x, y } = this.getSpawnpoint();

        this.player.x = x;
        this.player.y = y;
        this.physicsObjects.rb.setTranslation({ x, y }, true);
        this.syncPhysics(true);
    }

    leaveGame() {
        this.room.state.characters.delete(this.id);
        this.room.offStart(this.moveToSpawnpointBound);
        this.room.offRestore(this.moveToSpawnpointBound);
    }

    onInput(message: number[]) {
        let [packetId, jumped, angle, x, y, moveSpeed, teleportCount, lastTerrainUpdate] = message;

        this.physicsObjects.rb.setTranslation({ x, y }, true);

        // TODO: Actually validate movement
        this.physicsObjects.controller.computeColliderMovement(this.physicsObjects.collider, { x: 0, y: 0.01 });
        this.room.world.step();

        let grounded = this.physicsObjects.controller.computedGrounded();

        this.player.physics.isGrounded = grounded;
        this.player.x = x * physicsScale;
        this.player.y = y * physicsScale;
    }
}