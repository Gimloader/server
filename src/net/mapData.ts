import type { ExperienceCategory, Map, MapInfo, MapMeta } from '$types/map';
import PluginManager from '../plugins';
import { error, formatList, info, success } from '../utils';
import express from './express';
import fs from 'fs/promises';
import { join } from 'node:path';
import { mapsPath } from '../consts';

export default class MapData {
    static maps: Map[] = [];

    static getById(id: string) { return this.maps.find((m) => m.id === id) }
    static getByMapId(id: string) { return this.maps.find((m) => m.mapId === id) }
    static getByPageId(id: string) { return this.maps.find((m) => m.pageId === id) }

    static warnNoMaps() {
        info('There are currently no maps in the maps folder');
    }

    static init() {
        this.readMaps();

        express.get("/api/experiences", (req, res) => {
            let category: ExperienceCategory = {
                _id: crypto.randomUUID(),
                name: "Custom",
                items: []
            }

            for(let map of this.maps) {
                category.items.push({
                    _id: map.id,
                    source: "map",
                    pageId: `gimloader/${map.pageId}`,
                    mapId: map.mapId,
                    isPremiumExperience: false,
                    name: map.meta.name,
                    tagline: map.meta.tagline,
                    imageUrl: map.meta.imageUrl,
                    tag: map.meta.tag,
                    labels: map.meta.labels
                });
            }

            res.json([ category ]);
        });

        express.post("/api/experience/map/hooks", (req, res) => {
            res.json({ hooks: [] });
        });

        express.get("/api/content/:id", (req, res) => {
            let map = this.getByPageId(req.params.id);
            let id = crypto.randomUUID();

            res.json({
                [id]: {
                    value: {
                        id,
                        version: 5,
                        type: "text",
                        properties: {
                            title: [
                                [
                                    map.meta.pageText
                                ]
                            ]
                        },
                        parent_table: "block",
                        alive: true
                    }
                },
                role: "reader"
            });
        });
    }

    static async readMaps() {
        if(!fs.exists(mapsPath)) await fs.mkdir(mapsPath);

        this.watchMaps();

        let files = await fs.readdir(mapsPath);
        files = files.filter(name => name.endsWith(".json"));
        if(files.length === 0) return this.warnNoMaps();
        
        for(let file of files) {
            await this.readMap(file);
        }

        success(`Loaded ${this.maps.length} map${this.maps.length > 1 ? 's' : ''}`)
    }

    static async readMap(file: string) {
        try {
            let json: MapInfo = await Bun.file(join(mapsPath, file)).json();
            let mapMeta = json.meta ?? this.getMapMeta(file);

            // confirm that we have all the needed map plugins
            if(json.requiredPlugins) {
                let missing: string[] = [];
                let id = file.replace(".json", "");

                for(let plugin of json.requiredPlugins) {
                    if(!PluginManager.pluginLoaded(plugin, id)) {
                        missing.push(plugin);
                    }
                }
            
                if(missing.length > 0) {
                    error(`The map "${id}" is missing the plugin${missing.length > 1 ? 's' : ''} ${formatList(missing)}`);
                    return;
                }
            }

            this.maps.push({
                file,
                id: `gimloader-${crypto.randomUUID()}`,
                mapId: crypto.randomUUID(),
                pageId: crypto.randomUUID(),
                meta: mapMeta
            });
        } catch {
            error(`Error reading map ${file}`);
        }
    }

    static async watchMaps() {
        const watcher = fs.watch(mapsPath);
        for await (const event of watcher) {
            let index = this.maps.findIndex(m => m.file === event.filename);

            if(event.eventType === "rename") {
                // create/remove the map
                if(index === -1) {
                    info(`Reading map ${event.filename}`);
                    await this.readMap(event.filename);
                } else {
                    error(`Deleting map ${this.maps[index].meta.name}`);
                    this.maps.splice(index, 1);
                }
            } else if(index !== -1) {
                // reload the map
                console.log(`🔄 Reloading map ${this.maps[index].meta.name}`);
                this.maps.splice(index, 1);
                this.readMap(event.filename);
            }
        }
    }

    static getMapMeta(file: string): MapMeta {
        return {
            name: file.replace(".json", ""),
            tagline: "A custom map from a Gimloader server!",
            imageUrl: "/assets/map/gimloader/icon.svg",
            tag: "",
            pageText: "This is a custom map!",
            labels: {
                c: "Unknown",
                d: "Unknown",
                s: "Unknown"
            }
        }
    }
}