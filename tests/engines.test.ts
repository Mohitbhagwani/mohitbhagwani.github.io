import { describe, it, expect } from "vitest";
import {
  paymentReducer,
  inventoryReducer,
  cacheReducer,
  queueReducer,
  committedOffset,
  transitionKyc,
  transformJson,
  toMinorUnits,
  type PaymentStore,
  type Inventory,
  type QueueState,
} from "../src/simulations/engines";
describe("payment boundaries", () => {
  const initial: PaymentStore = { payments: [], notice: "" };
  const request = {
    type: "initiate" as const,
    key: "one",
    provider: "Atlas",
    amount: "10.00",
  };
  it("reuses duplicates and rejects a key with a changed request", () => {
    let s = paymentReducer(initial, request);
    s = paymentReducer(s, request);
    expect(s.payments).toHaveLength(1);
    expect(s.notice).toContain("Duplicate");
    s = paymentReducer(s, { ...request, amount: "11" });
    expect(s.payments).toHaveLength(1);
    expect(s.notice).toContain("Conflict");
  });
  it("requires initiation and provider response before webhook; preserves terminal state", () => {
    let s = paymentReducer(initial, request);
    const id = s.payments[0].id;
    s = paymentReducer(s, { type: "webhook", id });
    expect(s.payments[0].status).toBe("CREATED");
    s = paymentReducer(s, { type: "advance", id });
    s = paymentReducer(s, { type: "advance", id });
    expect(s.payments[0].status).toBe("AWAITING_WEBHOOK");
    s = paymentReducer(s, { type: "webhook", id });
    s = paymentReducer(s, { type: "webhook", id });
    expect(s.payments[0].status).toBe("SUCCEEDED");
    expect(s.payments[0].events.at(-1)).toContain("DUPLICATE");
  });
  it("models provider rejection and validates input", () => {
    let s = paymentReducer(initial, request);
    const id = s.payments[0].id;
    s = paymentReducer(s, { type: "advance", id });
    s = paymentReducer(s, { type: "advance", id, fail: true });
    s = paymentReducer(s, { type: "webhook", id });
    expect(s.payments[0].status).toBe("FAILED");
    expect(
      paymentReducer(initial, { ...request, amount: "NaN" }).payments,
    ).toHaveLength(0);
  });
});
describe("inventory atomic reservations", () => {
  const initial: Inventory = { stock: 2, now: 0, reservations: [], notice: "" };
  it("never oversells under a burst and releases expired stock", () => {
    let s = initial;
    for (let i = 0; i < 50; i++) s = inventoryReducer(s, { type: "reserve" });
    expect(s.reservations).toHaveLength(2);
    s = inventoryReducer(s, { type: "checkout", id: 1 });
    s = inventoryReducer(s, { type: "tick" });
    s = inventoryReducer(s, { type: "tick" });
    expect(s.reservations[0].state).toBe("completed");
    expect(s.reservations[1].state).toBe("expired");
    s = inventoryReducer(s, { type: "reserve" });
    expect(s.reservations[2].state).toBe("reserved");
    s = inventoryReducer(s, { type: "reserve" });
    expect(s.reservations).toHaveLength(3);
  });
  it("failed checkouts release stock but cannot alter completed purchases", () => {
    let s = inventoryReducer(initial, { type: "reserve" });
    s = inventoryReducer(s, { type: "fail", id: 1 });
    s = inventoryReducer(s, { type: "reserve" });
    expect(s.reservations).toHaveLength(2);
    s = inventoryReducer(s, { type: "checkout", id: 2 });
    s = inventoryReducer(s, { type: "fail", id: 2 });
    expect(s.reservations[1].state).toBe("completed");
  });
});
describe("cache and queues", () => {
  it("expires a cache entry and falls back to the database", () => {
    let s = cacheReducer(
      { now: 0, entry: null, hits: 0, misses: 0, log: [] },
      { type: "read" },
    );
    s = cacheReducer(s, { type: "read" });
    expect(s.hits).toBe(1);
    s = cacheReducer(s, { type: "tick" });
    expect(s.entry).toBeNull();
    s = cacheReducer(s, { type: "read" });
    expect(s.misses).toBe(2);
    s = cacheReducer(s, { type: "invalidate" });
    expect(s.entry).toBeNull();
  });
  it("rebalances ownership without losing offsets and dead-letters after 3 failures", () => {
    let s: QueueState = { messages: [], consumerB: true, notice: "" };
    for (let i = 0; i < 4; i++) s = queueReducer(s, { type: "produce" });
    expect(s.messages.map((m) => m.partition)).toEqual([0, 1, 2, 0]);
    s = queueReducer(s, { type: "toggle" });
    expect(s.consumerB).toBe(false);
    for (let i = 0; i < 3; i++)
      s = queueReducer(s, { type: "process", poison: true });
    expect(s.messages[0].state).toBe("dead");
    expect(committedOffset(s, 0)).toBe(0);
    expect(committedOffset(s, 1)).toBe(-1);
    s = queueReducer(s, { type: "process" });
    expect(committedOffset(s, 1)).toBe(0);
  });
});
describe("KYC and JSON safety", () => {
  it("rejects invalid transitions and preserves terminal states", () => {
    expect(transitionKyc("CREATED", "COMPLETED")).toBe("CREATED");
    expect(transitionKyc("AWAITING_PROVIDER", "COMPLETED")).toBe("COMPLETED");
    expect(transitionKyc("COMPLETED", "FAILED")).toBe("COMPLETED");
  });
  it("rounds decimal amounts without floating-point multiplication", () => {
    expect(toMinorUnits("1.005")).toBe(101);
    expect(toMinorUnits("49.905")).toBe(4991);
    expect(toMinorUnits("0.004")).toBe(0);
    expect(toMinorUnits("9.999")).toBe(1000);
    expect(() => toMinorUnits("Infinity")).toThrow();
    expect(() => toMinorUnits("-2")).toThrow();
  });
  it("maps fictional payloads and rejects malformed shapes", () => {
    expect(
      transformJson(
        '{"orderId":"x","amount":"1.005","currency":"eur"}',
        "payment",
      ),
    ).toEqual({ reference: "x", amount: 101, currency: "EUR" });
    expect(() => transformJson("null", "payment")).toThrow();
    expect(() => transformJson('{"items":[{}]}', "list")).toThrow();
    expect(() => transformJson("{", "payment")).toThrow();
    expect(transformJson('{"customer":{"name":" Alex "}}', "customer")).toEqual(
      { customer_name: "Alex", reference: null },
    );
  });
});
