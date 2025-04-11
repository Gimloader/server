import { physicsScale, tileSize } from "../consts";
import RAPIER from "@dimforge/rapier2d-compat";
import { GameRoom } from "./room";
import type { MapInfo, TileInfo } from "$types/map";
import { staggered } from "../utils";

export default class TileManager {
    map: MapInfo;
    tiles: Record<string, TileInfo>;
    room: GameRoom;
    added: Record<string, TileInfo> = {};
    updateId = 1;
    
    constructor(map: MapInfo, room: GameRoom) {
        this.map = map;
        this.tiles = this.map.tiles;
        this.room = room;

        this.createInitialHitboxes();
    }

    tileCoords(coords: string) {
        return coords.split("_").map((c) => parseInt(c));
    }

    placeTile(x: number, y: number, terrain: string, collides: boolean, depth: number) {
        if(this.tiles[`${x}_${y}`]) return false;

        let info: TileInfo = { terrain, depth, collides };
        this.tiles[`${x}_${y}`] = info;
        this.added[`${x}_${y}`] = info;

        // create a collider for the new tile
        if(collides) this.createHitbox(x, y, info);
        
        this.startBroadcast();
    }

    startBroadcast = staggered(this.broadcastChanges.bind(this));

    broadcastChanges() {
        let added = this.tilesToAdded(this.added);
        this.added = {};

        this.room.broadcast("TERRAIN_CHANGES", {
            added,
            initial: false,
            removedTiles: [],
            updateId: this.updateId++
        });
    }

    tilesToAdded(tileInfo: Record<string, TileInfo>) {
        let terrains: string[] = [];
        let tiles: number[][] = [];

        let added = new Set<string>();
        for(let coords in tileInfo) {
            if(added.has(coords)) continue;
            added.add(coords);

            let tile = this.tiles[coords];

            let terrainIndex = terrains.indexOf(tile.terrain);
            if(terrainIndex === -1) {
                terrains.push(tile.terrain);
                terrainIndex = terrains.length - 1;
            }

            // get the horizontal and vertical length
            let lengthX = 0;
            let lengthY = 0;

            let [x, y] = this.tileCoords(coords);
            const tileMatches = (x: number, y: number) => {
                let otherTile = this.tiles[`${x}_${y}`];
                if(!otherTile) return;
                return (
                    otherTile.collides === tile.collides &&
                    otherTile.depth == tile.depth &&
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
            let message = [x, y, terrainIndex, tile.collides ? 1 : 0, tile.depth];
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
        for(let coords in this.tiles) {
            let info = this.tiles[coords];
            if(!info.collides) continue;

            let [tX, tY] = this.tileCoords(coords);
            this.createHitbox(tX, tY, info);
        }
    }

    createHitbox(tX: number, tY: number, info: TileInfo) {
        let x = (tX * tileSize + tileSize / 2) / physicsScale;
        let y = (tY * tileSize + tileSize / 2) / physicsScale;
        let width = tileSize / 2 / physicsScale;
        let height = tileSize / 2 / physicsScale;

        let rbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
        let colliderDesc = RAPIER.ColliderDesc.cuboid(width, height);
        colliderDesc.setRestitution(0);
        colliderDesc.setFriction(0);
        colliderDesc.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min);
        colliderDesc.setFriction(RAPIER.CoefficientCombineRule.Min);

        let rb = this.room.world.createRigidBody(rbDesc);
        let collider = this.room.world.createCollider(colliderDesc, rb);

        info.rb = rb;
        info.collider = collider;
    }
}