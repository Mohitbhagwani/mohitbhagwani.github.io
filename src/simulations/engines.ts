// Educational models. No network calls, real payment data, or arbitrary code execution.
export type PaymentStatus =
  "CREATED" | "PROCESSING" | "AWAITING_WEBHOOK" | "SUCCEEDED" | "FAILED";
export interface Payment {
  id: string;
  key: string;
  fingerprint: string;
  provider: string;
  amount: string;
  status: PaymentStatus;
  events: string[];
}
export interface PaymentStore {
  payments: Payment[];
  notice: string;
}
export type PaymentAction =
  | { type: "initiate"; key: string; amount: string; provider: string }
  | { type: "advance"; id: string; fail?: boolean }
  | { type: "webhook"; id: string };
export function paymentReducer(
  state: PaymentStore,
  action: PaymentAction,
): PaymentStore {
  if (action.type === "initiate") {
    if (
      !action.key.trim() ||
      !/^\d+(\.\d{1,2})?$/.test(action.amount) ||
      Number(action.amount) <= 0
    )
      return {
        ...state,
        notice:
          "Use a positive amount with up to two decimal places and an idempotency key.",
      };
    const fingerprint = JSON.stringify([
      Number(action.amount).toFixed(2),
      action.provider,
    ]);
    const old = state.payments.find((p) => p.key === action.key);
    if (old)
      return {
        ...state,
        notice:
          old.fingerprint === fingerprint
            ? `Duplicate request: reused ${old.id}. No second payment created.`
            : "Conflict: this key already belongs to a different request.",
      };
    const id = `demo-${String(state.payments.length + 1).padStart(3, "0")}`;
    return {
      payments: [
        ...state.payments,
        {
          id,
          key: action.key,
          fingerprint,
          provider: action.provider,
          amount: action.amount,
          status: "CREATED",
          events: ["CREATED · request validated; idempotency key stored"],
        },
      ],
      notice: `Created ${id}. No real money moves.`,
    };
  }
  return {
    ...state,
    payments: state.payments.map((p) => {
      if (p.id !== action.id) return p;
      if (action.type === "webhook") {
        if (p.status === "SUCCEEDED" || p.status === "FAILED")
          return {
            ...p,
            events: [
              ...p.events,
              "DUPLICATE CALLBACK · acknowledged; terminal state preserved",
            ],
          };
        if (p.status !== "AWAITING_WEBHOOK")
          return {
            ...p,
            events: [
              ...p.events,
              "CALLBACK IGNORED · provider response required first",
            ],
          };
        return {
          ...p,
          status: "SUCCEEDED",
          events: [
            ...p.events,
            "SUCCEEDED · fictional authenticated callback processed",
          ],
        };
      }
      if (p.status === "CREATED")
        return {
          ...p,
          status: "PROCESSING",
          events: [...p.events, `PROCESSING · ${p.provider} adapter selected`],
        };
      if (p.status === "PROCESSING")
        return {
          ...p,
          status: action.fail ? "FAILED" : "AWAITING_WEBHOOK",
          events: [
            ...p.events,
            action.fail
              ? "FAILED · simulated provider rejection; normalized error"
              : "AWAITING_WEBHOOK · provider accepted; outcome pending",
          ],
        };
      return p;
    }),
  };
}
export type KycStatus =
  | "CREATED"
  | "IN_PROGRESS"
  | "AWAITING_USER"
  | "AWAITING_PROVIDER"
  | "MANUAL_REVIEW"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";
export const kycTransitions: Record<KycStatus, KycStatus[]> = {
  CREATED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["AWAITING_USER", "FAILED", "CANCELLED"],
  AWAITING_USER: ["AWAITING_PROVIDER", "EXPIRED", "CANCELLED"],
  AWAITING_PROVIDER: ["MANUAL_REVIEW", "COMPLETED", "FAILED", "EXPIRED"],
  MANUAL_REVIEW: ["COMPLETED", "FAILED", "EXPIRED"],
  COMPLETED: [],
  FAILED: [],
  EXPIRED: [],
  CANCELLED: [],
};
export function transitionKyc(current: KycStatus, next: KycStatus): KycStatus {
  return kycTransitions[current].includes(next) ? next : current;
}
export interface Reservation {
  id: number;
  state: "reserved" | "completed" | "failed" | "expired";
  expires: number;
}
export interface Inventory {
  stock: number;
  now: number;
  reservations: Reservation[];
  notice: string;
}
export type InventoryAction =
  | { type: "reserve" }
  | { type: "tick" }
  | { type: "checkout" | "fail"; id: number };
