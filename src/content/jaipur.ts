import { bounds } from "../world/flight-collision";
export const landmarks = [
  {
    id: "hawa",
    name: "Hawa Mahal",
    subtitle: "Palace of Winds",
    x: -8.5,
    z: -11.6,
    wide: 13.5,
    deep: 5.6,
    height: 12.65,
    accent: "#ffbea9",
  },
  {
    id: "city",
    name: "City Palace",
    subtitle: "Walled City",
    x: 20.4,
    z: -17.3,
    wide: 14.2,
    deep: 8,
    height: 11.8,
    accent: "#d7ebc0",
  },
  {
    id: "jal",
    name: "Jal Mahal",
    subtitle: "Man Sagar Lake",
    x: 16.5,
    z: -48,
    wide: 12,
    deep: 7,
    height: 8.6,
    accent: "#ffe0a9",
  },
  {
    id: "albert",
    name: "Albert Hall",
    subtitle: "Central Museum",
    x: -18,
    z: -45,
    wide: 15.5,
    deep: 7.8,
    height: 12.5,
    accent: "#fff1cc",
  },
  {
    id: "jantar",
    name: "Jantar Mantar",
    subtitle: "Astronomical Observatory",
    x: -9,
    z: -67,
    wide: 11,
    deep: 10,
    height: 8,
    accent: "#ffcb87",
  },
  {
    id: "amber",
    name: "Amber Fort",
    subtitle: "Hilltop Palace",
    x: 12,
    z: -88,
    wide: 22,
    deep: 11,
    height: 19.5,
    accent: "#ffe7aa",
  },
] as const;
export type JaipurLandmark = (typeof landmarks)[number];
export const lake = { x: 16.5, z: -48, rx: 19, rz: 14.5 };
export function inLake(x: number, z: number, padding = 0) {
  return (
    ((x - lake.x) / (lake.rx + padding)) ** 2 +
      ((z - lake.z) / (lake.rz + padding)) ** 2 <
    1
  );
}

export const landmarkSolids = landmarks.flatMap((item) => {
  const { name, x, z } = item;
  const hull = (
    dx: number,
    y: number,
    dz: number,
    w: number,
    h: number,
    d: number,
  ) => bounds(name, [x + dx, y, z + dz], [w, h, d]);
  switch (item.id) {
    case "hawa":
      return [0, 1, 2, 3, 4]
        .map((i) =>
          hull(
            0,
            1.63 + i * 2.08,
            -i * 0.2,
            [13.5, 12.2, 10.1, 7.8, 5.25][i],
            2.17,
            5.47 - i * 0.42,
          ),
        )
        .concat(
          [-2.42, 0, 2.42].map((dx) =>
            hull(dx, 11.68, -0.44, 1.33, 1.62, 1.33),
          ),
        );
    case "city":
      return [
        hull(0, 2.85, 0, 14.45, 5.7, 8.08),
        hull(0, 7, 0, 8, 2.71, 5.2),
        hull(0, 9.5, 0, 3.38, 1.95, 3.38),
        ...[-5.28, 5.28].map((dx) => hull(dx, 7.22, 3.43, 2.12, 2.13, 2.12)),
      ];
    case "jal":
      return [
        hull(0, 2.29, 0, 12.15, 4.58, 7.22),
        hull(0, 5.09, 0, 7.1, 1, 4.43),
        hull(0, 6.66, 0, 2.21, 2.15, 2.21),
        ...[-4.88, 4.88].flatMap((dx) =>
          [-2.67, 2.67].map((dz) => hull(dx, 5.72, dz, 2.02, 2.08, 2.02)),
        ),
      ];
    case "albert":
      return [
        hull(0, 2.06, 0, 15.68, 4.13, 7.92),
        hull(0, 4.85, 0, 8.8, 1.35, 6.14),
        hull(0, 5.31, 3.05, 4.87, 2.62, 2.17),
        hull(0, 7.6, 2.49, 3.72, 1.99, 3.72),
        ...[-5.44, 5.44].map((dx) => hull(dx, 5.45, 2.45, 2.42, 2.36, 2.42)),
      ];
    case "jantar":
      return [-2.3, 2.3].flatMap((xOffset) =>
        Array.from({ length: 7 }, (_, i) =>
          hull(xOffset + 1.05 - i * 0.35, 0.64 + i * 0.68, 0, 0.82, 0.92, 2.02),
        ),
      );
    case "amber":
      return [
        hull(0, 3.4, 0, 22.9, 6.7, 13.5),
        hull(0, 7.6, 0, 22.12, 4.04, 11.03),
        hull(0, 10.94, 0, 8.2, 3.9, 7.28),
        hull(0, 14.55, 0, 3.27, 3.1, 3.27),
        ...[-8.35, 8.35].flatMap((dx) => [
          hull(dx, 9.36, 3.55, 3.24, 4.9, 3.56),
          hull(dx, 12.93, 3.55, 2.28, 2.2, 2.28),
        ]),
      ];
  }
});

export function landmarkNear(
  x: number,
  y: number,
  z: number,
): JaipurLandmark | undefined {
  return landmarks.find(
    (item) =>
      Math.hypot(x - item.x, z - item.z) < (item.id === "amber" ? 18 : 11) &&
      y < item.height + 15,
  );
}
