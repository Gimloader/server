import { afterAll, beforeAll, beforeEach } from "bun:test";
import { ColyseusTestServer, boot } from "@colyseus/testing";
import app from '../src/colyseus/app.config';
import Matchmaker from "../src/net/matchmaker";
import MapData from "../src/net/mapData";
import { generateGameCode } from "../src/utils";
import RAPIER from "@dimforge/rapier2d-compat";
import { Room } from "colyseus.js";

export let colyseus: ColyseusTestServer;
export let client: Room;
await RAPIER.init();

MapData.init();

let intentId = crypto.randomUUID();
Matchmaker.games.push({
    intentId,
    roomId: crypto.randomUUID(),
    clientIntents: new Map(),
    mapId: MapData.maps[0].mapId,
    code: generateGameCode()
});

beforeAll(async () => colyseus = await boot(app));
afterAll(async () => await colyseus.shutdown());
beforeEach(async () => {
    await colyseus.cleanup();
    client = await colyseus.sdk.joinOrCreate("MapRoom", {
        intentId
    });
});