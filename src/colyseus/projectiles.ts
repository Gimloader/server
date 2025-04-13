import { Point, ProjectileAdded } from "$types/net";
import RAPIER from "@dimforge/rapier2d-compat";
import { physicsScale } from "../consts";
import type { GameRoom } from "./room";
import { angleToVector, staggered } from "../utils";

interface ProjectileInfo {
    x: number;
    y: number;
    angle: number;
    maxDistance: number;
    startDistance: number;
    speed: number;
    radius: number;
    appearance: string;
    ownerId: string;
    ownerTeamId: string;
    damage: number;
}

export default class ProjectileManager {
    room: GameRoom;
    added: ProjectileAdded[] = [];

    constructor(room: GameRoom) {
        this.room = room;
    }

    fire(info: ProjectileInfo) {
        let start = {
            x: info.x / physicsScale + Math.cos(info.angle) * info.startDistance,
            y: info.y / physicsScale + Math.sin(info.angle) * info.startDistance
        }

        // calculate if we hit any static objects
        let ray = new RAPIER.Ray(start, angleToVector(info.angle));
        let hit = this.room.world.castRay(ray, info.maxDistance, true);

        let distance: number;
        if(hit) distance = hit.toi;
        else distance = info.maxDistance;

        let end = ray.pointAt(distance);
        let time = distance / info.speed;

        this.added.push({
            id: crypto.randomUUID(),
            startTime: Date.now(),
            endTime: Date.now() + time,
            start,
            end,
            radius: info.radius,
            appearance: info.appearance,
            ownerId: info.ownerId,
            ownerTeamId: info.ownerTeamId,
            damage: info.damage
        });

        this.startBroadcast();
    }

    startBroadcast = staggered(this.broadcastChanges.bind(this));

    broadcastChanges() {
        this.room.broadcast("PROJECTILE_CHANGES", {
            added: this.added,
            hit: []
        });

        this.added = [];
    }
}