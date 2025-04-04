import { worldOptions } from "../src/consts";
import fs from 'fs';

let idMap = `export interface DeviceOptions {`;

let optionTypes = `export interface ItemListItem {
    itemId: string;
    amount: number;
    numParam: number;
}

export type ItemList = ItemListItem[];

export type Scope = "global" | "player" | "team";`

for(let device of worldOptions.deviceOptions) {
    let name = device.name.replaceAll(" ", "");
    let schema = JSON.parse(device.optionSchema);

    idMap += `\n    ${device.id}: ${name}Options;`;

    let deviceStr = `export interface ${name}Options {`
    let keysSeen = new Set<string>();

    for(let { key, option } of schema.options) {
        // For some reason Gimkit accidentally added a duplicate property on one device
        if(keysSeen.has(key)) continue;
        keysSeen.add(key);

        let type: string;

        switch(option.type) {
            case "numberInput":
                type = "number";
                break;
            case "textInput":
            case "terrainId":
            case "color":
            case "skinId":
            case "itemId":
                type = "string";
                break;
            case "itemsList":
                type = "ItemList";
                break;
            case "select":
                let valueType = typeof option.props.options[0].value;
                if(valueType !== "string") {
                    type = valueType;
                    break;
                }

                let choices: string[] = option.props.options.map((o: any) => `"${o.value}"`);
                type = choices.join(" | ");
                
                if(type === `"global" | "player" | "team"`) type = "Scope";
                if(type.includes(`"58" | "59" | "60"`)) type = "string";

                break;
            default:
                console.log(option)
                throw new Error(`Unable to parse option type "${option.type}"`);
        }

        deviceStr += `\n    ${key}: ${type};`
    }

    deviceStr += `\n}`;
    optionTypes += `\n\n${deviceStr}`;
}

idMap += `\n}`;
let result = `${idMap}\n\n${optionTypes}`;

fs.writeFileSync("./src/types/devices.ts", result);