import { colorById } from "@/lib/palette";
import type { MoodRatio } from "@/lib/labels";
import styles from "./ui.module.css";

// 감정 비율 막대 + 범례
export default function MoodMix({ ratios, compact = false }: { ratios: MoodRatio[]; compact?: boolean }) {
  if (!ratios.length) return null;
  return (
    <div className={compact ? styles.mixCompact : undefined}>
      <div
        className={styles.mixBar}
        role="img"
        aria-label={ratios.map((r) => `${colorById(r.id)?.ko} ${r.ratio}%`).join(", ")}
      >
        {ratios.map((r) => (
          <span key={r.id} style={{ flexGrow: r.ratio, background: colorById(r.id)?.hex }} />
        ))}
      </div>
      {!compact && (
        <ul className={styles.mixLegend}>
          {ratios.map((r, i) => (
            <li key={r.id} data-top={i === 0 ? "" : undefined}>
              <i style={{ background: colorById(r.id)?.hex }} />
              {colorById(r.id)?.ko}
              <span>{r.ratio}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
