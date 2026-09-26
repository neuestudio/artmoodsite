import { PALETTE, hexToRgb } from "./palette";

// 픽셀마다 "마지막으로 칠한 무드 컬러"의 번호를 기록한다. 칠하지 않은 곳은 NONE.
// 물감이 겹쳐 섞인 색을 추정하지 않고, 실제로 고른 색 기준으로 비율을 낸다.
export const NONE = 255;

export type MoodRatio = { id: string; ratio: number };

// area가 있으면 도안 안쪽(1)에 칠한 픽셀만 센다
export function computeRatios(labels: Uint8Array, area?: Uint8Array | null): MoodRatio[] {
  const counts = new Array(PALETTE.length).fill(0);
  let total = 0;
  for (let i = 0; i < labels.length; i++) {
    const v = labels[i];
    if (v === NONE || (area && !area[i])) continue;
    counts[v]++;
    total++;
  }
  if (total === 0) return [];
  const exact = counts.map((n, i) => ({ id: PALETTE[i].id, raw: (n / total) * 100 })).filter((r) => r.raw > 0);
  // 반올림 후 합이 정확히 100이 되도록 (최대 나머지 방식)
  const floored = exact.map((r) => ({ ...r, ratio: Math.floor(r.raw) }));
  let rest = 100 - floored.reduce((s, r) => s + r.ratio, 0);
  [...floored]
    .sort((a, b) => b.raw - Math.floor(b.raw) - (a.raw - Math.floor(a.raw)))
    .forEach((r) => {
      if (rest > 0) {
        r.ratio++;
        rest--;
      }
    });
  return floored
    .filter((r) => r.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio)
    .map(({ id, ratio }) => ({ id, ratio }));
}

// 라벨은 같은 값이 길게 이어지므로 [값, 길이] 쌍으로 압축해 저장한다
export function encodeLabels(labels: Uint8Array): Uint32Array {
  const out: number[] = [];
  let i = 0;
  while (i < labels.length) {
    const v = labels[i];
    let j = i + 1;
    while (j < labels.length && labels[j] === v) j++;
    out.push(v, j - i);
    i = j;
  }
  return Uint32Array.from(out);
}

export function decodeLabels(rle: Uint32Array, size: number): Uint8Array | null {
  const labels = new Uint8Array(size);
  let pos = 0;
  for (let k = 0; k < rle.length; k += 2) {
    const len = rle[k + 1];
    if (pos + len > size) return null;
    labels.fill(rle[k], pos, pos + len);
    pos += len;
  }
  return pos === size ? labels : null;
}

// 라벨이 없던 예전 기록: 칠해진 픽셀 색에서 가장 가까운 무드 컬러로 추정
export function labelsFromPixels(data: Uint8ClampedArray): Uint8Array {
  const rgbs = PALETTE.map((c) => hexToRgb(c.hex));
  const labels = new Uint8Array(data.length / 4).fill(NONE);
  for (let i = 0; i < labels.length; i++) {
    const p = i * 4;
    if (data[p + 3] < 40) continue;
    let best = 0;
    let bestD = Infinity;
    for (let k = 0; k < rgbs.length; k++) {
      const dr = data[p] - rgbs[k][0];
      const dg = data[p + 1] - rgbs[k][1];
      const db = data[p + 2] - rgbs[k][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    labels[i] = best;
  }
  return labels;
}
