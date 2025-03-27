import { ExperienceCategory } from '../types';
import express from './express';
import fs from 'fs';

interface Map {
    file: string;
    id: string;
    mapId: string;
}

export default class MapData {
    static maps: Map[] = [];

    static getById(id: string) { return this.maps.find((m) => m.id === id) }
    static getByMapId(id: string) { return this.maps.find((m) => m.mapId === id) }

    static init() {
        let files = fs.readdirSync('./maps');
        files = files.filter(name => name.endsWith(".json"));
        
        for(let file of files) {
            this.maps.push({
                file,
                id: `gimloader-${crypto.randomUUID()}`,
                mapId: crypto.randomUUID()
            });
        }

        express.get("/api/experiences", (req, res) => {
            let category: ExperienceCategory = {
                _id: crypto.randomUUID(),
                name: "Custom",
                items: []
            }

            for(let map of this.maps) {
                category.items.push({
                    _id: map.id,
                    name: map.file.replace(".json", ""),
                    tagline: "A custom map from a Gimloader server!",
                    imageUrl: "/assets/map/gimloader/icon.svg",
                    source: "map",
                    pageId: crypto.randomUUID(),
                    mapId: map.mapId,
                    isPremiumExperience: false,
                    tag: "",
                    labels: {
                        c: "Unknown",
                        d: "Unknown",
                        s: "Unknown"
                    }
                });
            }

            res.json([ category ]);
        });

        express.post("/api/experience/map/hooks", (req, res) => {
            res.json({ hooks: [] });
        });
    }
}