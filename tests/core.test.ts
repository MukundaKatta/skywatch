import { describe, it, expect } from "vitest";
import { Skywatch } from "../src/core.js";
describe("Skywatch", () => {
  it("init", () => { expect(new Skywatch().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Skywatch(); await c.manage(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Skywatch(); await c.manage(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
