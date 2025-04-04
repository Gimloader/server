import type { ExperienceCategory, Map, MapMeta } from '$types/map';
import express from './express';
import fs from 'fs/promises';

export default class MapData {
    static maps: Map[] = [];

    static getById(id: string) { return this.maps.find((m) => m.id === id) }
    static getByMapId(id: string) { return this.maps.find((m) => m.mapId === id) }
    static getByPageId(id: string) { return this.maps.find((m) => m.pageId === id) }

    static warnNoMaps() {
        console.log('💡 There are currently no maps in the maps folder')
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
                    ...map.meta
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
        if(!fs.exists("./maps")) return this.warnNoMaps();

        let files = await fs.readdir('./maps');
        files = files.filter(name => name.endsWith(".json"));
        if(files.length === 0) return this.warnNoMaps();
        
        for(let file of files) {
            try {
                let json = await Bun.file(`./maps/${file}`).json();
                let mapMeta: MapMeta = json.meta ?? this.getMapMeta(file);
    
                this.maps.push({
                    file,
                    id: `gimloader-${crypto.randomUUID()}`,
                    mapId: crypto.randomUUID(),
                    pageId: crypto.randomUUID(),
                    meta: mapMeta
                });
            } catch {
                console.log(`❌ Error reading map ${file}`);
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