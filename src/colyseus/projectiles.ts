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

interface Projectile {
    id: string;
    x: number;
    y: number;
    velocity: RAPIER.Vector2;
    distance: number;
    startTime: number;
    endTime: number;
    shape: RAPIER.Shape;
}

export default class ProjectileManager {
    room: GameRoom;
    added: ProjectileAdded[] = [];
    projectiles: Projectile[] = [];
    stepInterval: Timer;

    constructor(room: GameRoom) {
        this.room = room;

        this.stepInterval = setInterval(this.step.bind(this), 1000 / 30);
    }

    dispose() {
        clearImmediate(this.stepInterval);
    }

    fire(info: ProjectileInfo) {
        let start = {
            x: info.x / physicsScale + Math.cos(info.angle) * info.startDistance,
            y: info.y / physicsScale + Math.sin(info.angle) * info.startDistance
        }

        // calculate if we hit any static objects
        let shape = new RAPIER.Ball(info.radius);
        let velocity = angleToVector(info.angle);
        let hit = this.room.world.castShape(start, 0, velocity, shape, info.maxDistance, true);

        let distance: number;
        if(hit) distance = hit.toi;
        else distance = info.maxDistance;

        let end = {
            x: start.x + velocity.x * distance,
            y: start.y + velocity.y * distance
        };
        let time = distance / info.speed;

        let id = crypto.randomUUID();
        let startTime = Date.now();
        let endTime = startTime + time;

        this.added.push({
            id: crypto.randomUUID(),
            startTime,
            endTime,
            start,
            end,
            radius: info.radius,
            appearance: info.appearance,
            ownerId: info.ownerId,
            ownerTeamId: info.ownerTeamId,
            damage: info.damage
        });

        let projectile: Projectile = {
            id,
            ...start,
            velocity,
            distance,
            startTime,
            endTime,
            shape
        }

        this.projectiles.push(projectile);

        this.startBroadcast();
    }

    step() {
        let now = Date.now(); 
        
        for(let i = 0; i < this.projectiles.length; i++) {
            let projectile = this.projectiles[i];

            const elapsed = now - projectile.startTime;
            const factor = elapsed / (projectile.endTime - projectile.startTime);
            const distance = factor * projectile.distance;

            let hit = this.room.world.castShape({
                x: projectile.x,
                y: projectile.y
            }, 0, projectile.velocity, projectile.shape, distance, true);

            projectile.x += projectile.velocity.x * factor;
            projectile.y += projectile.velocity.y * factor;

            if(factor > 1) {
                this.projectiles.splice(i, 1);
                i--;
            }

            if(!hit) continue;

            // TODO: Handle collision
        }
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