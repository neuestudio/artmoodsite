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

export const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 해당 날짜가 속한 주(일~토)의 날짜 키
export function weekKeys(key: string) {
  const d = fromKey(key);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return toKey(x);
  });
}

// 달력 칸: 앞쪽 빈칸은 null
export function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toKey(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function formatShort(key: string) {
  const d = fromKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
