"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import ColoringCanvas, { type ColoringHandle, type Tool } from "./ColoringCanvas";
import Heading from "./Heading";
import MoodBar from "./MoodBar";
import { formatKey, isValidKey, shiftKey, todayKey } from "@/lib/date";
import { drawingForDay } from "@/lib/drawings";
import { NEUTRAL_INK, PALETTE, colorById } from "@/lib/palette";
import { emptyEntry, loadEntry, loadPaint, pageNumberFor, saveEntry, type Entry } from "@/lib/store";
import styles from "./Diary.module.css";

type Loaded = { date: string; entry: Entry; paint: Blob | null; pageNo: number };

const SIZES = [
  { px: 9, label: "가는 붓" },
  { px: 24, label: "보통 붓" },
  { px: 52, label: "굵은 붓" },
];

// 물감 방울마다 조금씩 다른 모양
const BLOBS = [
  "52% 48% 55% 45% / 47% 55% 45% 53%",
  "46% 54% 48% 52% / 55% 45% 55% 45%",
  "55% 45% 50% 50% / 45% 52% 48% 55%",
  "48% 52% 45% 55% / 52% 48% 55% 45%",
  "50% 50% 54% 46% / 48% 54% 46% 52%",
  "45% 55% 52% 48% / 54% 46% 50% 50%",
  "53% 47% 47% 53% / 46% 50% 50% 54%",
  "47% 53% 55% 45% / 50% 46% 54% 50%",
];

const WRITE_FIELDS = [
  { key: "what", en: "WHAT", ko: "무슨 일이 있었나요", hint: "오늘 기억에 남는 한 장면" },
  { key: "why", en: "WHY", ko: "왜 그런 마음이 들었나요", hint: "그 감정이 찾아온 이유" },
  { key: "how", en: "HOW", ko: "어떻게 지나 보냈나요", hint: "그 마음을 대한 나의 방식" },
] as const;

