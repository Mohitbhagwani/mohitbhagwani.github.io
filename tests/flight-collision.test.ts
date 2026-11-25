import { describe, expect, it } from "vitest";
import { bounds, sweepKite } from "../src/world/flight-collision";

describe("kite collision hulls", () => {
  const roof = bounds("roof", [0, 5, -8], [8, 10, 6]);
  it("detects a fast flight through a building even when both ends are outside", () => {
    const hit = sweepKite([0, 7, 0], [0, 7, -16], [roof], 0.7);
    expect(hit?.normal).toEqual([0, 0, 1]);
    expect(hit?.fraction).toBeCloseTo(0.26875);
  });
  it("allows a path above the parapet and detects a dive into its top", () => {
    expect(sweepKite([0, 11, 0], [0, 11, -16], [roof], 0.7)).toBeNull();
    expect(sweepKite([0, 16, -8], [0, 5, -8], [roof], 0.7)?.normal).toEqual([
      0, 1, 0,
    ]);
  });
  it("returns the nearest solid and permits movement away from the surface", () => {
    const nearer = bounds("earlier roof", [0, 5, -2], [2, 10, 1]);
    expect(
      sweepKite([0, 4, 0], [0, 4, -15], [roof, nearer], 0.7)?.solid.name,
    ).toBe("earlier roof");
    expect(sweepKite([0, 4, -4.3], [0, 4, 0], [roof], 0.7)).toBeNull();
    expect(
      sweepKite([0, 4, -4.3], [0, 4, -7], [roof], 0.7)?.fraction,
    ).toBeCloseTo(0);
  });
});
