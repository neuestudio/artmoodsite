"use client";

import { useEffect, useState } from "react";
import { drawingSrc } from "@/lib/drawings";
import { loadPaint, type Entry } from "@/lib/store";
import MoodDrop from "./MoodDrop";
import styles from "./ui.module.css";

// 그날의 컬러링 썸네일. 색칠한 그림이 없고 한 방울만 있으면 방울을 보여준다.
export default function DayThumb({ entry, drawing }: { entry: Entry | null; drawing: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const date = entry?.date;
  const hasPaint = !!entry?.dominant || !!entry?.ratios?.length;

  useEffect(() => {
    if (!date || !hasPaint) return;
    let u: string | null = null;
    let cancelled = false;
    loadPaint(date).then((blob) => {
      if (cancelled || !blob) return;
      u = URL.createObjectURL(blob);
      setUrl(u);
    });
    return () => {
      cancelled = true;
      if (u) URL.revokeObjectURL(u);
    };
  }, [date, hasPaint]);

  return (
    <div className={styles.thumb}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && hasPaint && <img src={url} alt="" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={drawingSrc(drawing)} alt="" className={styles.thumbLines} />
      {!hasPaint && entry?.quick && <MoodDrop id={entry.quick.color} size={34} className={styles.thumbDrop} />}
    </div>
  );
}
