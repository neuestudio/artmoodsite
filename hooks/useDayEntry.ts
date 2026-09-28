"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaintChange } from "@/components/ColoringCanvas";
import { drawingForDay } from "@/lib/drawings";
import {
  emptyEntry,
  loadEntry,
  loadLabels,
  loadPaint,
  pageNumberFor,
  saveEntry,
  type Entry,
  type PaintData,
} from "@/lib/store";

type Loaded = { date: string; paint: Blob | null; labels: Uint32Array | null; pageNo: number };

// 저장 대기 중인 기록. 어느 날짜의 것인지 entry가 함께 들고 있어서, 날짜가 바뀐 뒤에 저장돼도 섞이지 않는다.
type PendingSave = { entry: Entry; paint?: { blob: Promise<Blob | null>; labels: Uint32Array } };

export type SaveStatus = "idle" | "pending" | "saved";

export function useDayEntry(date: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const entryRef = useRef<Entry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<PendingSave | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const job = pending.current;
    pending.current = null;
    if (!job) return;
    let paintData: PaintData | undefined;
    if (job.paint) paintData = { paint: await job.paint.blob, labels: job.paint.labels };
    await saveEntry({ ...job.entry, updatedAt: Date.now() }, paintData);
    if (entryRef.current?.date === job.entry.date && !pending.current) setStatus("saved");
  }, []);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    (async () => {
      // 뒤로가기 등으로 날짜가 바뀌어도 이전 날짜의 남은 기록부터 저장
      await flush();
      const [saved, paint, labels, pageNo] = await Promise.all([
        loadEntry(date),
        loadPaint(date),
        loadLabels(date),
        pageNumberFor(date),
      ]);
      if (cancelled) return;
      const e = saved ?? emptyEntry(date, drawingForDay(date));
      entryRef.current = e;
      setEntry(e);
      setLoaded({ date, paint, labels, pageNo });
      setStatus(saved ? "saved" : "idle");
    })();
    return () => {
      cancelled = true;
    };
  }, [date, flush]);

  // 화면을 떠나거나 창을 닫을 때 남은 기록 저장
  useEffect(() => {
    const onHide = () => {
      if (pending.current) flush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      onHide();
    };
  }, [flush]);

  const queue = useCallback(
    (next: Entry, paint?: PendingSave["paint"]) => {
      const prev = pending.current;
      // 글만 바뀐 경우에도 아직 저장 안 된 그림은 함께 가져간다
      pending.current = { entry: next, paint: paint ?? (prev?.entry.date === next.date ? prev.paint : undefined) };
      setStatus("pending");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 700);
    },
    [flush],
  );

  const update = useCallback(
    (patch: Partial<Entry>) => {
      const next = { ...entryRef.current!, ...patch };
      entryRef.current = next;
      setEntry(next);
      queue(next);
    },
    [queue],
  );

  const onPaintChange = useCallback(
    ({ ratios, labels, paint }: PaintChange) => {
      const next = { ...entryRef.current!, ratios, dominant: ratios[0]?.id ?? null };
      entryRef.current = next;
      setEntry(next);
      queue(next, { blob: paint, labels });
    },
    [queue],
  );

  const ready = !!(loaded && entry && loaded.date === date);
  return { ready, entry, loaded, status, update, onPaintChange, flush };
}
