import { get, set, del, keys } from "idb-keyval";

export type Entry = {
  date: string;
  drawing: number;
  satisfaction: number;
  what: string;
  why: string;
  how: string;
  closing: string;
  dominant: string | null;
  updatedAt: number;
};

const entryKey = (date: string) => `entry:${date}`;
const paintKey = (date: string) => `paint:${date}`;

export function emptyEntry(date: string, drawing: number): Entry {
  return {
    date,
    drawing,
    satisfaction: 50,
    what: "",
    why: "",
    how: "",
    closing: "",
    dominant: null,
    updatedAt: 0,
  };
}

export async function loadEntry(date: string) {
  return (await get<Entry>(entryKey(date))) ?? null;
}

export async function loadPaint(date: string) {
  return (await get<Blob>(paintKey(date))) ?? null;
}

export async function saveEntry(entry: Entry, paint?: Blob | null) {
  await set(entryKey(entry.date), entry);
  if (paint === null) await del(paintKey(entry.date));
  else if (paint) await set(paintKey(entry.date), paint);
}

export async function listDates() {
  const all = await keys();
  return all
    .filter((k): k is string => typeof k === "string" && k.startsWith("entry:"))
    .map((k) => k.slice(6))
    .sort();
}

export async function loadAll() {
  const dates = await listDates();
  return Promise.all(
    dates.map(async (d) => ({ entry: (await loadEntry(d))!, paint: await loadPaint(d) })),
  );
}

// 페이지 번호: 기록이 있는 날짜 순서 (아직 기록 전인 날은 그 자리에 들어갈 번호)
export async function pageNumberFor(date: string) {
  const dates = await listDates();
  const before = dates.filter((d) => d < date).length;
  return before + 1;
}
