import { dayNumber } from "./date";

export const DRAWINGS = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: n,
  src: `/drawings/d${n}.png`,
}));

// 원본 도안 비율 (362.88 x 516 pt)
export const ART_W = 900;
export const ART_H = 1280;

export function drawingForDay(key: string) {
  return DRAWINGS[dayNumber(key) % DRAWINGS.length].id;
}

export function drawingSrc(id: number) {
  return (DRAWINGS.find((d) => d.id === id) ?? DRAWINGS[0]).src;
}
