import { GameRoom } from "../colyseus/room.js";
import Player from "../objects/player.js";
import { Block, CustomBlock } from "../types.js";
import { isPrime, random } from "../utils.js";

export function runBlock(block: Block, custom: Record<string, CustomBlock>, room: GameRoom, player: Player) {
    if(!block) return;

    const run = (name: string) => {
        let toRun = block.inputs?.[name]?.block;
        if(!toRun) return;
        return runBlock(toRun, custom, room, player)
    }

    let customBlock = custom[block.type];
    if(customBlock) {
        // there's never a result if there's a next block
        let result = customBlock(run, block, room, player);

        if(block.next) runBlock(block.next.block, custom, room, player);

        return result;
    }

    // I sincerely apologize for what follows
    switch(block.type) {
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
            let text = run("add_activity_feed_item_for_everyone")
            room.broadcast("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "add_activity_feed_item_for_triggering_player": {
            let text = run("add_activity_feed_item_for_triggering_player");
            player.client.send("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "add_activity_feed_item_for_game_host": {
            let text = run("add_activity_feed_item_for_game_host");
            room.host.client.send("ACTIVITY_FEED_MESSAGE", { id: crypto.randomUUID(), message: text });
            break;
        }
        case "current_character_team_number":
            break;
        case "triggering_player_score":
            break;
        case "get_team_score":
            break;
        case "is_a_live_game":
            return true;
        case "is_an_assignment":
            return false;
        case "seconds_into_game":
            break;
        case "controls_if":
            let cond = run("IF0");
            if(cond) run("DO0");
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
            let text1 = run("ADD0");
            let text2 = run("ADD1");
            return text1 + text2;
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
                if(op1 === "FROM_START") start = num + 1;
                else if(op1 === "FROM_END") start = text.length - op1;
            }
            if(op2 !== "LAST") {
                let num = run("AT2");
                if(op1 === "FROM_START") end = num + 1;
                else if(op1 === "FROM_END") end = text.length - op1;
            }

            return text.slice(start, end);
        }
        case "text_charAt": {
            let text = run("VALUE");
            let op = block.fields.WHERE;
            
            if(op === "FROM_START") {
                let index = run("AT");
                return text.charAt(index + 1);
            } else if(op === "FROM_END") {
                let index = run("AT");
                return text.charAt(-index);
            } else if(op === "FIRST") return text.charAt(0);
            else if(op === "LAST") return text.charAt(-1);
            else if(op === "RANDOM") return text.charAt(random(1, text.length) - 1);
        }
        case "text_indexOf": {
            let text = run("VALUE");
            let find = run("FIND");
            let op = block.fields.END;

            if(op === "FIRST") return text.indexOf(find);
            else if(op === "LAST") return text.lastIndexOf(find);
        }
    }

    if(block.next) {
        runBlock(block.next.block, custom, room, player);
    }
}