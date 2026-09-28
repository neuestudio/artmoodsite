"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import DayThumb from "@/components/ui/DayThumb";
import MoodDrop from "@/components/ui/MoodDrop";
import MoodMix from "@/components/ui/MoodMix";
import Sheet from "@/components/ui/Sheet";
import { toast } from "@/components/ui/toast";
import { onChanged, openRecord } from "@/lib/bus";
import { WEEK_LABELS, formatKey, formatShort, fromKey, monthCells, todayKey } from "@/lib/date";
import { drawingForDay } from "@/lib/drawings";
import type { MoodRatio } from "@/lib/labels";
import { colorById } from "@/lib/palette";
import { downloadBlob, renderMonthCard } from "@/lib/shareImage";
import { entryColor, entryRatios, listEntries, type Entry } from "@/lib/store";
import styles from "./calendar.module.css";

const noopSubscribe = () => () => {};

// 한 달의 감정 비율: 하루를 한 표로 보고 그날의 비율을 평균낸다
function monthRatios(list: Entry[]): MoodRatio[] {
  const sum: Record<string, number> = {};
  let days = 0;
  for (const e of list) {
    const r = entryRatios(e);
    if (!r.length) continue;
    days++;
    for (const x of r) sum[x.id] = (sum[x.id] ?? 0) + x.ratio;
  }
  if (!days) return [];
  const raw = Object.entries(sum).map(([id, v]) => ({ id, ratio: Math.round(v / days) }));
  return raw.filter((r) => r.ratio > 0).sort((a, b) => b.ratio - a.ratio);
}

