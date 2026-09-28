"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sheet from "@/components/ui/Sheet";
import MoodDrop from "@/components/ui/MoodDrop";
import { toast } from "@/components/ui/toast";
import { notifyChanged, type RecordKind } from "@/lib/bus";
import { formatShort, todayKey } from "@/lib/date";
import { drawingForDay } from "@/lib/drawings";
import { PALETTE, colorById } from "@/lib/palette";
import { loadEntry, saveQuick } from "@/lib/store";
import styles from "./app.module.css";

type State = { kind: RecordKind; date?: string } | null;

export default function RecordSheets({ state, onChange }: { state: State; onChange: (s: State) => void }) {
  const date = state?.date ?? (state ? todayKey() : null);
  const close = () => onChange(null);
  const isToday = date === todayKey();
  const dayLabel = date ? (isToday ? "오늘" : formatShort(date)) : "";

  return (
    <>
      <Sheet open={state?.kind === "choose"} onClose={close} title={`${dayLabel}을 어떻게 남길까요?`}>
        <div className={styles.choiceList}>
          <button className={styles.choice} onClick={() => onChange({ kind: "quick", date: date! })}>
            <span className={styles.choiceIcon} data-kind="quick">
              <MoodDrop id="joy" size={22} />
            </span>
            <span className={styles.choiceText}>
              <b>한 방울 기록</b>
              <small>색 하나와 한 줄이면 끝나요</small>
            </span>
            <span className={styles.choiceTime}>30초</span>
          </button>
          <Link
            className={styles.choice}
            href={date && !isToday ? `/app/day?d=${date}` : "/app/day"}
            onClick={close}
          >
            <span className={styles.choiceIcon} data-kind="page">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 20c2 0 3.6-.8 4.2-2.6l8.7-9.3a1.9 1.9 0 0 0-2.7-2.6L6.5 14.7C5.3 15.4 5 17 5 20Z" />
              </svg>
            </span>
            <span className={styles.choiceText}>
              <b>오늘의 페이지</b>
              <small>도안을 색칠하고 일곱 가지를 기록해요</small>
            </span>
            <span className={styles.choiceTime}>10분</span>
          </Link>
        </div>
      </Sheet>

      {state?.kind === "quick" && date && <QuickSheet key={date} date={date} dayLabel={dayLabel} onClose={close} />}
    </>
  );
}

function QuickSheet({ date, dayLabel, onClose }: { date: string; dayLabel: string; onClose: () => void }) {
  const [color, setColor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // 이미 남긴 한 방울이 있으면 이어서 고치기
  useEffect(() => {
    loadEntry(date).then((e) => {
      if (!e?.quick) return;
      setColor(e.quick.color);
      setNote(e.quick.note);
    });
  }, [date]);

  const save = async () => {
    if (!color) return;
    setSaving(true);
    await saveQuick(date, drawingForDay(date), { color, note: note.trim(), at: Date.now() });
    notifyChanged();
    toast(`${dayLabel}의 색, ${colorById(color)!.ko}을 남겼어요`);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={`${dayLabel} 하루는 어떤 색이었나요?`}>
      <div className={styles.quickGrid} role="radiogroup" aria-label="무드 컬러">
        {PALETTE.map((c) => (
          <button
            key={c.id}
            role="radio"
            aria-checked={color === c.id}
            className={styles.quickItem}
            onClick={() => setColor(c.id)}
          >
            <MoodDrop id={c.id} size={44} />
            <span>{c.ko}</span>
          </button>
        ))}
      </div>
      <p className={styles.quickLine}>{color ? colorById(color)!.line : "마음에 가장 가까운 색을 골라주세요"}</p>
      <label className={styles.quickNote}>
        <span className="sr-only">한 줄 메모</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={60}
          placeholder="한 줄로 남겨도 좋아요 (선택)"
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <small>{note.length}/60</small>
      </label>
      <button className={styles.primaryBtn} disabled={!color || saving} onClick={save}>
        {color ? `${colorById(color)!.ko}으로 남기기` : "색을 골라주세요"}
      </button>
    </Sheet>
  );
}
