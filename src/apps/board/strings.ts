/** The magenta string geometry, shared by the live board and the report snapshot. */
export type Pt = { x: number; y: number };

/** A string that sags a little under its own weight. */
export function stringPath(a: Pt, z: Pt): string {
  const c = stringControl(a, z);
  return `M${a.x},${a.y} Q${c.x},${c.y} ${z.x},${z.y}`;
}

function stringControl(a: Pt, z: Pt): Pt {
  const sag = 30 + Math.hypot(z.x - a.x, z.y - a.y) * 0.08;
  return { x: (a.x + z.x) / 2, y: (a.y + z.y) / 2 + sag };
}

/** Midpoint of the quadratic curve (t = 0.5). */
export function stringMid(a: Pt, z: Pt): Pt {
  const c = stringControl(a, z);
  return { x: 0.25 * a.x + 0.5 * c.x + 0.25 * z.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * z.y };
}
