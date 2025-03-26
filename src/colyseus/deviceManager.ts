import type { DeviceInfo, MapInfo } from "../types.js";
import { propOptions } from "../consts.js";
import { createValuesArray } from "../utils.js";
import { GameRoom } from "./room.js";
import BaseDevice from "../objects/devices/base.js";
import Player from "../objects/player/player.js";
import devices from "../objects/devices/index.js";
import { Client } from "colyseus";

export default class DeviceManager {
    map: MapInfo;
    devices: BaseDevice[] = [];
    room: GameRoom;
    resDevicesLoaded: () => void;
    devicesLoaded = new Promise<void>((res) => this.resDevicesLoaded = res);
    changes = new Map<string, Record<string, any>>();
    removedIds: string[] = [];
    properties: Record<string, any> = {};
    addedDevices: BaseDevice[] = [];
    removedDevices: string[] = [];
    initialized = false;
    
    constructor(map: MapInfo, room: GameRoom) {
        this.map = map;
        this.room = room;
        for(let device of this.map.devices) this.createDevice(device);

        // connect wires to the devices
        for(let wire of this.map.wires) {
            let device = this.getById(wire.startDevice);
            if(!device) continue;
            device.wires.push(wire);
        }

        this.room.onMsg("MESSAGE_FOR_DEVICE", this.onMessage.bind(this));
        this.room.onMsg("UPDATE_DEVICE_UI_PRESENCE", this.updateUI.bind(this));

        // setTimeout to avoid some jank with this.room being undefined
        let inits = this.devices.map((d) => Promise.resolve(d.init?.()));
        Promise.all(inits).then(() => {
            this.restore(true);
            this.resDevicesLoaded();
            this.initialized = true;
        });
    }

    getAllByDeviceId(type: string) { return this.devices.filter((d) => d.deviceId === type) };
    getByDeviceId(type: string) { return this.devices.find((d) => d.deviceId === type) };
    getById(id: string) { return this.devices.find((d) => d.id === id) };

    getMapSettings() {
        let mapOptions = this.getByDeviceId("mapOptions");
        return mapOptions.options;
    }

    restore(initial = false) {
        if(!initial) {
            this.removedIds = this.devices.map(d => d.id);
        }

        for(let device of this.devices) {
            device.restore?.();
        }

        this.properties = {};
    }

    broadcastingDevices = false;

    createDevice(info: DeviceInfo, init = false) {
        let Device: typeof BaseDevice = devices[info.deviceId] ?? BaseDevice;
        let device = new Device(this, this.room, info);
        this.devices.push(device);

        this.addedDevices.push(device);
        if(init) device.init?.();
        
        if(!this.initialized) return device;
        let changes = this.getStateAsChanges(device);
        for(let [key, value] of changes) this.addChange(device.id, key, value);
        this.startDeviceBroadcast();

        return device;
    }

    removeDevice(device: BaseDevice) {
        this.devices = this.devices.filter(d => d !== device);

        this.removedDevices.push(device.id);
        this.startDeviceBroadcast();

        // TODO: Clean up colliders, etc
    }

    startDeviceBroadcast() {
        if(!this.broadcastingDevices) {
            this.broadcastingDevices = true;
            setTimeout(() => {
                this.broadcastingDevices = false;
                this.broadcastDeviceChanges();
            }, 0);
        }
    }

    devicesToAdded(devices: BaseDevice[]) {
        let [values, addValue] = createValuesArray<string>();
        let added: any[] = [];

        for(let device of devices) {
            let options = Object.entries(device.options).map(([key, val]) => [addValue(key), addValue(val)]);

            added.push([
                device.id, device.x, device.y, device.depth,
                addValue(device.layer), addValue(device.deviceId), options
            ]);
        }

        return { values, devices: added }
    }

    broadcastDeviceChanges() {
        let addedDevices = this.devicesToAdded(this.addedDevices);

        let message = {
            devices: {
                addedDevices: addedDevices,
                initial: false,
                removedDevices: this.removedDevices
            }
        }

        this.addedDevices = [];
        this.removedDevices = [];
        this.room.broadcast("WORLD_CHANGES", message);
    }

