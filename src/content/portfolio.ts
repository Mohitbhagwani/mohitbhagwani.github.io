export const profile = {
  name: "Mohit Bhagwani",
  title: "Backend Software Engineer",
  location: "Jaipur, India",
  github: "https://github.com/Mohitbhagwani",
  // Add only verified destinations. Unconfigured actions are explained in the UI.
  linkedin: "",
  email: "",
  resume: "",
};
export const districts = [
  {
    id: "payments",
    name: "Payments City",
    subtitle: "The world, connected.",
    number: "01",
    color: "#9caf86",
    position: [-9, 0, -5] as [number, number, number],
    arrival: [-9, 0] as const,
    cases: ["orchestration", "wallets", "rails"],
    icon: "↗",
  },
  {
    id: "architecture",
    name: "Architecture District",
    subtitle: "Built for what comes next.",
    number: "02",
    color: "#98b9b0",
    position: [4, 0, -7] as [number, number, number],
    arrival: [4, -2.6] as const,
    cases: ["modernization", "reliability"],
    icon: "⌘",
  },
  {
    id: "innovation",
    name: "Innovation Lab",
    subtitle: "Good questions. Better systems.",
    number: "03",
    color: "#d9bd89",
    position: [11, 0, 3] as [number, number, number],
    arrival: [11, 7.9] as const,
    cases: ["kyc", "transformation"],
    icon: "✳",
  },
  {
    id: "museum",
    name: "Achievement Museum",
    subtitle: "Milestones along the way.",
    number: "04",
    color: "#c8af92",
    position: [-10, 0, 8] as [number, number, number],
    arrival: [-10, 12.1] as const,
    cases: [],
    icon: "◇",
  },
  {
    id: "career",
    name: "Career Station",
    subtitle: "People, progress, and purpose.",
    number: "05",
    color: "#a7b8cc",
    position: [0, 0, 10] as [number, number, number],
    arrival: [0, 5.7] as const,
    cases: ["leadership"],
    icon: "◎",
  },
  {
    id: "playground",
    name: "Engineering Playground",
    subtitle: "Take a system for a spin.",
    number: "06",
    color: "#d9ed53",
    position: [12, 0, -9] as [number, number, number],
    arrival: [12, -4.9] as const,
    cases: [],
    icon: "▶",
  },
];
export const experience = [
  {
    company: "PaySecure",
    role: "Backend Engineer",
    period: "May 2025 — Present",
    description: "Building the systems behind global payments.",
    details:
      "Payment processor and digital wallet integrations, orchestration, authentication workflows, webhooks, status synchronization, and enterprise application modernization.",
  },
  {
    company: "FiftyFive Technologies",
    role: "Software Engineer",
    period: "May 2023 — May 2025",
    description: "Enterprise software. Shared ownership.",
    details:
      "Java and Spring Boot microservices, event-driven architecture, APIs, authentication, and database integration. Led four engineers, coordinated releases, and reviewed code. Received a Performance Excellence award for contributions to an audit release.",
  },
  {
    company: "Bluetris Technologies",
    role: "Software Developer 1 High",
    period: "Jan 2023 — Apr 2023",
    description: "A foundation in backend engineering.",
    details:
      "Backend development with Java, REST APIs, and database integration.",
  },
];
export const skills = {
  "Languages & frameworks": [
    "Java 8 / 11 / 17 / 21",
    "Spring Boot",
    "Spring MVC",
    "Spring Data JPA",
    "Hibernate",
    "Spring AOP",
    "SQL",
    "Go (exposure)",
  ],
  "APIs & identity": [
    "REST",
    "gRPC",
    "Spring Security",
    "OAuth 2.0",
    "OpenID Connect",
    "Keycloak",
  ],
  "Data & messaging": [
    "PostgreSQL",
    "MySQL",
    "MariaDB",
    "MongoDB",
    "Redis",
    "H2",
    "Apache Kafka",
    "RabbitMQ",
  ],
  "Systems & delivery": [
    "Distributed systems",
    "Microservices",
    "Concurrency",
    "Transaction management",
    "Database indexing",
    "Caching",
    "Idempotency",
    "Docker",
    "Linux",
    "Azure",
    "Git",
    "CI/CD",
    "Spring Actuator",
  ],
};
export const awards = [
  {
    title: "Performance Excellence",
    source: "FiftyFive Technologies",
    date: "September 2024",
    description: "Recognized for contributions to an audit release.",
  },
  {
    title: "Letter of Appreciation",
    source: "PaySecure",
    date: "October 2025",
    description: "Professional recognition at PaySecure.",
  },
  {
    title: "Employee of the Quarter",
    source: "PaySecure",
    date: "Date not supplied",
    description: "Recognition for engineering contributions.",
  },
  {
    title: "Java 21 Modernization",
    source: "Engineering recognition",
    date: "Date not supplied",
    description: "Recognition for application modernization work.",
  },
];
export interface CaseStudy {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  problem: string;
  challenge: string;
  contribution: string;
  architecture: string[];
  choices: string;
  tradeoffs: string;
  implementation: string;
  reliability: string;
  lesson: string;
  outcome: string;
  demo?: string;
}
export const caseStudies: CaseStudy[] = [
  {
    id: "orchestration",
    number: "01",
    title: "One integration. Many payment paths.",
    category: "PAYMENT ORCHESTRATION",
    summary: "A provider-independent approach to a provider-specific world.",
    tags: ["Payments", "API design", "Async systems"],
    problem:
      "Merchants need a consistent payment experience while providers expose different request formats, authentication methods, and status models.",
    challenge:
      "Redirects, 2D and 3D Secure flows, asynchronous callbacks, and provider-specific errors make a payment lifecycle more complex than a single HTTP request.",
    contribution:
      "Worked on processor integrations, configurable payment integration architecture, transaction lifecycle management, payment authentication, global methods, payouts, and status synchronization.",
    architecture: [
      "Merchant API",
      "Orchestrator",
      "Provider adapter",
      "Payment provider",
      "Webhook inbox",
      "Status reconciliation",
    ],
    choices:
      "A common domain model and explicit provider adapters separate merchant-facing contracts from provider protocols. Asynchronous updates complement synchronous initiation.",
    tradeoffs:
      "Normalization simplifies integration but must preserve provider context for debugging. Timeouts require reconciliation; they do not prove that a payment failed.",
    implementation:
      "Validate the request, establish an idempotency boundary, choose an adapter, initiate the payment, and reconcile later responses and callbacks into a normalized lifecycle.",
    reliability:
      "Deduplicate requests and callbacks, authenticate callbacks, map errors deliberately, and distinguish a failed operation from an unknown outcome.",
    lesson: "A reliable payment platform models uncertainty explicitly.",
    outcome:
      "Integration and orchestration experience as supplied. This diagram is conceptual; no company architecture or business metrics are disclosed.",
    demo: "payments",
  },
  {
    id: "modernization",
    number: "02",
    title: "Modernize the engine. Keep it running.",
    category: "ENTERPRISE JAVA MODERNIZATION",
    summary: "Moving a living enterprise application from Java 8 to Java 21.",
    tags: ["Java 21", "Spring Boot 3.4", "Jakarta"],
    problem:
      "An existing enterprise application needed a modern Java and Spring foundation while retaining its established behavior.",
    challenge:
      "The migration crossed Java 8 → 21, Spring Boot 2.3 → 3.4, javax → Jakarta, and an older Thymeleaf implementation → Thymeleaf 3. Framework, security, and session assumptions changed together.",
    contribution:
      "Migrated the application and worked through dependency compatibility, legacy behavior, security compatibility, Redis-backed sessions, and regression testing.",
    architecture: [
      "Java 8 / Boot 2.3",
      "Dependency inventory",
      "Jakarta migration",
      "Security & sessions",
      "Java 21 / Boot 3.4",
    ],
    choices:
      "Spring Session Redis retains shared-session capability. MySQL and MongoDB integrations need driver and serialization compatibility checks alongside framework changes.",
    tradeoffs:
      "A coordinated migration reduces prolonged mixed-version complexity but expands the regression surface. Existing behavior needs deliberate verification rather than an assumption of compatibility.",
    implementation:
      "Inventory dependencies; resolve incompatible APIs and Jakarta packages; migrate templates, security configuration, and sessions; verify database integration and established application flows.",
    reliability:
      "Pay particular attention to authentication, session serialization, template rendering, database access, and rollback readiness.",
    lesson:
      "Modernization succeeds when runtime compatibility and user behavior receive equal attention.",
    outcome:
      "Java 21 application modernization and associated recognition were supplied by Mohit. No performance improvement is claimed.",
  },
  {
    id: "wallets",
    number: "03",
    title: "The complexity behind a simple tap.",
    category: "DIGITAL WALLET INTEGRATIONS",
    summary:
      "Connecting Google Pay and Apple Pay to server-side payment flows.",
    tags: ["Tokenization", "Google Pay", "Apple Pay"],
    problem:
      "A wallet interaction must become a valid provider-specific payment without exposing payment credentials.",
    challenge:
      "Google Pay PAN_ONLY and gateway tokenization differ. Apple Pay merchant validation, cryptograms, and DPAN / MPAN behavior add provider-dependent requirements.",
    contribution:
      "Worked on Google Pay and Apple Pay integrations, server-to-server flows, tokenization requirements, and payment handle lifecycle.",
    architecture: [
      "Wallet sheet",
      "Tokenized payment",
      "Backend validation",
      "Provider adapter",
      "Payment lifecycle",
    ],
    choices:
      "Treat wallet data as sensitive, short-lived input. Keep wallet-specific validation distinct from provider request construction.",
    tradeoffs:
      "A unified API helps merchants, while token formats, cryptogram support, and provider requirements remain explicit adapter concerns.",
    implementation:
      "Validate the merchant and supported wallet configuration, obtain the wallet token, create the provider request, and manage the payment handle through its lifecycle.",
    reliability:
      "Protect tokens and cryptograms from logs, reject invalid or stale handles, and reconcile ambiguous provider responses.",
    lesson:
      "A shared user experience does not imply identical payment semantics.",
    outcome:
      "Technical integration experience only. No card data, tokens, production payloads, or confidential provider configurations are included.",
  },
  {
    id: "rails",
    number: "04",
    title: "Different rails. A connected world.",
    category: "GLOBAL PAYMENT RAILS",
    summary: "Working across the geography and semantics of money movement.",
    tags: ["PIX", "SPEI", "Open Banking"],
    problem:
      "Global payment methods differ in initiation, settlement, user interaction, and confirmation.",
    challenge:
      "Card authorization, real-time bank transfers, traditional bank transfers, and consent-driven open banking cannot share every lifecycle assumption.",
    contribution:
      "Experience with PIX (Brazil), SPEI (Mexico), Interac (Canada), ACH and RTP (US), Open Banking (UK / Europe), Korean virtual accounts, and Venmo payout integration.",
    architecture: [
      "Regional method",
      "Method validation",
      "Bank / provider",
      "Async confirmation",
      "Reconciliation",
    ],
    choices:
      "Use method-aware validation and normalized states while retaining region and rail information.",
    tradeoffs:
      "Real-time rails can confirm quickly; traditional transfers may require longer pending states. Open banking adds consent and bank redirection. Cards have authorization and capture semantics.",
    implementation:
      "Represent rail capabilities explicitly, initiate the correct flow, then track its asynchronous confirmation and reconciliation path.",
    reliability:
      "Never infer final success from a redirect alone. Respect rail-specific cutoffs, expiry, and provider status definitions.",
    lesson:
      "Payment methods are different financial workflows, not interchangeable logos.",
    outcome:
      "Geographic experience as supplied. The interactive map is illustrative and makes no claim of live availability.",
    demo: "rails",
  },
  {
    id: "kyc",
    number: "05",
    title: "One identity journey. Flexible providers.",
    category: "KYC ARCHITECTURE · DESIGN WORK",
    summary: "Designing a provider-independent verification lifecycle.",
    tags: ["State machines", "KYC", "Architecture"],
    problem:
      "Merchant integrations should not need to rebuild their identity journey whenever a verification provider changes.",
    challenge:
      "Customer identity mapping, user redirection, provider callbacks, manual review, and inconsistent provider statuses need a coherent lifecycle.",
    contribution:
      "Designed a provider-independent KYC orchestration architecture. Production implementation has not been confirmed.",
    architecture: [
      "Unified KYC API",
      "Identity mapping",
      "Provider adapter",
      "User verification",
      "Callback inbox",
      "Normalized status",
    ],
    choices:
      "A shared lifecycle: CREATED → IN_PROGRESS → AWAITING_USER → AWAITING_PROVIDER → MANUAL_REVIEW → COMPLETED, with EXPIRED, FAILED, and CANCELLED as alternative terminal states.",
    tradeoffs:
      "Manual review is a possible branch, not a requirement for every verification. Provider-specific detail should coexist with a stable merchant-facing state model.",
    implementation:
      "Create a verification, map the customer, choose a configured provider, return a verification URL, and synchronize callbacks and status queries.",
    reliability:
      "Validate callbacks, deduplicate events, reject invalid state transitions, and manage URL expiry without losing audit context.",
    lesson:
      "A good state machine explains both the happy path and where a journey can pause.",
    outcome:
      "Architecture and design work, explicitly separated from a claim of a deployed production system.",
    demo: "kyc",
  },
  {
    id: "transformation",
    number: "06",
    title: "Less glue code. More configuration.",
    category: "CONFIGURABLE JSON TRANSFORMATION",
    summary: "Making provider-specific payloads a configuration problem.",
    tags: ["JSON", "Precision", "Integration design"],
    problem:
      "Integrations repeatedly need to rename fields, convert types, and reshape nested request and response bodies.",
    challenge:
      "Nested data, lists, custom operations, numeric precision, rounding strategies, and serialization must produce predictable results.",
    contribution:
      "Worked on a configurable JSON transformation engine for dynamic request and response transformations.",
    architecture: [
      "Source JSON",
      "Mapping configuration",
      "Typed operations",
      "Validation",
      "Target JSON",
    ],
    choices:
      "Explicit, allowlisted operations keep transformations understandable. Monetary conversions require defined precision and rounding behavior.",
    tradeoffs:
      "Configuration reduces repetitive adapter code but becomes a language to validate, version, and debug. Arbitrary code execution is inappropriate for a public playground.",
    implementation:
      "Resolve paths, apply predefined field mapping and conversion operations, validate values, and serialize the resulting structure.",
    reliability:
      "Report invalid JSON and missing fields; avoid silently coercing malformed numbers. The demonstration converts decimal amounts to minor units without floating-point multiplication.",
    lesson:
      "Configuration needs the same observability and discipline as code.",
    outcome:
      "Engine experience as supplied. The browser playground is a small educational example using fictional data.",
    demo: "json",
  },
  {
    id: "reliability",
    number: "07",
    title: "Know what happened. Know what to retry.",
    category: "PAYMENT RELIABILITY & OBSERVABILITY",
    summary:
      "Making transaction behavior traceable without leaking sensitive data.",
    tags: ["Idempotency", "Observability", "Webhooks"],
    problem:
      "A timeout or duplicate callback can leave a transaction uncertain and make troubleshooting difficult.",
    challenge:
      "Correlation, HTTP status semantics, request hashing, sensitive-data masking, and inconsistent provider errors must work together.",
    contribution:
      "Experience with idempotency keys, request hashing, correlation identifiers, structured API logging, masking, card validation logging, response normalization, error categorization, and payment debugging.",
    architecture: [
      "Request + correlation ID",
      "Idempotency boundary",
      "Provider call",
      "Webhook event",
      "Transaction trace",
    ],
    choices:
      "Use structured events with stable correlation identifiers. Record useful validation outcomes without recording card data or secrets.",
    tradeoffs:
      "Verbose logging helps debugging but increases data exposure. HTTP success alone cannot establish final payment success.",
    implementation:
      "Track initiation and provider updates as correlated lifecycle events, normalize errors, and preserve enough safe context to investigate outcomes.",
    reliability:
      "Handle out-of-order events, deduplicate webhooks, and avoid regressing terminal transaction states. Distinguish retryable transport errors from validation failures.",
    lesson:
      "Observability is useful only when its evidence is both trustworthy and safe to retain.",
    outcome:
      "The transaction timeline uses fictional, in-memory events. It is not a production monitoring service.",
    demo: "payments",
  },
  {
    id: "leadership",
    number: "08",
    title: "Good systems are built together.",
    category: "ENGINEERING LEADERSHIP",
    summary: "Ownership extends beyond the code you write.",
    tags: ["Team of four", "Code reviews", "Delivery"],
    problem:
      "Engineering delivery depends on coordination across implementation, quality assurance, releases, and stakeholder expectations.",
    challenge:
      "Technical decisions need to stay understandable while multiple engineers contribute toward shared deliverables.",
    contribution:
      "Led four engineers at FiftyFive Technologies. Experience includes code reviews, mentoring, release coordination, technical problem-solving, and communication with QA, product teams, and stakeholders.",
    architecture: [
      "Shared context",
      "Technical decisions",
      "Implementation & review",
      "QA collaboration",
      "Release coordination",
    ],
    choices:
      "Use code review to share reasoning and make ownership explicit. Coordinate release readiness with the teams that depend on the work.",
    tradeoffs:
      "Technical ownership requires balancing individual implementation with time spent unblocking and supporting others.",
    implementation:
      "Clarify deliverables, review implementation, collaborate on defects and technical questions, and coordinate the release.",
    reliability:
      "Review and release coordination help surface risk before delivery. No unverified process or team-performance metrics are claimed.",
    lesson:
      "Engineering leadership means making the team more effective, not just writing more code.",
    outcome:
      "Team leadership and a Performance Excellence award for audit-release contributions were supplied by Mohit.",
  },
];
