import { blobFor, colorById } from "@/lib/palette";
import type { CSSProperties } from "react";
import styles from "./ui.module.css";

// 무드 컬러 물감 방울. 색이 없으면 점선 빈 방울.
export default function MoodDrop({
  id,
  size = 28,
  className,
  style,
}: {
  id: string | null | undefined;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const c = colorById(id);
  return (
    <span
      className={`${styles.drop} ${c ? "" : styles.dropEmpty} ${className ?? ""}`}
      style={{ width: size, height: size, background: c?.hex, borderRadius: blobFor(id), ...style }}
      aria-hidden
    />
  );
}
