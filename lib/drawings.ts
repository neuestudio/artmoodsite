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

// 도안 안쪽 영역(흰색). 열린 선 사이 틈을 메워 만든 윤곽으로, 바탕에 칠한 색을 감정 비율에서 빼는 데 쓴다.
export function drawingMaskSrc(id: number) {
  return `/masks/d${DRAWINGS.some((d) => d.id === id) ? id : DRAWINGS[0].id}.png`;
}
