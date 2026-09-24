export function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return toKey(new Date());
}

export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isValidKey(key: unknown): key is string {
  return typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key) && !isNaN(fromKey(key).getTime());
}

export function shiftKey(key: string, days: number) {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatKey(key: string) {
  const d = fromKey(key);
  return {
    numeric: `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`,
    weekdayKo: WEEKDAYS_KO[d.getDay()],
    weekdayEn: WEEKDAYS_EN[d.getDay()],
  };
}

// 날짜마다 다른 도안이 나오도록 하는 일련번호
export function dayNumber(key: string) {
  const d = fromKey(key);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
