import { del, get, keys, set } from "idb-keyval";
import type { MoodRatio } from "./labels";

// 하루 기록은 세 조각으로 나눠 IndexedDB에 둔다: 글·수치(entry), 그림(paint PNG), 픽셀별 색 기록(labels)
export type Entry = {
  date: string;
  drawing: number;
  satisfaction: number;
  what: string;
  why: string;
  how: string;
  closing: string;
  dominant: string | null;
  ratios?: MoodRatio[];
  updatedAt: number;
};

export type PaintData = { paint: Blob | null; labels: Uint32Array };

const entryKey = (date: string) => `entry:${date}`;
const paintKey = (date: string) => `paint:${date}`;
const labelsKey = (date: string) => `labels:${date}`;

export function emptyEntry(date: string, drawing: number): Entry {
  return {
    date,
    drawing,
    satisfaction: 0,
    what: "",
    why: "",
    how: "",
    closing: "",
    dominant: null,
    ratios: [],
    updatedAt: 0,
  };
}

export async function loadEntry(date: string) {
  return (await get<Entry>(entryKey(date))) ?? null;
}

export async function loadPaint(date: string) {
  return (await get<Blob>(paintKey(date))) ?? null;
}

export async function loadLabels(date: string) {
  return (await get<Uint32Array>(labelsKey(date))) ?? null;
}

// paintData를 넘기지 않으면 그림은 그대로 두고 글·수치만 저장
export async function saveEntry(entry: Entry, paintData?: PaintData) {
  await set(entryKey(entry.date), entry);
  if (!paintData) return;
  if (paintData.paint) {
    await set(paintKey(entry.date), paintData.paint);
    await set(labelsKey(entry.date), paintData.labels);
  } else {
    await del(paintKey(entry.date));
    await del(labelsKey(entry.date));
  }
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
