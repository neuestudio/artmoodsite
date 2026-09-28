import { clear, del, get, keys, set } from "idb-keyval";
import type { MoodRatio } from "./labels";

// 하루 기록은 세 조각으로 나눠 IndexedDB에 둔다: 글·수치(entry), 그림(paint PNG), 픽셀별 색 기록(labels)
export type QuickDrop = { color: string; note: string; at: number };

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
  quick?: QuickDrop | null;
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
    quick: null,
    updatedAt: 0,
  };
}

// 그날을 대표하는 색: 컬러링이 있으면 그 색, 없으면 한 방울 기록의 색
export function entryColor(e: Entry | null | undefined) {
  return e?.dominant ?? e?.quick?.color ?? null;
}

// 그날의 감정 비율: 컬러링 비율이 우선, 없으면 한 방울 기록을 100%로
export function entryRatios(e: Entry): MoodRatio[] {
  if (e.ratios?.length) return e.ratios;
  if (e.quick) return [{ id: e.quick.color, ratio: 100 }];
  return [];
}

export function hasRecord(e: Entry | null | undefined) {
  return !!e && (!!entryColor(e) || !!(e.what || e.why || e.how || e.closing) || e.satisfaction > 0);
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

export async function saveQuick(date: string, drawing: number, drop: QuickDrop) {
  const e = (await loadEntry(date)) ?? emptyEntry(date, drawing);
  await saveEntry({ ...e, quick: drop, updatedAt: Date.now() });
}

export async function listDates() {
  const all = await keys();
  return all
    .filter((k): k is string => typeof k === "string" && k.startsWith("entry:"))
    .map((k) => k.slice(6))
    .sort();
}

export async function listEntries() {
  const dates = await listDates();
  const entries = await Promise.all(dates.map((d) => loadEntry(d)));
  return entries.filter((e): e is Entry => !!e && hasRecord(e));
}

// 페이지 번호: 기록이 있는 날짜 순서 (아직 기록 전인 날은 그 자리에 들어갈 번호)
export async function pageNumberFor(date: string) {
  const dates = await listDates();
  const before = dates.filter((d) => d < date).length;
  return before + 1;
}

export async function exportAll() {
  const entries = await listEntries();
  return { app: "artmood", version: 1, exportedAt: new Date().toISOString(), entries };
}

export async function wipeAll() {
  await clear();
}