export function inventoryReducer(s: Inventory, a: InventoryAction): Inventory {
  if (a.type === "tick") {
    const now = s.now + 10;
    return {
      ...s,
      now,
      reservations: s.reservations.map((r) =>
        r.state === "reserved" && r.expires <= now
          ? { ...r, state: "expired" }
          : r,
      ),
      notice: "Advanced the clock by 10 seconds.",
    };
  }
  const available =
    s.stock -
    s.reservations.filter(
      (r) => r.state === "reserved" || r.state === "completed",
    ).length;
  if (a.type === "reserve")
    return available <= 0
      ? {
          ...s,
          notice:
            "Reservation rejected: no stock available. Overselling prevented.",
        }
      : {
          ...s,
          reservations: [
            ...s.reservations,
            {
              id: s.reservations.length + 1,
              state: "reserved",
              expires: s.now + 20,
            },
          ],
          notice: "Stock reserved atomically for 20 simulated seconds.",
        };
  return {
    ...s,
    reservations: s.reservations.map((r) =>
      r.id === a.id && r.state === "reserved"
        ? { ...r, state: a.type === "checkout" ? "completed" : "failed" }
        : r,
    ),
    notice:
      a.type === "checkout"
        ? "Checkout committed."
        : "Checkout failed; stock released.",
  };
}
export interface CacheState {
  now: number;
  entry: { value: string; expires: number } | null;
  hits: number;
  misses: number;
  log: string[];
}
export function cacheReducer(
  s: CacheState,
  a: { type: "read" | "tick" | "invalidate" },
): CacheState {
  if (a.type === "tick") {
    const now = s.now + 6;
    return {
      ...s,
      now,
      entry: s.entry && s.entry.expires > now ? s.entry : null,
      log: [
        `Clock +6s. ${s.entry && s.entry.expires <= now ? "TTL expired." : "Time advanced."}`,
        ...s.log,
      ].slice(0, 8),
    };
  }
  if (a.type === "invalidate")
    return {
      ...s,
      entry: null,
      log: ["Explicit invalidation: cache entry deleted.", ...s.log].slice(
        0,
        8,
      ),
    };
  if (s.entry && s.entry.expires > s.now)
    return {
      ...s,
      hits: s.hits + 1,
      log: ["HIT → value returned from Redis model.", ...s.log].slice(0, 8),
    };
  return {
    ...s,
    entry: { value: "Fictional product · ₹499", expires: s.now + 5 },
    misses: s.misses + 1,
    log: ["MISS → database read → cache populated (TTL 5s).", ...s.log].slice(
      0,
      8,
    ),
  };
}
export interface QueueMessage {
  id: number;
  partition: number;
  offset: number;
  state: "pending" | "done" | "retry" | "dead";
  attempts: number;
}
export interface QueueState {
  messages: QueueMessage[];
  consumerB: boolean;
  notice: string;
}
export type QueueAction = {
  type: "produce" | "process" | "toggle";
  poison?: boolean;
};
export function queueReducer(s: QueueState, a: QueueAction): QueueState {
  if (a.type === "toggle")
    return {
      ...s,
      consumerB: !s.consumerB,
      notice: s.consumerB
        ? "Consumer B failed. Rebalanced: A owns partitions 0, 1, 2."
        : "Consumer B recovered. Rebalanced: A owns 0, 2; B owns 1.",
    };
  if (a.type === "produce") {
    const n = s.messages.length;
    const partition = n % 3;
    return {
      ...s,
      messages: [
        ...s.messages,
        {
          id: n + 1,
          partition,
          offset: s.messages.filter((m) => m.partition === partition).length,
          state: "pending",
          attempts: 0,
        },
      ],
      notice: `Published event ${n + 1} to payments.events, partition ${partition}.`,
    };
  }
  const message = s.messages.find(
    (m) => m.state === "pending" || m.state === "retry",
  );
  if (!message) return { ...s, notice: "No unprocessed messages." };
  const failed = !!a.poison;
  const attempts = message.attempts + 1;
  return {
    ...s,
    messages: s.messages.map((m) =>
      m.id === message.id
        ? {
            ...m,
            attempts,
            state: failed ? (attempts >= 3 ? "dead" : "retry") : "done",
          }
        : m,
    ),
    notice: failed
      ? attempts >= 3
        ? `Event ${message.id} → dead-letter topic after 3 attempts; source offset committed.`
        : `Event ${message.id} failed; retry pending, offset not committed.`
      : `Consumer ${s.consumerB && message.partition === 1 ? "B" : "A"} processed event ${message.id}; offset committed.`,
  };
}
export function committedOffset(s: QueueState, partition: number): number {
  let offset = -1;
  for (const m of s.messages.filter((m) => m.partition === partition)) {
    if (m.state === "done" || m.state === "dead") offset = m.offset;
    else break;
  }
  return offset;
}
export function toMinorUnits(value: unknown): number {
  const text = String(value);
  if (!/^\d{1,12}(\.\d{1,6})?$/.test(text))
    throw new Error(
      "amount must be a non-negative decimal string (up to 12 whole and 6 fractional digits).",
    );
  const [whole, fraction = ""] = text.split(".");
  const minor =
    BigInt(whole) * 100n +
    BigInt((fraction + "00").slice(0, 2)) +
    (Number(fraction[2] ?? 0) >= 5 ? 1n : 0n);
  if (minor > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Amount exceeds safe integer range.");
  return Number(minor);
}
export function transformJson(input: string, operation: string): unknown {
  const data: unknown = JSON.parse(input);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Provide a JSON object.");
  const d = data as Record<string, unknown>;
  if (operation === "payment") {
    if (typeof d.orderId !== "string" || typeof d.currency !== "string")
      throw new Error("orderId and currency must be strings.");
    return {
      reference: d.orderId,
      amount: toMinorUnits(d.amount),
      currency: d.currency.toUpperCase(),
    };
  }
  if (operation === "customer") {
    if (
      !d.customer ||
      typeof d.customer !== "object" ||
      Array.isArray(d.customer)
    )
      throw new Error("customer must be an object with a name.");
    const customer = d.customer as Record<string, unknown>;
    if (typeof customer.name !== "string")
      throw new Error("customer.name must be a string.");
    return {
      customer_name: customer.name.trim(),
      reference: typeof d.orderId === "string" ? d.orderId : null,
    };
  }
  if (!Array.isArray(d.items) || !d.items.every((x) => typeof x === "string"))
    throw new Error("items must be an array of strings.");
  return {
    items: d.items.map((x: string) => x.trim().toUpperCase()),
    count: d.items.length,
  };
}
