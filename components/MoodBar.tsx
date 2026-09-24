import styles from "./MoodBar.module.css";

type Props = {
  id: string;
  value: number;
  onChange: (v: number) => void;
};

export default function MoodBar({ id, value, onChange }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.bar}>
        <svg className={styles.track} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden>
          <path d="M3 4.5C60 3.2 140 4.8 220 3.6 250 3.2 280 4 297 4.8L296.4 20C250 21 180 19.6 110 20.6 60 21.2 25 20.2 3.6 20.8Z" />
        </svg>
        <div className={styles.fillClip}>
          <div className={styles.fill} style={{ width: `${value}%` }} />
        </div>
        <div className={styles.ticks} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <input
          id={id}
          className={styles.range}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${value}%`}
        />
      </div>
      <output htmlFor={id} className={styles.value}>
        {value}
        <small>%</small>
      </output>
    </div>
  );
}
