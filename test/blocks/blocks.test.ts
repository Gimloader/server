import { describe, expect, test } from "bun:test";
import { runBlock } from "../../src/blocks/runBlock";
import { player, room } from "..";
import { join } from "path";
import type { Block } from "$types/blocks";

describe("Blocks", async () => {
    let testJson = await Bun.file(join(__dirname, "testJson.json")).json();

    const run = (block: Block) => {
        let variables: Record<string, any> = {};
        runBlock(block, variables, {}, room, player);
        return variables;
    }

    test("Variables reset when incrementing after being a string", () => {
        expect(run(testJson.varReset).test).toBe(3);
    });
    
    test("If blocks", () => {
        expect(run(testJson.if).test).toBeDefined();
        expect(run(testJson.elif).test).toBeDefined();
        expect(run(testJson.else).test).toBeDefined();
    });

    test("Unset variables become undefined with <= 2 inputs", () => {
        expect(run(testJson.varUndefinedSmall).test).toBe("undefinedundefined");
        expect(run(testJson.varUndefinedLarge).test).toBe("");
    });

    const runSubstring = (start: number, end: number, where1 = "FROM_START", where2 = "FROM_START") => {
        let json = testJson.substring;
        let block = json.inputs.VALUE.block;
        block.inputs.AT1.block.fields.NUM = start;
        block.inputs.AT2.block.fields.NUM = end;
        block.fields.WHERE1 = where1;
        block.fields.WHERE2 = where2;
        
        return run(json).test;
    }

    test("Substring", () => {
        expect(runSubstring(0, 1)).toBe("");
        expect(runSubstring(0, 10)).toBe("");
        expect(runSubstring(-3, 25)).toBe("wxy");
        expect(runSubstring(1, -1)).toBe("abcdefghijklmnopqrstuvwxy");
        expect(runSubstring(1, 0)).toBe("");
        expect(runSubstring(1, 30)).toBe("abcdefghijklmnopqrstuvwxyz");
        expect(runSubstring(1, 2)).toBe("ab");
        expect(runSubstring(-3, 25, "FROM_END")).toBe("");
        expect(runSubstring(0, 3, "FROM_END")).toBe("");
        expect(runSubstring(1, 1, "FROM_START", "FROM_END")).toBe("abcdefghijklmnopqrstuvwxyz");
        expect(runSubstring(-3, 0, "FROM_START", "FROM_END")).toBe("wxyz");
        expect(runSubstring(1, -30, "FROM_START", "FROM_END")).toBe("abcdefghijklmnopqrstuvwxyz");
        expect(runSubstring(2, 2, "FROM_START", "FROM_END")).toBe("bcdefghijklmnopqrstuvwxy");
    });

    const runCharAt = (index: number, where = "FROM_START") => {
        let json = testJson.charAt;
        let block = json.inputs.VALUE.block;
        block.inputs.AT.block.fields.NUM = index;
        block.fields.WHERE = where;
        
        return run(json).test;
    }

    test("charAt", () => {
        expect(runCharAt(0)).toBe("");
        expect(runCharAt(1)).toBe("a")
        expect(runCharAt(-1)).toBe("")
        expect(runCharAt(30)).toBe("")
        expect(runCharAt(0, "FROM_END")).toBe("a")
        expect(runCharAt(1, "FROM_END")).toBe("f")
        expect(runCharAt(-1, "FROM_END")).toBe("b")
    });
});