export type TraceScenario = "success" | "failure" | "duplicate";
export type TraceNodeId =
  "ingress" | "vault" | "core" | "provider" | "relay" | "ledger";

export const traceNodes = [
  {
    id: "ingress",
    label: "Request ingress",
    short: "INGRESS",
    position: [-7, 0, 2.4],
    color: "#8ae1dd",
    detail:
      "Validate the fictional payment request and assign a correlation ID.",
    view: "case/orchestration",
  },
  {
    id: "vault",
    label: "Idempotency vault",
    short: "DEDUPE",
    position: [-2.5, 0, 2.4],
    color: "#f2b27e",
    detail:
      "Compare the idempotency key and request fingerprint before making a provider call.",
    view: "case/reliability",
  },
  {
    id: "core",
    label: "Orchestration core",
    short: "ROUTER",
    position: [2, 0, 2.4],
    color: "#e7c499",
    detail:
      "Choose the configured adapter and translate the request to the provider contract.",
    view: "case/orchestration",
  },
  {
    id: "provider",
    label: "Provider network",
    short: "PROVIDERS",
    position: [6.5, 0, 2.4],
    color: "#a8b5ec",
    detail:
      "Initiate the transaction using a fictional provider and normalize its response.",
    view: "payments",
  },
  {
    id: "relay",
    label: "Event relay",
    short: "CALLBACK",
    position: [6.5, 0, -2.6],
    color: "#83d6b9",
    detail:
      "Accept the simulated provider callback and deliver it to reconciliation.",
    view: "playground",
  },
  {
    id: "ledger",
    label: "Transaction record",
    short: "RECONCILE",
    position: [2, 0, -2.6],
    color: "#f0b28b",
    detail: "Commit the final state and preserve the trace for debugging.",
    view: "case/reliability",
  },
] satisfies {
  id: TraceNodeId;
  label: string;
  short: string;
  position: [number, number, number];
  color: string;
  detail: string;
  view: string;
}[];

interface Step {
  node: TraceNodeId;
  state: string;
  message: string;
}
export const traceRoutes: Record<TraceScenario, Step[]> = {
  success: [
    {
      node: "ingress",
      state: "RECEIVED",
      message: "Request validated. Trace started.",
    },
    {
      node: "vault",
      state: "ACCEPTED",
      message: "New idempotency key recorded.",
    },
    {
      node: "core",
      state: "ROUTED",
      message: "Selected a fictional provider adapter.",
    },
    {
      node: "provider",
      state: "PENDING",
      message: "Provider accepted the request. Final status is pending.",
    },
    {
      node: "relay",
      state: "CALLBACK",
      message: "A fictional authenticated provider webhook arrived.",
    },
    {
      node: "ledger",
      state: "SUCCEEDED",
      message: "Reconciled the callback and committed the final state.",
    },
  ],
  failure: [
    {
      node: "ingress",
      state: "RECEIVED",
      message: "Request validated. Trace started.",
    },
    {
      node: "vault",
      state: "ACCEPTED",
      message: "New idempotency key recorded.",
    },
    {
      node: "core",
      state: "ROUTED",
      message: "Selected a fictional provider adapter.",
    },
    {
      node: "provider",
      state: "REJECTED",
      message:
        "Provider rejected the request. The adapter normalized the error.",
    },
    {
      node: "ledger",
      state: "FAILED",
      message:
        "Recorded an explicit provider rejection. No success callback is expected.",
    },
  ],
  duplicate: [
    {
      node: "ingress",
      state: "RECEIVED",
      message: "A client submitted an existing idempotency key.",
    },
    {
      node: "vault",
      state: "REUSED",
      message:
        "The fingerprint matches. Returned the stored result without a second provider call.",
    },
  ],
};
