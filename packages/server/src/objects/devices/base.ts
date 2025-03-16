import RAPIER from "@dimforge/rapier2d-compat";
import { ColliderInfo, ColliderOptions, DeviceInfo } from "../../types.js";
import { degToRad } from "../../utils.js";
import { GameRoom } from "../../colyseus/room.js";
import { physicsScale } from "../../consts.js";
import Player from "../player.js";
import DeviceManager from "../../colyseus/deviceManager.js";

export default class BaseDevice {
    deviceManager: DeviceManager;
    room: GameRoom;

    id: string;
    x: number;
    y: number;
    depth: number;
    layer: string;
    deviceId: string;
    options: Record<string, any>;
    
    globalState: Record<string, any> = {};
    teamStates: Record<string, Record<string, any>> = {};
    playerStates: Record<string, Record<string, any>> = {};
    colliders: ColliderInfo[] = [];

    constructor(deviceManager: DeviceManager, room: GameRoom, info: DeviceInfo) {
        this.deviceManager = deviceManager;
        this.room = room;

        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.depth = info.depth;
        this.layer = info.layer;
        this.deviceId = info.deviceId;
        this.options = info.options;
    }

    init?(): void;
    onJoin?(player: Player): void;
    onMessage?(player: Player, key: string, data: any): void;

    updateGlobalState(key: string, value: string) {
        this.globalState[key] = value;
        this.deviceManager.addChange(this.id, `GLOBAL_${key}`, value);
    }
    
    updateTeamState(team: string, key: string, value: string) {
        if(!this.teamStates[team]) this.teamStates[team] = {};
        this.teamStates[team][key] = value;
        this.deviceManager.addChange(this.id, `TEAM_${team}_${key}`, value);
    }
    
    updatePlayerState(player: string, key: string, value: string) {
        if(!this.playerStates[player]) this.playerStates[player] = {};
        this.playerStates[player][key] = value;
        this.deviceManager.addChange(this.id, `PLAYER_${player}_${key}`, value);
    }

    createCollider(options: ColliderOptions) {
        let x = (options.x + this.x) / physicsScale;
        let y = (options.y + this.y) / physicsScale;

        let rbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
        let colliderDesc: RAPIER.ColliderDesc;

        if(options.type === "box") {
            rbDesc.setRotation(degToRad(options.angle));
    
            let width = options.width / 2 / physicsScale;
            let height = options.height / 2 / physicsScale;
            colliderDesc = RAPIER.ColliderDesc.cuboid(width, height);
        } else if(options.type === "circle") {
            let radius = options.r / physicsScale;
            colliderDesc = RAPIER.ColliderDesc.ball(radius);
        } else if(options.type === "capsule") {
            rbDesc.setRotation(degToRad(options.angle));

            let radius = options.r / physicsScale;
            let height = options.height / 2 / physicsScale;
            colliderDesc = RAPIER.ColliderDesc.capsule(height, radius);
        }
        colliderDesc.setRestitution(0);
        colliderDesc.setFriction(0);
        colliderDesc.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Multiply);
        colliderDesc.setFriction(RAPIER.CoefficientCombineRule.Multiply);

        let rb = this.room.world.createRigidBody(rbDesc);
        let collider = this.room.world.createCollider(colliderDesc, rb);
        
        this.colliders.push({ rb, collider });
    }
}