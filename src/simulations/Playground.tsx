import { useReducer, useState } from "react";
import {
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  X,
  ArrowUpRight,
} from "lucide-react";
import {
  paymentReducer,
  cacheReducer,
  inventoryReducer,
  queueReducer,
  committedOffset,
  kycTransitions,
  transitionKyc,
  transformJson,
  type KycStatus,
} from "./engines";
const demoNames: Record<string, string> = {
  payments: "Payment orchestration",
  queue: "Kafka & message queues",
  cache: "Redis cache-aside",
  inventory: "Inventory reservations",
  kyc: "KYC workflow",
  json: "JSON transformation",
  rails: "Global payment rails",
};
export default function Playground({
  initial = "payments",
}: {
  initial?: string;
}) {
  const [active, setActive] = useState(initial);
  return (
    <div className="playground">
      <div
        className="demo-tabs"
        role="tablist"
        aria-label="Engineering demonstrations"
      >
        {Object.entries(demoNames).map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            onClick={() => setActive(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        className="demo-panel"
        role="tabpanel"
        aria-label={demoNames[active]}
      >
        <div className="demo-disclaimer">
          <span className="live-dot" /> EDUCATIONAL DEMO{" "}
          <span>Fictional data · runs entirely in your browser</span>
        </div>
        {active === "payments" ? (
          <Payments />
        ) : active === "queue" ? (
          <Queue />
        ) : active === "cache" ? (
          <Cache />
        ) : active === "inventory" ? (
          <Inventory />
        ) : active === "kyc" ? (
          <Kyc />
        ) : active === "json" ? (
          <Json />
        ) : (
          <Rails />
        )}
      </div>
    </div>
  );
}
function Payments() {
  const [state, dispatch] = useReducer(paymentReducer, {
    payments: [],
    notice: "Ready to initiate a fictional payment.",
  });
  const [provider, setProvider] = useState("Atlas Pay");
  const [key, setKey] = useState("order-001");
  const [amount, setAmount] = useState("49.90");
  const payment = state.payments.at(-1);
  return (
    <>
      <h3>A payment is a journey.</h3>
      <p>
        Follow the request, adapter, provider response, and webhook. Reuse the
        same key to see idempotency in action.
      </p>
      <div className="demo-fields">
        <label>
          Provider
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option>Atlas Pay</option>
            <option>North Bank</option>
            <option>Orbit Wallet</option>
          </select>
        </label>
        <label>
          Amount (fictional EUR)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>
        <label>
          Idempotency key
          <input value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
      </div>
      <div className="button-row">
        <button
          className="button dark"
          onClick={() => dispatch({ type: "initiate", key, amount, provider })}
        >
          <Play size={14} /> Initiate payment
        </button>
        {payment && (
          <>
            <button
              className="button"
              disabled={!["CREATED", "PROCESSING"].includes(payment.status)}
              onClick={() => dispatch({ type: "advance", id: payment.id })}
            >
              Next transition <ArrowRight size={14} />
            </button>
            <button
              className="button"
              disabled={payment.status !== "PROCESSING"}
              onClick={() =>
                dispatch({ type: "advance", id: payment.id, fail: true })
              }
            >
              Provider failure
            </button>
            <button
              className="button"
              disabled={
                !["AWAITING_WEBHOOK", "SUCCEEDED", "FAILED"].includes(
                  payment.status,
                )
              }
              onClick={() => dispatch({ type: "webhook", id: payment.id })}
            >
              Deliver webhook
            </button>
          </>
        )}
      </div>
      <p className="status" role="status">
        {state.notice}
      </p>
      <div className="metric-strip">
        <span>
          Transactions{" "}
          <b data-testid="payment-count">{state.payments.length}</b>
        </span>
        <span>
          State <b>{payment?.status ?? "READY"}</b>
        </span>
        <span>
          Correlation <b>{payment?.id ?? "—"}</b>
        </span>
      </div>
      {payment && (
        <ol className="event-log">
          {payment.events.map((event, i) => (
            <li key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {event}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
function Queue() {
  const [s, d] = useReducer(queueReducer, {
    messages: [],
    consumerB: true,
    notice: "Topic payments.events · 3 partitions · group settlement-workers",
  });
  return (
    <>
      <h3>Messages move. Ownership changes.</h3>
      <p>
        Publish round-robin events, process them, or inject failures. Three
        failed attempts route a message to the dead-letter topic.
      </p>
      <div className="button-row">
        <button className="button dark" onClick={() => d({ type: "produce" })}>
          Produce event
        </button>
        <button className="button" onClick={() => d({ type: "process" })}>
          Process next
        </button>
        <button
          className="button"
          onClick={() => d({ type: "process", poison: true })}
        >
          Fail processing
        </button>
        <button className="button" onClick={() => d({ type: "toggle" })}>
          {s.consumerB ? "Fail consumer B" : "Recover consumer B"}
        </button>
      </div>
      <div className="partition-grid">
        {[0, 1, 2].map((p) => (
          <div className="partition" key={p}>
            <span>PARTITION {p}</span>
            <h4>Consumer {s.consumerB && p === 1 ? "B" : "A"}</h4>
            <p>Committed offset: {committedOffset(s, p)}</p>
            {s.messages
              .filter((m) => m.partition === p)
              .map((m) => (
                <div className={"message " + m.state} key={m.id}>
                  #{m.id} · offset {m.offset} <b>{m.state}</b>
                  <small>attempts {m.attempts}</small>
                </div>
              ))}
          </div>
        ))}
      </div>
      <p className="status" role="status">
        {s.notice}
      </p>
      <p className="fine-print">
        Simplified in-memory model: ordering is preserved per partition.
        Rebalancing changes ownership; it does not remove messages.
      </p>
    </>
  );
}
function Cache() {
  const [s, d] = useReducer(cacheReducer, {
    now: 0,
    entry: null,
    hits: 0,
    misses: 0,
    log: [],
  });
  return (
    <>
      <h3>A shorter route to the answer.</h3>
      <p>
        Read a fictional product. The first request falls back to the database;
        subsequent requests use a cached copy until its five-second simulated
        TTL expires.
      </p>
      <div className="architecture-flow">
        <span>Application</span>
        <ArrowRight />
        <span className={s.entry ? "active" : ""}>
          Redis {s.entry ? "● warm" : "○ empty"}
        </span>
        <ArrowRight />
        <span>Database</span>
      </div>
      <div className="button-row">
        <button className="button dark" onClick={() => d({ type: "read" })}>
          Read product
        </button>
        <button className="button" onClick={() => d({ type: "tick" })}>
          Advance clock +6s
        </button>
        <button className="button" onClick={() => d({ type: "invalidate" })}>
          Invalidate cache
        </button>
      </div>
      <div className="metric-strip">
        <span>
          Hits <b>{s.hits}</b>
        </span>
        <span>
          Misses <b>{s.misses}</b>
        </span>
        <span>
          Clock <b>{s.now}s</b>
        </span>
        <span>
          TTL <b>{s.entry ? Math.max(0, s.entry.expires - s.now) : 0}s</b>
        </span>
      </div>
      <ul className="plain-log" aria-live="polite">
        {s.log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </>
  );
}
function Inventory() {
  const [s, d] = useReducer(inventoryReducer, {
    stock: 2,
    now: 0,
    reservations: [],
    notice: "Two items. Each reservation expires after 20 simulated seconds.",
  });
  const available =
    s.stock -
    s.reservations.filter(
      (r) => r.state === "reserved" || r.state === "completed",
    ).length;
  return (
    <>
      <h3>Two items. Three buyers. No overselling.</h3>
      <p>
        Simulate a burst of three purchase requests against two available items.
        Each request applies an atomic reservation before the next can read the
        stock.
      </p>
      <div className="button-row">
        <button
          className="button dark"
          onClick={() => {
            d({ type: "reserve" });
            d({ type: "reserve" });
            d({ type: "reserve" });
          }}
        >
          Simulate 3 concurrent buyers
        </button>
        <button className="button" onClick={() => d({ type: "reserve" })}>
          Reserve one
        </button>
        <button className="button" onClick={() => d({ type: "tick" })}>
          Advance clock +10s
        </button>
      </div>
      <div className="metric-strip">
        <span>
          Available <b data-testid="stock">{available}</b>
        </span>
        <span>
          Stock <b>{s.stock}</b>
        </span>
        <span>
          Clock <b>{s.now}s</b>
        </span>
      </div>
      <p className="status" role="status">
        {s.notice}
      </p>
      {s.reservations.map((r) => (
        <div className="reservation" key={r.id}>
          <span>
            Buyer {r.id} <b>{r.state}</b>
            {r.state === "reserved" && (
              <small>expires in {r.expires - s.now}s</small>
            )}
          </span>
          {r.state === "reserved" && (
            <div className="button-row">
              <button
                className="button small"
                onClick={() => d({ type: "checkout", id: r.id })}
              >
                <Check size={14} /> Checkout
              </button>
              <button
                className="button small"
                onClick={() => d({ type: "fail", id: r.id })}
              >
                <X size={14} /> Fail
              </button>
            </div>
          )}
        </div>
      ))}
      <p className="fine-print">
        Concurrency is modeled as a serialized atomic boundary, not real network
        requests. Completed sales keep their stock; expiry and failed checkouts
        release it.
      </p>
    </>
  );
}
function Kyc() {
  const [state, setState] = useState<KycStatus>("CREATED");
  const [history, setHistory] = useState<KycStatus[]>(["CREATED"]);
  return (
    <>
      <h3>Identity, without provider lock-in.</h3>
      <p>
        Explore a proposed lifecycle. Only valid transitions are offered. Manual
        review is optional; completed and failed journeys are terminal.
      </p>
      <div className="kyc-current">
        <span>CURRENT VERIFICATION STATE</span>
        <strong role="status">{state}</strong>
      </div>
      <div className="button-row">
        {kycTransitions[state].map((next) => (
          <button
            className="button"
            key={next}
            onClick={() => {
              setState(transitionKyc(state, next));
              setHistory((h) => [...h, next]);
            }}
          >
            {next.replaceAll("_", " ")} <ArrowRight size={14} />
          </button>
        ))}
        <button
          className="button"
          onClick={() => {
            setState("CREATED");
            setHistory(["CREATED"]);
          }}
        >
          <RotateCcw size={14} /> New verification
        </button>
      </div>
      <ol className="event-log">
        {history.map((s, i) => (
          <li key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="fine-print">
        Architecture and design work. This is not connected to an identity
        provider and does not collect personal documents.
      </p>
    </>
  );
}
function Json() {
  const [input, setInput] = useState(
    JSON.stringify(
      {
        orderId: "fictional-001",
        amount: "49.905",
        currency: "eur",
        customer: { name: "  Alex Example  " },
        items: [" keyboard ", "notebook"],
      },
      null,
      2,
    ),
  );
  const [operation, setOperation] = useState("payment");
  const [output, setOutput] = useState(
    "Apply a transformation to see the result.",
  );
  const [error, setError] = useState(false);
  return (
    <>
      <h3>Same data. A different shape.</h3>
      <p>
        Allowlisted operations only. Amount conversion uses decimal digits and
        half-up rounding to avoid floating-point multiplication errors.
      </p>
      <label>
        Transformation
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="payment">
            Map payment → reference, minor units, uppercase currency
          </option>
          <option value="customer">Flatten customer → trim nested name</option>
          <option value="list">Normalize list → trim & uppercase items</option>
        </select>
      </label>
      <div className="json-grid">
        <label>
          Input JSON
          <textarea
            aria-label="Input JSON"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <div>
          <span className="field-label">Output JSON</span>
          <pre className={error ? "error" : ""} aria-live="polite">
            {output}
          </pre>
        </div>
      </div>
      <button
        className="button dark"
        onClick={() => {
          try {
            setOutput(JSON.stringify(transformJson(input, operation), null, 2));
            setError(false);
          } catch (e) {
            setOutput(e instanceof Error ? e.message : "Invalid input");
            setError(true);
          }
        }}
      >
        Apply transformation <ArrowRight size={14} />
      </button>
    </>
  );
}
const rails = [
  {
    name: "Brazil",
    rail: "PIX",
    type: "Real-time bank transfers",
    x: 292,
    y: 218,
    description:
      "An instant-payment rail. Confirmation and reconciliation follow the provider’s asynchronous status model.",
  },
  {
    name: "Mexico",
    rail: "SPEI",
    type: "Bank transfers",
    x: 174,
    y: 152,
    description:
      "An interbank transfer system. Reference and beneficiary details are rail-specific.",
  },
  {
    name: "Canada",
    rail: "Interac",
    type: "Bank-based payments",
    x: 180,
    y: 68,
    description:
      "Canadian payment infrastructure with method-specific initiation and confirmation.",
  },
  {
    name: "United States",
    rail: "ACH / RTP / Venmo payouts",
    type: "Traditional & real-time transfers",
    x: 191,
    y: 108,
    description:
      "ACH and RTP have different timing and settlement semantics. Venmo adds a wallet payout experience.",
  },
  {
    name: "UK & Europe",
    rail: "Open Banking",
    type: "Consent-driven bank payments",
    x: 430,
    y: 79,
    description:
      "User consent and bank redirection connect payment initiation to bank authorization.",
  },
  {
    name: "South Korea",
    rail: "Virtual accounts",
    type: "Account-based collections",
    x: 682,
    y: 116,
    description:
      "A virtual account identifies incoming funds; payment confirmation follows provider and banking events.",
  },
];
function Rails() {
  const [active, setActive] = useState(rails[0]);
  return (
    <>
      <h3>Money moves differently everywhere.</h3>
      <p>
        Select a location to explore payment methods from Mohit’s technical
        experience. Illustrative geography; no live coverage is implied.
      </p>
      <svg
        className="world-map"
        viewBox="0 0 800 320"
        role="img"
        aria-label="Illustrative map of global payment rail experience"
      >
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#c4c8bd" />
          </pattern>
        </defs>
        <rect width="800" height="320" fill="url(#grid)" />
        <g fill="#d7ddcf" stroke="#f5f6ef" strokeWidth="3">
          <path d="M70 68L123 31 224 38 280 66 258 104 228 119 217 154 179 177 151 137 102 130 92 93Z" />
          <path d="M237 177L280 164 331 196 324 244 287 293 267 261 254 217Z" />
          <path d="M369 71L416 43 474 46 505 73 461 112 423 114 401 91Z" />
          <path d="M407 126L467 111 514 156 486 213 450 242 425 195 398 159Z" />
          <path d="M474 58L549 32 662 46 728 85 704 131 665 156 628 126 606 178 564 147 537 105 498 102Z" />
          <path d="M646 228L706 204 748 241 719 273 665 264Z" />
        </g>
        {rails.map((r) => (
          <g key={r.name}>
            <circle
              cx={r.x}
              cy={r.y}
              r={active.name === r.name ? 12 : 7}
              fill={active.name === r.name ? "#d9ed53" : "#536b59"}
              stroke="#28332d"
              strokeWidth="2"
            />
            <text x={r.x + 15} y={r.y + 4} fontSize="11" fill="#28332d">
              {r.rail.split(" / ")[0]}
            </text>
          </g>
        ))}
      </svg>
      <div className="button-row">
        {rails.map((r) => (
          <button
            className={"button small " + (active.name === r.name ? "dark" : "")}
            key={r.name}
            onClick={() => setActive(r)}
          >
            {r.name}
          </button>
        ))}
      </div>
      <div className="rail-detail" aria-live="polite">
        <span>{active.type}</span>
        <h4>
          {active.rail} <ArrowUpRight size={18} />
        </h4>
        <p>{active.description}</p>
      </div>
    </>
  );
}
