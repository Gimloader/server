import { physicsScale, tileSize } from "../consts";
import RAPIER from "@dimforge/rapier2d-compat";
import { GameRoom } from "./room";
import type { MapInfo, TileInfo } from "$types/map";

export default class TileManager {
    map: MapInfo;
    tiles: Record<string, TileInfo>;
    room: GameRoom;
    
    constructor(map: MapInfo, room: GameRoom) {
        this.map = map;
        this.tiles = this.map.tiles;
        this.room = room;

        this.createHitboxes();
    }

    tileCoords(coords: string) {
        return coords.split("_").map((c) => parseInt(c));
    }

    getInitialMessage() {
        let terrains: string[] = [];
        let tiles: number[][] = [];

        let added = new Set<string>();
        for(let coords in this.tiles) {
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
            tiles.push([x, y, terrainIndex, tile.collides ? 1 : 0, tile.depth, lengthX, lengthY]);
        }

        return {
            added: { terrains, tiles },
            initial: true,
            removedTiles: [],
            updateId: 0
        }
    }

    createHitboxes() {
        for(let coords in this.tiles) {
            let [tX, tY] = this.tileCoords(coords);
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

            let tile = this.tiles[coords];
            tile.rb = rb;
            tile.collider = collider;
        }
    }
}