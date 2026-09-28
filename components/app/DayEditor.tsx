"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import ColoringCanvas, { type ColoringHandle, type Tool } from "@/components/ColoringCanvas";
import Heading from "@/components/Heading";
import MoodBar from "@/components/MoodBar";
import MoodDrop from "@/components/ui/MoodDrop";
import MoodMix from "@/components/ui/MoodMix";
import { toast } from "@/components/ui/toast";
import { useDayEntry } from "@/hooks/useDayEntry";
import { formatKey, formatShort, isValidKey, shiftKey, todayKey } from "@/lib/date";
import { NEUTRAL_INK, PALETTE, colorById } from "@/lib/palette";
import styles from "./dayEditor.module.css";

const SIZES = [
  { px: 9, label: "가는 붓" },
  { px: 24, label: "보통 붓" },
  { px: 52, label: "굵은 붓" },
];

const WRITE_FIELDS = [
  { key: "what", en: "WHAT", ko: "무슨 일이 있었나요", hint: "오늘 기억에 남는 한 장면" },
  { key: "why", en: "WHY", ko: "왜 그런 마음이 들었나요", hint: "그 감정이 찾아온 이유" },
  { key: "how", en: "HOW", ko: "어떻게 지나 보냈나요", hint: "그 마음을 대한 나의 방식" },
] as const;

const noopSubscribe = () => () => {};

