export const rooftops = [
  {
    id: "skills",
    name: "The Workshop",
    detail: "Languages, tools, and how I use them.",
    link: "#skills",
    at: [6, 13, -16],
    color: "#65dbd6",
  },
  {
    id: "work",
    name: "The Open-Air Cinema",
    detail: "Case studies from payments, lending, and platform engineering.",
    link: "#work",
    at: [-9, 14, -38],
    color: "#ffad7e",
  },
  {
    id: "experience",
    name: "The Station",
    detail: "My engineering journey, from lending to payment orchestration.",
    link: "#experience",
    at: [10, 13, -64],
    color: "#e5a5db",
  },
] as const;
export type Rooftop = (typeof rooftops)[number];
export type FlightKey = "left" | "right" | "rise" | "dive" | "gust";
