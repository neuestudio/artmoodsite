"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Heading from "./Heading";
import { formatKey, fromKey } from "@/lib/date";
import { drawingSrc } from "@/lib/drawings";
import { NEUTRAL_INK, colorById } from "@/lib/palette";
import { loadAll, type Entry } from "@/lib/store";
import styles from "./Archive.module.css";

type Item = { entry: Entry; paintUrl: string | null; pageNo: number };

export default function Archive() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let urls: string[] = [];
    loadAll().then((all) => {
      const list = all.map(({ entry, paint }, i) => {
        const paintUrl = paint ? URL.createObjectURL(paint) : null;
        if (paintUrl) urls.push(paintUrl);
        return { entry, paintUrl, pageNo: i + 1 };
      });
      setItems(list.reverse());
    });
    return () => {
      urls.forEach(URL.revokeObjectURL);
      urls = [];
    };
  }, []);

  const months = new Map<string, Item[]>();
  for (const it of items ?? []) {
    const d = fromKey(it.entry.date);
    const k = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.set(k, [...(months.get(k) ?? []), it]);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.top}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>artmood</span>
          <span className={styles.tag}>mood color diary</span>
        </Link>
        <Link href="/" className={styles.back}>
          오늘 페이지로 →
        </Link>
      </header>

      <section className={styles.sheet}>
        <Heading as="h2" en="ARCHIVE" ko="지난 페이지" index={2} />

        {items && items.length === 0 && (
          <p className={styles.empty}>
            아직 기록된 페이지가 없어요.
            <br />
            오늘의 도안에 첫 색을 얹어보세요.
          </p>
        )}

        {items && items.length > 0 && (
          <div className={styles.strip} aria-label="날짜별 오늘의 색">
            {[...items].reverse().map((it) => (
              <Link
                key={it.entry.date}
                href={`/?d=${it.entry.date}`}
                className={styles.dot}
                title={`${formatKey(it.entry.date).numeric} · ${colorById(it.entry.dominant)?.ko ?? "색 없음"}`}
                style={{ background: colorById(it.entry.dominant)?.hex ?? NEUTRAL_INK }}
              />
            ))}
          </div>
        )}

        {[...months.entries()].map(([month, list]) => (
          <div key={month} className={styles.month}>
            <p className={styles.monthLabel}>{month}</p>
            <div className={styles.grid}>
              {list.map((it) => {
                const f = formatKey(it.entry.date);
                const c = colorById(it.entry.dominant);
                return (
                  <Link key={it.entry.date} href={`/?d=${it.entry.date}`} className={styles.card}>
                    <div className={styles.thumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {it.paintUrl && <img src={it.paintUrl} alt="" />}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={drawingSrc(it.entry.drawing)} alt="" className={styles.lineImg} />
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardDate}>
                        {f.numeric} <small>{f.weekdayKo}</small>
                      </span>
                      <span className={styles.cardNo}>{String(it.pageNo).padStart(3, "0")}</span>
                    </div>
                    <p className={styles.cardMood}>
                      <i style={{ background: c?.hex ?? NEUTRAL_INK }} />
                      {c?.ko ?? "색 없음"} · 만족도 {it.entry.satisfaction}%
                    </p>
                    {it.entry.closing && <p className={styles.cardClosing}>{it.entry.closing}</p>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