export default function CalendarView() {
  const today = useSyncExternalStore(noopSubscribe, todayKey, () => null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const load = () => listEntries().then(setEntries);
    load();
    return onChanged(load);
  }, []);

  const base = cursor ?? (today ? { y: fromKey(today).getFullYear(), m: fromKey(today).getMonth() } : null);
  const byDate = useMemo(() => new Map((entries ?? []).map((e) => [e.date, e])), [entries]);

  if (!base || !today) return <div className={styles.page} />;
  const { y, m } = base;
  const cells = monthCells(y, m);
  const inMonth = (entries ?? []).filter((e) => {
    const d = fromKey(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });
  const ratios = monthRatios(inMonth);
  const rated = inMonth.filter((e) => e.satisfaction > 0);
  const avg = rated.length ? Math.round(rated.reduce((s, e) => s + e.satisfaction, 0) / rated.length) : null;
  const isCurrent = y === fromKey(today).getFullYear() && m === fromKey(today).getMonth();
  const move = (d: number) => {
    const nd = new Date(y, m + d, 1);
    setCursor({ y: nd.getFullYear(), m: nd.getMonth() });
  };

  const share = async () => {
    setSharing(true);
    try {
      const colors = Object.fromEntries(inMonth.map((e) => [e.date, entryColor(e)]));
      const blob = await renderMonthCard(y, m, colors, ratios);
      downloadBlob(blob, `artmood-${y}-${String(m + 1).padStart(2, "0")}.png`);
      toast("월간 무드 카드를 저장했어요");
    } finally {
      setSharing(false);
    }
  };

  const pickedEntry = picked ? byDate.get(picked) ?? null : null;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1>달력</h1>
      </header>

      <section className={styles.card}>
        <div className={styles.monthNav}>
          <button onClick={() => move(-1)} aria-label="이전 달">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14 7l-5 5 5 5" />
            </svg>
          </button>
          <h2>
            <span className={styles.monthEn}>{new Date(y, m).toLocaleString("en", { month: "long" })}</span>
            {y}년 {m + 1}월
          </h2>
          <button onClick={() => move(1)} disabled={isCurrent} aria-label="다음 달">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M10 7l5 5-5 5" />
            </svg>
          </button>
        </div>

        <div className={styles.grid} role="grid" aria-label={`${y}년 ${m + 1}월`}>
          {WEEK_LABELS.map((l, i) => (
            <span key={l} className={styles.wLabel} data-sun={i === 0 ? "" : undefined}>
              {l}
            </span>
          ))}
          {cells.map((k, i) =>
            k ? (
              <button
                key={k}
                className={styles.cell}
                disabled={k > today}
                data-today={k === today ? "" : undefined}
                data-filled={entryColor(byDate.get(k)) ? "" : undefined}
                onClick={() => setPicked(k)}
                aria-label={`${formatShort(k)} ${colorById(entryColor(byDate.get(k)))?.ko ?? "기록 없음"}`}
              >
                <MoodDrop id={entryColor(byDate.get(k))} size={34} className={styles.cellDrop} />
                <span className={styles.cellNum}>{fromKey(k).getDate()}</span>
              </button>
            ) : (
              <span key={`b${i}`} />
            ),
          )}
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <small>기록한 날</small>
          <b>
            {inMonth.length}
            <span>일</span>
          </b>
        </div>
        <div className={styles.stat}>
          <small>가장 많은 색</small>
          <b className={styles.statMood}>
            {ratios[0] ? (
              <>
                <MoodDrop id={ratios[0].id} size={16} />
                {colorById(ratios[0].id)!.ko}
              </>
            ) : (
              "-"
            )}
          </b>
        </div>
        <div className={styles.stat}>
          <small>평균 만족도</small>
          <b>
            {avg ?? "-"}
            {avg !== null && <span>%</span>}
          </b>
        </div>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>이달의 감정 비율</h3>
        {ratios.length ? (
          <MoodMix ratios={ratios} />
        ) : (
          <p className={styles.empty}>이번 달 기록이 쌓이면 감정 비율을 보여드려요.</p>
        )}
        <button className={styles.shareBtn} onClick={share} disabled={sharing || !inMonth.length}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
          월간 무드 카드 저장
        </button>
      </section>

      <Sheet open={!!picked} onClose={() => setPicked(null)} title={picked ? formatShort(picked) + " " + formatKey(picked).weekdayKo + "요일" : ""}>
        {picked && pickedEntry ? (
          <div className={styles.preview}>
            <div className={styles.previewThumb}>
              <DayThumb entry={pickedEntry} drawing={pickedEntry.drawing} />
            </div>
            <div className={styles.previewInfo}>
              <p className={styles.previewMood}>
                <MoodDrop id={entryColor(pickedEntry)} size={20} />
                {colorById(entryColor(pickedEntry))?.ko ?? "색 없음"}
              </p>
              <MoodMix ratios={entryRatios(pickedEntry)} compact />
              {pickedEntry.satisfaction > 0 && <p className={styles.previewSat}>만족도 {pickedEntry.satisfaction}%</p>}
              <p className={styles.previewText}>
                {pickedEntry.closing || pickedEntry.quick?.note || pickedEntry.what || "한 방울로 남긴 날"}
              </p>
            </div>
            <Link
              href={picked === today ? "/app/day" : `/app/day?d=${picked}`}
              className={styles.previewBtn}
            >
              페이지 열기
            </Link>
          </div>
        ) : (
          picked && (
            <div className={styles.previewEmpty}>
              <div className={styles.previewThumb}>
                <DayThumb entry={null} drawing={drawingForDay(picked)} />
              </div>
              <p>이 날은 아직 비어 있어요.</p>
              <div className={styles.previewActions}>
                <button
                  className={styles.previewBtn}
                  onClick={() => {
                    const d = picked;
                    setPicked(null);
                    openRecord("quick", d);
                  }}
                >
                  한 방울 남기기
                </button>
                <Link
                  href={picked === today ? "/app/day" : `/app/day?d=${picked}`}
                  className={styles.previewBtnLight}
                >
                  도안 색칠하기
                </Link>
              </div>
            </div>
          )
        )}
      </Sheet>
    </div>
  );
}
