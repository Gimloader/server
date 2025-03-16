import type { DeviceInfo, MapInfo } from "../types.js";
import { propOptions } from "../consts.js";
import { createValuesArray } from "../utils.js";
import { GameRoom } from "./room.js";
import BaseDevice from "../objects/devices/base.js";
import PropDevice from "../objects/devices/prop.js";
import QuestionerDevice from "../objects/devices/questioner.js";
import Player from "../objects/player.js";
import devices from "../objects/devices/devices.js";
import { Client } from "colyseus";

export default class DeviceManager {
    map: MapInfo;
    devices: BaseDevice[];
    room: GameRoom;
    resDevicesLoaded: () => void;
    devicesLoaded = new Promise<void>((res) => this.resDevicesLoaded = res);
    changes = new Map<string, Record<string, any>>();
    initialized = false;
    
    constructor(map: MapInfo, room: GameRoom) {
        this.map = map;
        this.room = room;
        this.devices = this.map.devices.map((d) => this.createDevice(d));
        this.room.onMessage("MESSAGE_FOR_DEVICE", this.onMessage.bind(this));

        let inits = this.devices.map((d) => Promise.resolve(d.init?.()));
        Promise.all(inits).then(() => {
            this.resDevicesLoaded()
            this.initialized = true;
        });
    }

    createDevice(info: DeviceInfo) {
        let Device: typeof BaseDevice = devices[info.deviceId] ?? BaseDevice;
        return new Device(this, this.room, info);
    }

    getDevices(type: string) {
        return this.devices.filter((d) => d.deviceId === type);
    }

    getDevice(type: string) {
        return this.devices.find((d) => d.deviceId === type);
    }

    getMapSettings() {
        let mapOptions = this.getDevice("mapOptions");
        return mapOptions.options;
    }

    getInitialMessage() {
        let [values, addValue] = createValuesArray<string>();
        let devices: any[] = [];

        let props: any[] = [];
        let propsSet: Set<string> = new Set();

        // [id, x, y, depth, layer, deviceId, options]
        for(let device of this.devices) {
            if(device.deviceId === "prop" && !propsSet.has(device.options.propId)) {
                let propId = device.options.propId;
                let prop = propOptions.find((p: any) => p.id === propId);
                props.push(prop);
                propsSet.add(propId);
            }

            let options = Object.entries(device.options).map(([key, val]) => [addValue(key), addValue(val)]);

            devices.push([
                device.id, device.x, device.y, device.depth,
                addValue(device.layer), addValue(device.deviceId), options
            ]);
        }

        return {
            devices: {
                addedDevices: {
                    values,
                    devices
                },
                initial: true,
                removedDevices: []
            },
            propsOptions: {
                addedPropsOptions: props,
                initial: true
            }
        }
    }

    getInitialChanges() {
        for(let device of this.devices) {
            for(let [key, value] of Object.entries(device.globalState)) {
                this.addChange(device.id, `GLOBAL_${key}`, value);
            }

            // TODO: Only send state updates that specific players need
            // Although even Gimkit doesn't bother with this
            for(let [id, state] of Object.entries(device.teamStates)) {
                for(let [key, value] of Object.entries(state)) {
                    this.addChange(device.id, `TEAM_${id}_${key}`, value);
                }
            }

            for(let [id, state] of Object.entries(device.playerStates)) {
                for(let [key, value] of Object.entries(state)) {
                    this.addChange(device.id, `PLAYER_${id}_${key}`, value);
                }
            }
        }

        let changes = this.getChanges(true);
        this.changes.clear();
        return changes;
    }

    broadcasting = false;

    addChange(deviceId: string, key: string, value: string) {
        if(!this.changes.has(deviceId)) this.changes.set(deviceId, {});

        this.changes.get(deviceId)[key] = value;
        if(!this.initialized) return;

        // automatically broadcast changes after one goaround of the event loop
        if(!this.broadcasting) {
            this.broadcasting = true;
            setTimeout(() => {
                this.broadcasting = false;
                this.broadcastChanges();
            }, 0);
        }
    }

    broadcastChanges() {
        let changes = this.getChanges();
        this.changes.clear();
        this.room.broadcast("DEVICES_STATES_CHANGES", changes);
    }

    getChanges(initial = false) {
        let [values, addValue] = createValuesArray<string>();
        let changes: [string, number[], any[]][] = [];

        for(let [id, stateChanges] of this.changes) {
            let keys: number[] = [];
            let values: any[] = [];

            for(let [key, value] of Object.entries(stateChanges)) {
                keys.push(addValue(key));
                values.push(value);
            }

            changes.push([id, keys, values]);
        }

        return {
            changes,
            initial,
            removedIds: [],
            values
        };
    }

    onJoin(player: Player) {
        for(let device of this.devices) {
            if(device.onJoin) device.onJoin(player);
        }
    }

    onMessage(client: Client, { deviceId, key, data }: { deviceId: string, key: string, data: any }) {
        let player = this.room.players.get(client);
        let device = this.devices.find(d => d.id === deviceId);
        device.onMessage?.(player, key, data);
    }
}