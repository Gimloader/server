import { GameRoom } from "../colyseus/room";

export default class PluginApi {
    constructor(public room: GameRoom) {}
}