export default function Diary({ requested }: { requested: string | null }) {
  const router = useRouter();
  // 날짜는 사용자의 기기 시간 기준 (서버에서는 알 수 없으므로 null)
  const today = useSyncExternalStore(noopSubscribe, todayKey, () => null);
  const [data, setData] = useState<Loaded | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [colorId, setColorId] = useState(PALETTE[0].id);
  const [tool, setTool] = useState<Tool>("brush");
  const [size, setSize] = useState(SIZES[1].px);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");

  const canvasRef = useRef<ColoringHandle>(null);
  const entryRef = useRef<Entry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paintDirty = useRef(false);

  const date = today ? (isValidKey(requested) && requested <= today ? requested : today) : null;

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    (async () => {
      const [saved, paint, pageNo] = await Promise.all([loadEntry(date), loadPaint(date), pageNumberFor(date)]);
      if (cancelled) return;
      const e = saved ?? emptyEntry(date, drawingForDay(date));
      entryRef.current = e;
      paintDirty.current = false;
      setEntry(e);
      setData({ date, entry: e, paint, pageNo });
      setStatus(saved ? "saved" : "idle");
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const e = entryRef.current;
    if (!e) return;
    const next = { ...e, updatedAt: Date.now() };
    let paint: Blob | null | undefined;
    if (paintDirty.current && canvasRef.current) {
      paint = await canvasRef.current.exportPaint();
      paintDirty.current = false;
    }
    await saveEntry(next, paint);
    setStatus("saved");
  }, []);

  const scheduleSave = useCallback(
    (paintChanged: boolean) => {
      if (paintChanged) paintDirty.current = true;
      setStatus("pending");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 700);
    },
    [flush],
  );

  // 창을 닫거나 다른 탭으로 갈 때 남은 기록을 저장
  useEffect(() => {
    const onHide = () => {
      if (timer.current) flush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  const update = (patch: Partial<Entry>) => {
    const next = { ...entryRef.current!, ...patch };
    entryRef.current = next;
    setEntry(next);
    scheduleSave(false);
  };

  const onPaintChange = useCallback(() => {
    const dominant = canvasRef.current?.dominantColor() ?? null;
    const next = { ...entryRef.current!, dominant };
    entryRef.current = next;
    setEntry(next);
    scheduleSave(true);
  }, [scheduleSave]);

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((m) => (m === msg ? null : m)), 5000);
  }, []);

  const go = async (href: string) => {
    if (timer.current) await flush();
    router.push(href);
  };

  const goDate = (key: string) => go(key === today ? "/" : `/?d=${key}`);

  const ready = data && entry && data.date === date;
  const dayHex = colorById(entry?.dominant)?.hex ?? NEUTRAL_INK;
  const color = colorById(colorId)!;
  const f = date ? formatKey(date) : null;

  return (
    <main className={styles.shell} style={{ "--day": dayHex } as CSSProperties}>
      <header className={styles.top}>
        <Link href="/" className={styles.brand} onClick={(e) => { e.preventDefault(); go("/"); }}>
          <span className={styles.logo}>artmood</span>
          <span className={styles.tag}>mood color diary</span>
        </Link>
        <nav className={styles.nav} aria-label="날짜 이동">
          <button onClick={() => date && goDate(shiftKey(date, -1))} disabled={!date}>
            ← 어제
          </button>
          <button onClick={() => go("/")} disabled={!date || date === today} className={styles.todayBtn}>
            오늘
          </button>
          <button onClick={() => date && goDate(shiftKey(date, 1))} disabled={!date || date === today}>
            다음 날 →
          </button>
          <span className={styles.navSep} aria-hidden />
          <button onClick={() => go("/archive")}>지난 페이지</button>
        </nav>
      </header>

      <div className={styles.book} data-ready={ready ? "" : undefined}>
        {/* 왼쪽: 컬러링 */}
        <section className={`${styles.page} ${styles.left}`} aria-label="오늘의 컬러링">
          <div className={styles.art}>
            {ready && (
              <ColoringCanvas
                key={data.date}
                ref={canvasRef}
                drawingId={entry.drawing}
                color={color.hex}
                tool={tool}
                size={size}
                initialPaint={data.paint}
                onChange={onPaintChange}
                onNotice={showNotice}
              />
            )}
          </div>

          <div className={styles.palette} role="radiogroup" aria-label="무드 컬러 팔레트">
            {PALETTE.map((c, i) => (
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
                <span className={styles.drop} style={{ background: c.hex, borderRadius: BLOBS[i] }} />
                <span className={styles.swatchLabel}>{c.ko}</span>
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
              <button className={styles.textBtn} onClick={() => canvasRef.current?.undo()}>
                되돌리기
              </button>
              <button
                className={styles.textBtn}
                onClick={() => {
                  if (confirm("오늘의 색칠을 모두 지울까요? 되돌리기로 다시 살릴 수 있어요.")) canvasRef.current?.clear();
                }}
              >
                비우기
              </button>
            </div>
          </div>

          <p className={styles.notice} role="status">
            {notice ?? (tool === "fill" ? "칠하고 싶은 곳을 눌러보세요. 열린 선 사이로는 색이 번질 수 있어요." : " ")}
          </p>
        </section>

        {/* 오른쪽: 기록 */}
        <section className={`${styles.page} ${styles.right}`} aria-label="오늘의 기록">
          {ready && f && (
            <>
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
                  <p className={styles.num}>{String(data.pageNo).padStart(3, "0")}</p>
                </div>
              </div>

              <div className={styles.block}>
                <Heading en="MOOD" ko="오늘의 만족도" index={2} htmlFor="mood" />
                <MoodBar id="mood" value={entry.satisfaction} onChange={(v) => update({ satisfaction: v })} />
                <p className={styles.dayColor}>
                  {entry.dominant ? (
                    <>
                      오늘의 색 <b>{colorById(entry.dominant)!.ko}</b>
                    </>
                  ) : (
                    "색을 칠하면 오늘의 색이 제목에 번져요"
                  )}
                </p>
              </div>

              {WRITE_FIELDS.map((fld, i) => (
                <div className={styles.block} key={fld.key}>
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

              <div className={`${styles.block} ${styles.closing}`}>
                <Heading en="CLOSING" ko="오늘을 닫는 한 문장" index={6} htmlFor="closing" />
                <input
                  id="closing"
                  className={styles.closingInput}
                  maxLength={48}
                  placeholder="오늘도 충분히 애썼다."
                  value={entry.closing}
                  onChange={(e) => update({ closing: e.target.value })}
                />
              </div>

              <p className={styles.foot}>
                {status === "pending" ? "기록하는 중…" : status === "saved" ? "이 기기에 저장됨" : "쓰는 대로 이 기기에 저장돼요"}
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const noopSubscribe = () => () => {};

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
    <button role="radio" aria-checked={active} className={styles.toolBtn} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden>
        {children}
      </svg>
      {label}
    </button>
  );
}
