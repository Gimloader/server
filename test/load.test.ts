import { expect, test } from "bun:test";
import { client } from "./index";

test("Joining", async () => {
    expect(client.sessionId).toBeDefined();
});