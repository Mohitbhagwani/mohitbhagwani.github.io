export type Vec3 = readonly [number, number, number];
export interface SolidBounds {
  name: string;
  min: Vec3;
  max: Vec3;
}

export function bounds(name: string, center: Vec3, size: Vec3): SolidBounds {
  return {
    name,
    min: [
      center[0] - size[0] / 2,
      center[1] - size[1] / 2,
      center[2] - size[2] / 2,
    ],
    max: [
      center[0] + size[0] / 2,
      center[1] + size[1] / 2,
      center[2] + size[2] / 2,
    ],
  };
}

export function sweepKite(
  start: Vec3,
  end: Vec3,
  solids: readonly SolidBounds[],
  radius: number,
) {
  let hit: { solid: SolidBounds; fraction: number; normal: Vec3 } | null = null;
  const delta = end.map((value, i) => value - start[i]);
  for (const solid of solids) {
    let enter = 0,
      exit = 1,
      axis = -1,
      sign = 0;
    for (let i = 0; i < 3; i++) {
      const min = solid.min[i] - radius,
        max = solid.max[i] + radius;
      const origin = start[i],
        direction = delta[i];
      if (Math.abs(direction) < 1e-8) {
        if (origin < min || origin > max) {
          exit = -1;
          break;
        }
        continue;
      }
      const a = (min - origin) / direction,
        b = (max - origin) / direction;
      const passage = Math.min(a, b);
      if (passage >= enter) {
        enter = passage;
        axis = i;
        sign = direction > 0 ? -1 : 1;
      }
      exit = Math.min(exit, Math.max(a, b));
      if (enter > exit) break;
    }
    if (
      axis < 0 ||
      enter > exit ||
      enter > 1 ||
      enter < 0 ||
      (hit && enter >= hit.fraction)
    )
      continue;
    const normal: [number, number, number] = [0, 0, 0];
    normal[axis] = sign;
    hit = { solid, fraction: enter, normal };
  }
  return hit;
}
