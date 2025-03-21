import { GameRoom } from "../colyseus/room.js";
import Player from "../objects/player.js";
import { isPrime, random } from "../utils.js";

interface Block {
    type: string;
    id: string;
    inputs?: Record<string, any>;
    fields?: Record<string, any>;
    next?: { block: Block };
}

export function runBlock(block: Block, room: GameRoom, player: Player) {
    if(!block) return;

    // I sincerely apologize for what follows
    switch(block.type) {
        case "message_broadcaster":
            let channel = runBlock(block.inputs?.input_value?.block, room, player);
            if(channel) room.devices.triggerChannel(channel, player);
            break;
        case "set_property":
            break;
        case "get_property":
            break;
        case "current_character_name":
            return player.name;
        case "add_activity_feed_item_for_everyone":
            let text = runBlock(block.inputs.add_activity_feed_item_for_everyone.block, room, player)
            console.log("Activity Feed:", text);
            break;
        case "add_activity_feed_item_for_triggering_player":
            break;
        case "add_activity_feed_item_for_game_host":
            break;
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
            let cond = runBlock(block.inputs.IF0.block, room, player);
            if(cond) runBlock(block.inputs.DO0.block, room, player);
            break;
        case "logic_compare": {
            let a = runBlock(block.inputs.A.block, room, player);
            let b = runBlock(block.inputs.B.block, room, player);

            let op = block.fields.OP;
            if(op === "EQ") return a === b;
            else if(op === "NEQ") return a !== b;
            else if(op === "LT") return a < b;
            else if(op === "LTE") return a <= b;
            else if(op === "GT") return a > b;
            else if(op === "GTE") return a >= b;
        }
        case "logic_operation": {
            let a = runBlock(block.inputs.A.block, room, player);
            let b = runBlock(block.inputs.B.block, room, player);
            
            let op = block.fields.OP;
            if(op === "AND") return a && b;
            else if(op === "OR") return a || b;
        }
        case "logic_boolean":
            return block.fields.BOOL === "TRUE";
        case "math_number":
            return block.fields.NUM;
        case "math_arithmetic": {
            let a = runBlock(block.inputs.A.block, room, player);
            let b = runBlock(block.inputs.B.block, room, player);

            let op = block.fields.OP;
            if(op === "ADD") return a + b;
            else if(op === "MINUS") return a - b;
            else if(op === "MULTIPLY") return a * b;
            else if(op === "DIVIDE") return a / b;
            else if(op === "POWER") return a ** b;
        }
        case "math_single": {
            let num = runBlock(block.inputs.NUM.block, room, player);
            
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
            let num = runBlock(block.inputs.NUM.block, room, player);

            let op = block.fields.OP;
            if(op === "SIN") return Math.sin(num);
            else if(op === "COS") return Math.cos(num);
            else if(op === "TAN") return Math.tan(num);
            else if(op === "ASIN") return Math.asin(num);
            else if(op === "ACOS") return Math.acos(num);
            else if(op === "ATAN") return Math.atan(num);
        }
        case "math_number_property": {
            let num = runBlock(block.inputs.NUMBER_TO_CHECK.block, room, player);

            let op = block.fields.PROPERTY;
            if(op === "EVEN") return num % 2 == 0;
            else if(op === "ODD") return num % 2 == 1;
            else if(op === "PRIME") return isPrime(num);
            else if(op === "WHOLE") return num % 1 === 0;
            else if(op === "POSITIVE") return num >= 0;
            else if(op === "NEGATIVE") return num < 0;
            else if(op === "DIVISIBLE_BY") {
                let divisor = runBlock(block.inputs.DIVISOR, room, player);
                return num % divisor === 0;
            }
        }
        case "math_round": {
            let num = runBlock(block.inputs.NUM.block, room, player);
            let op = block.fields.OP;

            if(op === "ROUND") return Math.round(num);
            else if(op === "ROUNDUP") return Math.ceil(num);
            else if(op === "ROUNDDOWN") return Math.floor(num);
        }
        case "math_random_int":
            let from = runBlock(block.inputs.NUM.block, room, player);
            let to = runBlock(block.inputs.NUM.block, room, player);
            
            return random(from, to);
        case "text":
            return block.fields.TEXT;
        case "text_join":
            let text1 = runBlock(block.inputs.ADD0.block, room, player);
            let text2 = runBlock(block.inputs.ADD1.block, room, player);
            return text1 + text2;
        case "text_length": {
            let text = runBlock(block.inputs.VALUE.block, room, player);
            return text.length;
        }
        case "number_with_commas":
            let num = runBlock(block.inputs.convert_number_to_text_with_commas.block, room, player);
            return new Intl.NumberFormat("en-US").format(num);
        case "text_getSubstring": {
            let text = runBlock(block.inputs.STRING.block, room, player);
            let op1 = block.fields.WHERE1;
            let op2 = block.fields.WHERE2;

            let start = 0, end = text.length - 1;

            if(op1 !== "START") {
                let num = runBlock(block.inputs.AT1.block, room, player);
                if(op1 === "FROM_START") start = num + 1;
                else if(op1 === "FROM_END") start = text.length - op1;
            }
            if(op2 !== "LAST") {
                let num = runBlock(block.inputs.AT2.block, room, player);
                if(op1 === "FROM_START") end = num + 1;
                else if(op1 === "FROM_END") end = text.length - op1;
            }

            return text.slice(start, end);
        }
        case "text_charAt": {
            let text = runBlock(block.inputs.VALUE.block, room, player);
            let op = block.fields.WHERE;
            
            if(op === "FROM_START") {
                let index = runBlock(block.inputs.AT.block, room, player);
                return text.charAt(index + 1);
            } else if(op === "FROM_END") {
                let index = runBlock(block.inputs.AT.block, room, player);
                return text.charAt(-index);
            } else if(op === "FIRST") return text.charAt(0);
            else if(op === "LAST") return text.charAt(-1);
            else if(op === "RANDOM") return text.charAt(random(1, text.length) - 1);
        }
        case "text_indexOf": {
            let text = runBlock(block.inputs.VALUE.block, room, player);
            let find = runBlock(block.inputs.FIND.block, room, player);
            let op = block.fields.END;

            if(op === "FIRST") return text.indexOf(find);
            else if(op === "LAST") return text.lastIndexOf(find);
        }
    }

    if(block.next) {
        runBlock(block.next.block, room, player);
    }
}