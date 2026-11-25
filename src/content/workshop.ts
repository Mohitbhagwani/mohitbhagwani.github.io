export const exhibits = [
  {
    id: "java",
    object: "Ceramic coffee cup",
    name: "Java",
    type: "Languages",
    color: "#f1a15f",
    at: [-3.75, 0, 5.2],
    summary:
      "Java 8 through 21 in lending, healthcare, and payment systems. Led the move to Java 21 at PaySecure.",
    work: "modernization",
  },
  {
    id: "go",
    object: "Go gopher",
    name: "Go",
    type: "Languages",
    color: "#78d5ea",
    at: [3.75, 0, 5.2],
    summary:
      "Production exposure to Go, including GORM for relational data access.",
    work: null,
  },
  {
    id: "spring",
    object: "Leaf",
    name: "Spring Boot",
    type: "Frameworks",
    color: "#a9e19b",
    at: [-3.75, 0, 0.25],
    summary:
      "Spring Boot REST APIs, microservices, and Spring Security across loan and payment workflows.",
    work: "lending",
  },
  {
    id: "kafka",
    object: "Network switch",
    name: "Kafka & RabbitMQ",
    type: "Messaging",
    color: "#b1a6f7",
    at: [3.75, 0, 0.25],
    summary:
      "Event-driven systems and asynchronous processing, including healthcare audit workflows backed by RabbitMQ and Spring Cloud Stream.",
    work: "reliability",
  },
  {
    id: "sql",
    object: "Hard drive",
    name: "SQL & PostgreSQL",
    type: "Data",
    color: "#91b3f7",
    at: [-3.75, 0, -4.7],
    summary:
      "Database queries, indexing, and transaction design. PostgreSQL and MySQL are part of my relational database toolkit.",
    work: "lending",
  },
  {
    id: "redis",
    object: "Memory module",
    name: "Redis",
    type: "Data",
    color: "#f28e9d",
    at: [3.75, 0, -4.7],
    summary:
      "Redis-backed sessions in enterprise Java modernization, alongside caching and expiration concepts.",
    work: "modernization",
  },
  {
    id: "docker",
    object: "Shipping container",
    name: "Docker & Kubernetes",
    type: "Delivery",
    color: "#79c6fb",
    at: [-3.75, 0, -9.6],
    summary:
      "Containerized services, production pod troubleshooting, and CI/CD with Docker, Kubernetes, Jenkins, and GitLab.",
    work: "leadership",
  },
  {
    id: "mcp",
    object: "Interface hub",
    name: "MCP & LanceDB",
    type: "Developer tooling",
    color: "#ffd395",
    at: [3.75, 0, -9.6],
    summary:
      "Developer tools for semantic code and configuration search using MCP, LanceDB, and local Ollama embeddings.",
    work: "developer-tooling",
  },
] satisfies {
  id: string;
  name: string;
  object: string;
  type: string;
  color: string;
  at: [number, number, number];
  summary: string;
  work: string | null;
}[];
export type Exhibit = (typeof exhibits)[number];
