export type MoodColor = {
  id: string;
  ko: string;
  en: string;
  hex: string;
  // 색 이름과 짧은 설명 (랜딩·테스트 결과에서 사용)
  colorName: string;
  line: string;
};

export const PALETTE: MoodColor[] = [
  { id: "joy", ko: "기쁨", en: "Joy", hex: "#F2C14E", colorName: "햇살 옐로", line: "마음에 볕이 드는 날" },
  { id: "flutter", ko: "설렘", en: "Flutter", hex: "#EE8A6F", colorName: "코랄", line: "무언가를 기다리는 두근거림" },
  { id: "warmth", ko: "따뜻함", en: "Warmth", hex: "#D98BA0", colorName: "더스티 로즈", line: "누군가와 온기를 나눈 순간" },
  { id: "calm", ko: "평온", en: "Calm", hex: "#9DBF9E", colorName: "세이지 그린", line: "숨이 고르게 쉬어지는 오후" },
  { id: "sadness", ko: "슬픔", en: "Sadness", hex: "#4A6FA5", colorName: "딥 블루", line: "조용히 가라앉은 마음" },
  { id: "anxiety", ko: "불안", en: "Anxiety", hex: "#9A8FB5", colorName: "라벤더 그레이", line: "머릿속이 쉬지 않는 밤" },
  { id: "anger", ko: "화남", en: "Anger", hex: "#C4553B", colorName: "테라코타", line: "참아온 말이 뜨거워질 때" },
  { id: "tired", ko: "지침", en: "Tired", hex: "#A39E93", colorName: "웜 그레이", line: "오래 달려온 몸과 마음" },
];

// 아직 색칠하지 않은 날의 제목 장식 색
export const NEUTRAL_INK = "#B9AE9F";

// 물감 방울마다 조금씩 다른 모양
export const BLOBS = [
  "52% 48% 55% 45% / 47% 55% 45% 53%",
  "46% 54% 48% 52% / 55% 45% 55% 45%",
  "55% 45% 50% 50% / 45% 52% 48% 55%",
  "48% 52% 45% 55% / 52% 48% 55% 45%",
  "50% 50% 54% 46% / 48% 54% 46% 52%",
  "45% 55% 52% 48% / 54% 46% 50% 50%",
  "53% 47% 47% 53% / 46% 50% 50% 54%",
  "47% 53% 55% 45% / 50% 46% 54% 50%",
];

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorById(id: string | null | undefined) {
  return PALETTE.find((c) => c.id === id) ?? null;
}

export function blobFor(id: string | null | undefined) {
  const i = PALETTE.findIndex((c) => c.id === id);
  return BLOBS[(i < 0 ? 0 : i) % BLOBS.length];
}
