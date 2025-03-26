import { GameRoom } from "../colyseus/room.js";
import Player from "../objects/player/player.js";
import { Block, CustomBlock } from "../types.js";
import { isPrime, random } from "../utils.js";

export function runBlock(block: Block, variables: Record<string, any>, custom: Record<string, CustomBlock>, room: GameRoom, player: Player) {
    if(!block) return;

    const run = (name: string, blockName = "block") => {
        let toRun = block.inputs?.[name]?.[blockName];
        if(!toRun) return;
        return runBlock(toRun, variables, custom, room, player)
    }

    let customBlock = custom[block.type];
    if(customBlock) {
        // there's never a result if there's a next block
        let result = customBlock({ run, block, room, player });

        if(block.next) runBlock(block.next.block, variables, custom, room, player);

        return result;
    }

    // I sincerely apologize for what follows
    typeSwitch: switch(block.type) {
        case "message_broadcaster":
            let channel = run("input_value");
            if(channel) room.devices.triggerChannel(channel, player);
            break;
        case "set_property": {
            let name = run("set_property");
            let value = run("value");
            room.devices.properties[name] = value;
            break;
        }
        case "get_property": {
            let name = run("get_property");
            return room.devices.properties[name];
        }
        case "current_character_name":
            return player.name;
        case "add_activity_feed_item_for_everyone": {
            let text = run("add_activity_feed_item_for_everyone");
            if(typeof text !== "string" || !text) break;
            room.broadcast("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "add_activity_feed_item_for_triggering_player": {
            let text = run("add_activity_feed_item_for_triggering_player");
            if(typeof text !== "string" || !text) break;
            player.client.send("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "add_activity_feed_item_for_game_host": {
            let text = run("add_activity_feed_item_for_game_host");
            if(typeof text !== "string" || !text) break;
            room.host.client.send("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "current_character_team_number":
            return player.player.teamId;
        case "triggering_player_score":
            return player.player.score;
        case "get_team_score":
            let teamId = run("get_score_of_team");
            return room.teams.scores[teamId] ?? 0;
        case "is_a_live_game":
            return true;
        case "is_an_assignment":
            return false;
        case "seconds_into_game":
            let elapsed = Date.now() - room.gameStarted;
            return Math.floor(elapsed / 1000);
        case "controls_if":
            let ifs = block.extraState?.elseIfCount ?? 0;
            ifs++;
            for(let i = 0; i < ifs; i++) {
                let cond = run(`IF${i}`);
                if(cond) {
                    run(`DO${i}`);
                    break typeSwitch;
                }
            }

            if(block.extraState?.hasElse) {
                run("ELSE");
            }

            break;
        case "logic_compare": {
            let a = run("A");
            let b = run("B");

            let op = block.fields.OP;
            if(op === "EQ") return a === b;
            else if(op === "NEQ") return a !== b;
            else if(op === "LT") return a < b;
            else if(op === "LTE") return a <= b;
            else if(op === "GT") return a > b;
            else if(op === "GTE") return a >= b;
        }
        case "logic_operation": {
            let a = run("A");
            let b = run("B");
            
            let op = block.fields.OP;
            if(op === "AND") return a && b;
            else if(op === "OR") return a || b;
        }
        case "logic_boolean":
            return block.fields.BOOL === "TRUE";
        case "math_number":
            return block.fields.NUM;
        case "math_arithmetic": {
            let a = run("A");
            let b = run("B");

            let op = block.fields.OP;
            if(op === "ADD") return a + b;
            else if(op === "MINUS") return a - b;
            else if(op === "MULTIPLY") return a * b;
            else if(op === "DIVIDE") return a / b;
            else if(op === "POWER") return a ** b;
        }
        case "math_single": {
            let num = run("NUM");
            
            let op = block.fields.OP;
            if(op === "ROOT") return Math.sqrt(num);
            else if(op === "ABS") return Math.abs(num);
            else if(op === "NEG") return -num;
            else if(op === "LN") return Math.log(num);
            else if(op === "LOG10") return Math.log10(num);
            else if(op === "EXP") return Math.exp(num);
            else if(op === "10^") return 10 ** num;
        }
        case "math_trig": {
            let num = run("NUM");

            let op = block.fields.OP;
            if(op === "SIN") return Math.sin(num);
            else if(op === "COS") return Math.cos(num);
            else if(op === "TAN") return Math.tan(num);
            else if(op === "ASIN") return Math.asin(num);
            else if(op === "ACOS") return Math.acos(num);
            else if(op === "ATAN") return Math.atan(num);
        }
        case "math_number_property": {
            let num = run("NUMBER_TO_CHECK");

            let op = block.fields.PROPERTY;
            if(op === "EVEN") return num % 2 == 0;
            else if(op === "ODD") return num % 2 == 1;
            else if(op === "PRIME") return isPrime(num);
            else if(op === "WHOLE") return num % 1 === 0;
            else if(op === "POSITIVE") return num >= 0;
            else if(op === "NEGATIVE") return num < 0;
            else if(op === "DIVISIBLE_BY") {
                let divisor = run("DIVISOR");
                return num % divisor === 0;
            }
        }
        case "math_round": {
            let num = run("NUM");
            let op = block.fields.OP;

            if(op === "ROUND") return Math.round(num);
            else if(op === "ROUNDUP") return Math.ceil(num);
            else if(op === "ROUNDDOWN") return Math.floor(num);
        }
        case "math_random_int":
            let from = run("FROM");
            let to = run("TO");
            
            return random(from, to);
        case "text":
            return block.fields.TEXT;
        case "text_join":
            let items = block.extraState?.itemCount ?? 2;
            let str = "";

            for(let i = 0; i < items; i++) {
                if(!block.inputs[`ADD${i}`]) continue;
                let text = run(`ADD${i}`);
                
                // No idea why Gimkit only shows undefined with 2 or less items
                if(items > 2 && typeof text === "undefined") continue;
                str += text;
            }

            return str;
        case "text_length": {
            let text = run("VALUE");
            return text.length;
        }
        case "number_with_commas":
            let num = run("convert_number_to_text_with_commas");
            return new Intl.NumberFormat("en-US").format(num);
        case "text_getSubstring": {
            let text = run("STRING");
            let op1 = block.fields.WHERE1;
            let op2 = block.fields.WHERE2;

            let start = 0, end = text.length - 1;

            if(op1 !== "START") {
                let num = run("AT1");
                if(num === 0) return "";
                if(op1 === "FROM_START") start = num - 1;
                else if(op1 === "FROM_END") start = text.length - num;
                if(start < 0) start = text.length + start;
            }
            if(op2 !== "LAST") {
                let num = run("AT2");
                if(op2 === "FROM_START") end = num;
                else if(op2 === "FROM_END") end = text.length - num + 1;
                if(end < 0) end = text.length + end;
            }

            return text.slice(start, end);
        }
        case "text_charAt": {
            let text = run("VALUE");
            let op = block.fields.WHERE;
            
            if(op === "FROM_START") {
                let index = run("AT");
                return text.charAt(index - 1);
            } else if(op === "FROM_END") {
                let index = run("AT");
                if(index <= 0) return text.charAt(-index);
                return text.charAt(text.length - index);
            } else if(op === "FIRST") return text.charAt(0);
            else if(op === "LAST") return text.charAt(text.length - 1);
            else if(op === "RANDOM") return text.charAt(random(1, text.length) - 1);
        }
        case "text_indexOf": {
            let text = run("VALUE");
            let find = run("FIND");
            let op = block.fields.END;

            if(op === "FIRST") return text.indexOf(find);
            else if(op === "LAST") return text.lastIndexOf(find);
        }
        case "variables_set": {
            let setVar = block.fields.VAR.id;
            let value = run("VALUE");
            variables[setVar] = value;
            break;
        }
        case "variables_get": 
            let getVar = block.fields.VAR.id;
            return variables[getVar];
        case "math_change": {
            let changeVar = block.fields.VAR.id;
            let delta = run("DELTA", "shadow");
            if(typeof variables[changeVar] !== "number") variables[changeVar] = 0;
            variables[changeVar] += delta;
            break;
        }
    }

    if(block.next) {
        runBlock(block.next.block, variables, custom, room, player);
    }
}