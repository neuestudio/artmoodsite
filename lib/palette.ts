export type MoodColor = {
  id: string;
  ko: string;
  en: string;
  hex: string;
};

export const PALETTE: MoodColor[] = [
  { id: "joy", ko: "기쁨", en: "Joy", hex: "#F2C14E" },
  { id: "flutter", ko: "설렘", en: "Flutter", hex: "#EE8A6F" },
  { id: "warmth", ko: "따뜻함", en: "Warmth", hex: "#D98BA0" },
  { id: "calm", ko: "평온", en: "Calm", hex: "#9DBF9E" },
  { id: "sadness", ko: "슬픔", en: "Sadness", hex: "#4A6FA5" },
  { id: "anxiety", ko: "불안", en: "Anxiety", hex: "#9A8FB5" },
  { id: "anger", ko: "화남", en: "Anger", hex: "#C4553B" },
  { id: "tired", ko: "지침", en: "Tired", hex: "#A39E93" },
];

// 아직 색칠하지 않은 날의 제목 장식 색
export const NEUTRAL_INK = "#B9AE9F";

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorById(id: string | null | undefined) {
  return PALETTE.find((c) => c.id === id) ?? null;
}