export default function DayEditor({ requested }: { requested: string | null }) {
  const router = useRouter();
  // 날짜는 사용자의 기기 시간 기준 (서버에서는 알 수 없으므로 null)
  const today = useSyncExternalStore(noopSubscribe, todayKey, () => null);
  const date = today ? (isValidKey(requested) && requested <= today ? requested : today) : null;
  const { ready, entry, loaded, status, update, onPaintChange, flush } = useDayEntry(date);

  const [step, setStep] = useState<"color" | "write">("color");
  const [colorId, setColorId] = useState(PALETTE[0].id);
  const [tool, setTool] = useState<Tool>("brush");
  const [size, setSize] = useState(SIZES[1].px);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState({ undo: false, redo: false });
  const canvasRef = useRef<ColoringHandle>(null);

  // Cmd/Ctrl+Z 되돌리기, Shift+Cmd/Ctrl+Z 또는 Ctrl+Y 다시 실행 (글을 쓰는 중에는 글자 되돌리기가 우선)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z") {
        e.preventDefault();
        if (e.shiftKey) canvasRef.current?.redo();
        else canvasRef.current?.undo();
      } else if (k === "y") {
        e.preventDefault();
        canvasRef.current?.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onHistory = useCallback((undo: boolean, redo: boolean) => setHistory({ undo, redo }), []);

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((m) => (m === msg ? null : m)), 5000);
  }, []);

  const go = async (href: string) => {
    await flush();
    router.push(href);
  };

  const finish = async () => {
    await flush();
    toast("오늘의 페이지를 저장했어요");
    router.push("/app");
  };

  const dayHex = colorById(entry?.dominant)?.hex ?? NEUTRAL_INK;
  const f = date ? formatKey(date) : null;

  return (
    <div className={styles.wrap} style={{ "--day": dayHex } as CSSProperties}>
      <header className={styles.top}>
        <button className={styles.iconBtn} onClick={() => go("/app")} aria-label="홈으로">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <div className={styles.dateNav}>
          <button
            className={styles.iconBtn}
            onClick={() => date && go(`/app/day?d=${shiftKey(date, -1)}`)}
            aria-label="전날"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14 7l-5 5 5 5" />
            </svg>
          </button>
          <span className={styles.dateTitle}>{date && f ? `${formatShort(date)} ${f.weekdayKo}요일` : ""}</span>
          <button
            className={styles.iconBtn}
            onClick={() => date && go(shiftKey(date, 1) === today ? "/app/day" : `/app/day?d=${shiftKey(date, 1)}`)}
            disabled={!date || date === today}
            aria-label="다음 날"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M10 7l5 5-5 5" />
            </svg>
          </button>
        </div>
        <span className={styles.status}>{status === "pending" ? "저장 중" : status === "saved" ? "저장됨" : ""}</span>
      </header>

      <div className={styles.segment} role="tablist" aria-label="페이지 단계">
        <button role="tab" aria-selected={step === "color"} onClick={() => setStep("color")}>
          <span>1</span> 색칠하기
        </button>
        <button role="tab" aria-selected={step === "write"} onClick={() => setStep("write")}>
          <span>2</span> 기록하기
        </button>
        <i data-step={step} aria-hidden />
      </div>

      {/* 색칠하기: 기록하기로 넘어가도 캔버스는 유지 (그림과 되돌리기 기록 보존) */}
      <section className={styles.colorStep} hidden={step !== "color"} aria-label="컬러링">
        <div className={styles.paper}>
          <div className={styles.art}>
            {ready && loaded && entry && (
              <ColoringCanvas
                key={loaded.date}
                ref={canvasRef}
                drawingId={entry.drawing}
                colorId={colorId}
                tool={tool}
                size={size}
                initialPaint={loaded.paint}
                initialLabels={loaded.labels}
                onChange={onPaintChange}
                onHistory={onHistory}
                onNotice={showNotice}
              />
            )}
          </div>
          <p className={styles.notice} role="status">
            {notice ?? (tool === "fill" ? "칠하고 싶은 곳을 눌러보세요" : " ")}
          </p>
        </div>

        <div className={styles.palette} role="radiogroup" aria-label="무드 컬러 팔레트">
          {PALETTE.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={c.id === colorId}
              className={styles.swatch}
              onClick={() => {
                setColorId(c.id);
                if (tool === "eraser") setTool("brush");
              }}
            >
              <MoodDrop id={c.id} size={30} />
              <span>{c.ko}</span>
            </button>
          ))}
        </div>

        <div className={styles.tools}>
          <div className={styles.toolGroup} role="radiogroup" aria-label="도구">
            <ToolButton active={tool === "brush"} onClick={() => setTool("brush")} label="붓">
              <path d="M4 20c2 0 4-1 4.6-3.2L17.5 6.4a1.8 1.8 0 0 0-2.6-2.5L5.8 13.2C4.4 14 4 16 4 20Z" />
            </ToolButton>
            <ToolButton active={tool === "fill"} onClick={() => setTool("fill")} label="채우기">
              <path d="M12 3.5c3 4 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.5-6 5.5-10Z" />
            </ToolButton>
            <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} label="지우개">
              <path d="M4.5 15.5 13 7l5 5-7.5 7.5H7Zm4 4H20" />
            </ToolButton>
          </div>
          <div
            className={styles.toolGroup}
            role="radiogroup"
            aria-label="붓 굵기"
            data-muted={tool === "fill" ? "" : undefined}
          >
            {SIZES.map((s) => (
              <button
                key={s.px}
                role="radio"
                aria-checked={size === s.px}
                aria-label={s.label}
                title={s.label}
                className={styles.sizeBtn}
                onClick={() => {
                  setSize(s.px);
                  if (tool === "fill") setTool("brush");
                }}
              >
                <span style={{ width: 4 + s.px / 4, height: 4 + s.px / 4 }} />
              </button>
            ))}
          </div>
          <div className={styles.toolGroup}>
            <button
              className={styles.iconBtn}
              onClick={() => canvasRef.current?.undo()}
              disabled={!history.undo}
              aria-label="되돌리기"
              title="되돌리기 (⌘Z / Ctrl+Z)"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => canvasRef.current?.redo()}
              disabled={!history.redo}
              aria-label="다시 실행"
              title="다시 실행 (⇧⌘Z / Ctrl+Y)"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3" />
              </svg>
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => {
                if (confirm("색칠을 모두 지울까요? 되돌리기로 다시 살릴 수 있어요.")) canvasRef.current?.clear();
              }}
              aria-label="모두 지우기"
              title="모두 지우기"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 7h14M10 7V4.5h4V7m-7 0 1 13h8l1-13" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <button className={styles.primaryBtn} onClick={() => setStep("write")}>
            다음: 오늘 기록하기
          </button>
        </div>
      </section>

      {/* 기록하기 */}
      {step === "write" && ready && entry && loaded && f && (
        <section className={styles.writeStep} aria-label="오늘의 기록">
          <div className={styles.sheet}>
            <div className={styles.meta}>
              <div>
                <Heading en="DATE" ko="날짜" index={0} />
                <p className={styles.date}>
                  {f.numeric}
                  <span>
                    {f.weekdayKo}요일 · {f.weekdayEn}
                  </span>
                </p>
              </div>
              <div className={styles.pageNo}>
                <Heading en="PAGE" ko="쪽" index={1} />
                <p className={styles.num}>{String(loaded.pageNo).padStart(3, "0")}</p>
              </div>
            </div>

            <div>
              <Heading en="MOOD" ko="오늘의 만족도" index={2} htmlFor="mood" />
              <MoodBar id="mood" value={entry.satisfaction} onChange={(v) => update({ satisfaction: v })} />
              <div className={styles.mix}>
                {entry.ratios?.length ? (
                  <>
                    <p className={styles.caption}>도안에 칠한 감정 비율</p>
                    <MoodMix ratios={entry.ratios} />
                  </>
                ) : (
                  <button className={styles.caption} onClick={() => setStep("color")}>
                    도안에 색을 칠하면 오늘의 감정 비율이 여기에 번져요 →
                  </button>
                )}
              </div>
            </div>

            {WRITE_FIELDS.map((fld, i) => (
              <div key={fld.key}>
                <Heading en={fld.en} ko={fld.ko} index={3 + i} htmlFor={fld.key} />
                <textarea
                  id={fld.key}
                  className={styles.lines}
                  rows={2}
                  maxLength={90}
                  placeholder={fld.hint}
                  value={entry[fld.key]}
                  onChange={(e) => update({ [fld.key]: e.target.value })}
                />
              </div>
            ))}

            <div className={styles.closing}>
              <Heading en="CLOSING" ko="오늘을 닫는 한 문장" index={6} htmlFor="closing" />
              <input
                id="closing"
                className={styles.closingInput}
                maxLength={40}
                placeholder="오늘도 충분히 애썼다."
                value={entry.closing}
                onChange={(e) => update({ closing: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.bottomBar}>
            <button className={styles.primaryBtn} onClick={finish}>
              오늘의 페이지 저장
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button role="radio" aria-checked={active} className={styles.toolBtn} onClick={onClick} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden>
        {children}
      </svg>
      {label}
    </button>
  );
}