    getInitialWorld() {
        let props: any[] = [];
        let propsSet: Set<string> = new Set();

        let addedDevices = this.devicesToAdded(this.devices);

        for(let device of this.devices) {
            if(device.deviceId === "prop" && !propsSet.has(device.options.propId)) {
                let propId = device.options.propId;
                let prop = propOptions.find((p: any) => p.id === propId);
                props.push(prop);
                propsSet.add(propId);
            }
        }

        return {
            devices: {
                addedDevices: addedDevices,
                initial: true,
                removedDevices: this.removedDevices
            },
            propsOptions: {
                addedPropsOptions: props,
                initial: true
            }
        }
    }

    getStateAsChanges(device: BaseDevice) {
        let changes: [string, any][] = [];
        
        for(let [key, value] of Object.entries(device.globalState)) {
            changes.push([`GLOBAL_${key}`, value]);
        }

        for(let [id, state] of Object.entries(device.teamStates)) {
            for(let [key, value] of Object.entries(state)) {
                changes.push([`TEAM_${id}_${key}`, value]);
            }
        }

        for(let [id, state] of Object.entries(device.playerStates)) {
            for(let [key, value] of Object.entries(state)) {
                changes.push([`PLAYER_${id}_${key}`, value]);
            }
        }

        return changes;
    }

    getInitialChanges() {
        let [values, addValue] = createValuesArray<string>();
        let deviceStates = new Map<string, Record<string, any>>();

        for(let device of this.devices) {
            for(let [key, value] of this.getStateAsChanges(device)) {
                if(!deviceStates.has(device.id)) deviceStates.set(device.id, {});
                deviceStates.get(device.id)[key] = value;
            }
        }

        let changes: [string, number[], any[]][] = [];

        for(let [id, states] of deviceStates) {
            let keys: number[] = [];
            let values: any[] = [];
    
            for(let [key, value] of Object.entries(states)) {
                keys.push(addValue(key));
                values.push(value);
            }
    
            changes.push([id, keys, values]);
        }

        return {
            changes,
            initial: true,
            removedIds: [],
            values
        }
    }

    broadcastingState = false;

    addChange(deviceId: string, key: string, value: string) {
        if(!this.changes.has(deviceId)) this.changes.set(deviceId, {});

        this.changes.get(deviceId)[key] = value;
        if(!this.initialized) return;

        // automatically broadcast changes after one goaround of the event loop
        if(!this.broadcastingState) {
            this.broadcastingState = true;
            setTimeout(() => {
                this.broadcastingState = false;
                this.broadcastChanges();
            }, 0);
        }
    }

    broadcastChanges() {
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

        let message = {
            changes,
            initial: false,
            removedIds: this.removedIds,
            values
        }

        this.changes.clear();
        this.removedIds = [];
        this.room.broadcast("DEVICES_STATES_CHANGES", message);
    }

    onJoin(player: Player) {
        for(let device of this.devices) {
            if(device.onJoin) device.onJoin(player);
        }
    }

    triggerChannel(channel: string, player: Player) {
        if(!channel) return;
        
        for(let device of this.devices) {
            device.onChannel?.(channel, player);
            device.triggerBlock("channel_radio", player, channel);
        }
    }

    onMessage(player: Player, { deviceId, key, data }: { deviceId: string, key: string, data: any }) {
        let device = this.devices.find(d => d.id === deviceId);
        if(!device) return;

        device.onMessage?.(player, key, data);
    }

    updateUI(player: Player, { action, deviceId }: { action: string, deviceId: string }) {
        let device = this.devices.find(d => d.id === deviceId);
        if(!device) return

        if(action === "OPEN") {
            device.onOpen?.(player);
            player.player.openDeviceUI = deviceId;
        } else {
            device.onClose?.(player);
            player.player.openDeviceUI = "";
        }
        player.player.openDeviceUIChangeCounter++;
    }
}