/** Bỏ dấu, hạ chữ thường, bỏ ký tự lạ: "Cà Chua!" -> "ca chua". */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const bigrams = (s: string) => {
  const t = ` ${s} `;
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
};

/** Dice coefficient trên bigram, 0..1. */
export function similarity(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const bx = bigrams(x);
  const by = bigrams(y);
  const counts = new Map<string, number>();
  for (const g of bx) counts.set(g, (counts.get(g) ?? 0) + 1);
  let overlap = 0;
  for (const g of by) {
    const c = counts.get(g) ?? 0;
    if (c > 0) {
      overlap++;
      counts.set(g, c - 1);
    }
  }
  return (2 * overlap) / (bx.length + by.length);
}

export function bestMatch<T extends { name: string }>(
  name: string,
  candidates: T[],
  threshold = 0.85,
): T | null {
  let best: T | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const s = similarity(name, c.name);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return bestScore >= threshold ? best : null;
}
