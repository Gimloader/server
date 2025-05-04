import express from './net/express';
import Matchmaker from './net/matchmaker';
import config from '$config';
import RAPIER from "@dimforge/rapier2d-compat";
import MapData from './net/mapData';
import server from './colyseus/server';
import { success } from './utils';

server.listen(config.gamePort).then(() => success("Game server online"));
RAPIER.init();
Matchmaker.init();
MapData.init();

// add fallbacks for unimplemented routes
express.get("*", (req, res) => {
    console.log("Client requested missing route with GET:", req.url);
    res.status(501).send("Not implemented");
});
express.post("*", (req, res) => {
    console.log("Client requested missing route with POST:", req.url);
    res.status(501).send("Not implemented");
});