// This script needs to be run in the console before joining a creative map with Gimloader installed to work.
// It will partially work in published maps, but wires will not be exported.

(function() {
    let exported = {};
    window.exported = exported;

    let completed = 0;
    let tasks = 3;
    const advanceCompleted = () => {
        completed++;
        if(completed === tasks) {
            console.log("Map export completed!");
            console.log(exported);
        }
    }

    GL.net.onLoad("ExportMap", () => {
        // map style
        exported.mapStyle = GL.stores.session.mapStyle;

        // code grids
        let codeGrids = GL.net.room.state.world.devices.codeGrids;
        exported.codeGrids = {};

        for(let [deviceId, value] of codeGrids.entries()) {
            exported.codeGrids[deviceId] = {};
            for(let [id, grid] of value.items.entries()) {
                exported.codeGrids[deviceId][id] = {
                    json: JSON.parse(grid.json || '""'),
                    triggerType: grid.triggerType,
                    triggerValue: grid.triggerValue,
                    createdAt: grid.createdAt,
                    updatedAt: grid.updatedAt
                }
            }
        }

        advanceCompleted();
    });

    // terrain
    GL.net.once("TERRAIN_CHANGES", ({ added: { terrains, tiles } }) => {
        exported.tiles = {};

        for(let tile of tiles) {
            // lengthX and lengthY aren't height and width, it's two lines rather than a rectangle
            let [x, y, terrain, collides, depth, lengthX, lengthY] = tile;
            terrain = terrains[terrain];
            collides = collides === 1;

            let tileInfo = { terrain, collides };

            const setTile = (x, y) => {
                exported.tiles[`${depth}_${x}_${y}`] = tileInfo;
            }

            if(lengthX) {
                for(let ox = 1; ox <= lengthX; ox++) {
                    setTile(x + ox, y);
                }
            }
            
            if(lengthY) {
                for(let oy = 1; oy <= lengthY; oy++) {
                    setTile(x, y + oy);
                }
            }

            setTile(x, y);
        }

        advanceCompleted();
    });

    // devices
    GL.net.once("WORLD_CHANGES", (message) => {
        exported.devices = [];

        // devices
        let { addedDevices: { devices, values } } = message.devices;
        for(let device of devices) {
            let getValue = (index) => values[index];
            let [id, x, y, depth, layer, deviceId, options] = device;
            layer = getValue(layer);
            deviceId = getValue(deviceId);
            options = Object.fromEntries(options.map(([k, v]) => [getValue(k), getValue(v)]));
            exported.devices.push({ id, x, y, depth, layer, deviceId, options });
        }

        // wires
        if(message.wires) {
            exported.wires = message.wires.addedWires;
        } else {
            exported.wires = [];
            console.warn("Wires were not sent! This script only works when in your own creative map.")
        }

        advanceCompleted();
    });

    console.log("Waiting for map to load...");
})();