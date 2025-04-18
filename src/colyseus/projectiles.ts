import { CharacterHit, Point, ProjectileAdded, ProjectileHit } from "$types/net";
import RAPIER from "@dimforge/rapier2d-compat";
import { physicsScale } from "../consts";
import type { GameRoom } from "./room";
import { angleToVector, CollisionGroups, createCollisionGroup, staggered } from "../utils";

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
    duration: number;
    endTime: number;
    shape: RAPIER.Shape;
    damage: number;
    ownerTeamId: string;
}

type OnHitCallback = (info: {
    damage: number;
    ownerTeamId: string;
}) => CharacterHit | void;

export default class ProjectileManager {
    room: GameRoom;
    added: ProjectileAdded[] = [];
    hits: ProjectileHit[] = [];
    projectiles: Projectile[] = [];
    stepInterval: Timer;
    lastUpdate = Date.now();
    onHitCallbacks = new Map<number, OnHitCallback>();

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
        let hit = this.room.world.castShape(
            start, 0, velocity, shape, info.maxDistance,
            true, null,
            createCollisionGroup({
                belongs: [CollisionGroups.everything],
                collidesWith: [CollisionGroups.staticWorldCollider]
            })
        );

        let distance = hit ? hit.toi : info.maxDistance;

        let end = {
            x: start.x + velocity.x * distance,
            y: start.y + velocity.y * distance
        };
        let time = distance / info.speed;

        let id = crypto.randomUUID();
        let startTime = Date.now();
        let endTime = startTime + time;

        this.added.push({
            id,
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
            duration: time,
            endTime,
            shape,
            damage: info.damage,
            ownerTeamId: info.ownerTeamId
        }

        this.projectiles.push(projectile);

        this.startBroadcast();
    }

    onHit(collider: RAPIER.Collider, callback: OnHitCallback) {
        this.onHitCallbacks.set(collider.handle, callback);
    }

    offHit(collider: RAPIER.Collider) {
        this.onHitCallbacks.delete(collider.handle);
    }

    step() {
        const now = Date.now();
        const elapsed = now - this.lastUpdate;
        this.lastUpdate = now;
        
        for(let i = 0; i < this.projectiles.length; i++) {
            let projectile = this.projectiles[i];

            const factor = elapsed / projectile.duration;
            const distance = factor * projectile.distance;

            let hit = this.room.world.castShape({
                x: projectile.x,
                y: projectile.y
            }, 0, projectile.velocity, projectile.shape, distance, true);

            let moveDistance = hit ? hit.toi : distance;
            projectile.x += projectile.velocity.x * moveDistance;
            projectile.y += projectile.velocity.y * moveDistance;

            if(hit || now > projectile.endTime) {
                this.projectiles.splice(i, 1);
                i--;
            }

            if(!hit) continue;

            // The hit happens a bit early, not sure why
            setTimeout(() => {
                let handle = hit.collider.handle;
                let callback = this.onHitCallbacks.get(handle)
                if(!callback) return;

                let hitInfo = callback({
                    damage: projectile.damage,
                    ownerTeamId: projectile.ownerTeamId
                });

                if(!hitInfo) return;
                this.hits.push({
                    id: projectile.id,
                    x: projectile.x,
                    y: projectile.y,
                    hits: [hitInfo]
                });

                this.broadcastChanges();
            }, 250);
        }
    }

    startBroadcast = staggered(this.broadcastChanges.bind(this));

    broadcastChanges() {
        this.room.broadcast("PROJECTILE_CHANGES", {
            added: this.added,
            hit: this.hits
        });

        this.hits = [];
        this.added = [];
    }
}