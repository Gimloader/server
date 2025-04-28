import { physicsScale, tileSize, worldOptions } from "../consts";
import RAPIER from "@dimforge/rapier2d-compat";
import { GameRoom } from "./room";
import type { MapInfo, TileInfo } from "$types/map";
import { CollisionGroups, createCollisionGroup, staggered } from "../utils";

export default class TileManager {
    map: MapInfo;
    tiles: Map<string, TileInfo>;
    health = new Map<string, number>();
    room: GameRoom;
    updateId = 1;
    added = new Map<string, TileInfo>();
    removedTiles: string[] = [];
    modifiedHealth: number[][] = [];
    
    constructor(map: MapInfo, room: GameRoom) {
        this.map = map;
        this.tiles = new Map(Object.entries(this.map.tiles));
        this.room = room;

        this.createInitialHitboxes();
        
        this.room.onRestore(this.restore.bind(this));
    }

    tileCoords(coords: string) {
        return coords.split("_").map((c) => parseInt(c));
    }

    placeTile(depth: number, x: number, y: number, terrain: string, collides: boolean) {
        const coords = `${depth}_${x}_${y}`;
        if(this.tiles.has(coords)) return false;

        let info: TileInfo = { terrain, collides };
        this.tiles.set(coords, info);
        this.added.set(coords, info);

        // create a collider for the new tile
        if(collides) this.createHitbox(depth, x, y, info);
        
        this.startBroadcast();
    }

    removeTile(depth: number, x: number, y: number) {
        const coords = `${depth}_${x}_${y}`;
        let tile = this.tiles.get(coords);
        this.tiles.delete(coords);

        if(tile.collider) {
            this.room.projectiles.offHit(tile.collider);
            this.room.world.removeCollider(tile.collider, false);
            this.room.world.removeRigidBody(tile.rb);
        }

        this.removedTiles.push(`${depth}_${coords}`);

        this.startBroadcast();
    }

    restore() {
        this.added.clear();
        this.removedTiles = []
        this.modifiedHealth = [];
        this.health.clear();

        // add/replace any missing/incorrect tiles
        for(let coords in this.map.tiles) {
            let [depth, x, y] = this.tileCoords(coords);
            
            let mapTile = this.map.tiles[coords];
            let tile = this.tiles.get(coords);

            if(tile) {
                // remove the existing tile
                if(mapTile.collides !== tile.collides || mapTile.terrain !== tile.terrain) {
                    this.removeTile(depth, x, y);
                    this.placeTile(depth, x, y, mapTile.terrain, mapTile.collides);
                }
            } else {
                this.placeTile(depth, x, y, mapTile.terrain, mapTile.collides);
            }
        }

        for(let coords in this.tiles) {
            if(this.map.tiles[coords]) continue;
            let [depth, x, y] = this.tileCoords(coords);

            this.removeTile(depth, x, y);
        }
    }

    startBroadcast = staggered(this.broadcastChanges.bind(this));

    broadcastChanges() {
        let added = this.tilesToAdded(this.added);

        this.room.broadcast("TERRAIN_CHANGES", {
            added,
            initial: false,
            removedTiles: this.removedTiles,
            modifiedHealth: this.modifiedHealth,
            updateId: this.updateId++
        });

        this.added.clear();
        this.removedTiles = [];
        this.modifiedHealth = [];
    }

    tilesToAdded(tileInfo: Map<string, TileInfo>) {
        let terrains: string[] = [];
        let tiles: number[][] = [];

        let added = new Set<string>();
        for(let [coords, tile] of tileInfo) {
            if(added.has(coords)) continue;
            added.add(coords);

            let terrainIndex = terrains.indexOf(tile.terrain);
            if(terrainIndex === -1) {
                terrains.push(tile.terrain);
                terrainIndex = terrains.length - 1;
            }

            // get the horizontal and vertical length
            let lengthX = 0;
            let lengthY = 0;

            let [depth, x, y] = this.tileCoords(coords);
            const tileMatches = (x: number, y: number) => {
                let otherTile = this.tiles.get(`${depth}_${x}_${y}`);
                if(!otherTile) return;
                return (
                    otherTile.collides === tile.collides &&
                    otherTile.terrain === tile.terrain
                )
            }

            while(tileMatches(x + lengthX + 1, y)) {
                lengthX++;
                added.add(`${x + lengthX}_${y}`);
            }
            while(tileMatches(x, y + lengthY + 1)) {
                lengthY++;
                added.add(`${x}_${y + lengthY}`);
            }

            // [x, y, terrainIndex, collides, depth, lengthX, lengthY]
            let message = [x, y, terrainIndex, tile.collides ? 1 : 0, depth];
            if(lengthX > 0 || lengthY > 0) message.push(lengthX);
            if(lengthY > 0) message.push(lengthY);

            tiles.push(message);
        }

        return { terrains, tiles }
    }

    getInitialMessage() {
        let added = this.tilesToAdded(this.tiles);

        return {
            added,
            initial: true,
            removedTiles: [],
            updateId: 0
        }
    }

    createInitialHitboxes() {
        for(let [coords, info] of this.tiles) {
            if(!info.collides) continue;

            let [depth, tX, tY] = this.tileCoords(coords);
            this.createHitbox(depth, tX, tY, info);
        }
    }

    createHitbox(depth: number, tX: number, tY: number, info: TileInfo) {
        let x = (tX * tileSize + tileSize / 2) / physicsScale;
        let y = (tY * tileSize + tileSize / 2) / physicsScale;
        let width = tileSize / 2 / physicsScale;
        let height = tileSize / 2 / physicsScale;

        let rbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
        let colliderDesc = RAPIER.ColliderDesc.cuboid(width, height)
            .setRestitution(0)
            .setFriction(0)
            .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
            .setFriction(RAPIER.CoefficientCombineRule.Min)
            .setCollisionGroups(createCollisionGroup({
                belongs: [CollisionGroups.staticWorldCollider],
                collidesWith: [CollisionGroups.everything]
            }));

        let rb = this.room.world.createRigidBody(rbDesc);
        let collider = this.room.world.createCollider(colliderDesc, rb);

        info.rb = rb;
        info.collider = collider;

        this.room.projectiles.onHit(collider, ({ damage }) => {
            const coords = `${depth}_${tX}_${tY}`;
            let tile = this.tiles.get(coords);

            let terrain = worldOptions.terrainOptions.find(t => t.id === tile.terrain);
            if(!terrain.health) return;
            
            let currentHealth = this.health.get(coords) ?? terrain.health;
            let health = Math.max(0, currentHealth - damage);
        
            if(health > 0) {
                this.health.set(coords, health);
            } else {
                this.removeTile(depth, tX, tY);
                this.health.delete(coords);
            }
    
            // [x, y, depth, healthPercent, damage]
            this.modifiedHealth.push([ tX, tY, depth, health / terrain.health * 100, damage ]);
    
            this.startBroadcast();
        });
    }
}