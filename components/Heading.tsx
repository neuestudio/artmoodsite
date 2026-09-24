import styles from "./Heading.module.css";

// 붓으로 한 번 그은 듯한 밑줄. 네 가지 결을 번갈아 써서 같은 규칙 안에서도 조금씩 다르게.
const STROKES = [
  "M2 6.5C18 4.2 44 3.4 70 4.6 88 5.4 104 5 118 4.2L117.2 7.6C101 8.8 84 8.4 64 8.6 40 8.8 18 9.6 3.4 9.2Z",
  "M3 5.2C22 5.8 40 3.6 62 3.8 84 4 102 5.6 117 5L118 8.2C100 9.4 82 7.6 60 8 40 8.4 20 9.4 2.4 8.4Z",
  "M1.6 7C16 5 36 4.6 58 4.2 80 3.8 100 3.2 118.4 4.8L116.8 8C98 7.4 78 8.6 56 8.8 34 9 16 9.2 2.6 9.6Z",
  "M2.4 4.8C20 3.8 46 5 68 4.4 90 3.8 106 4.6 117.6 6L116.4 8.8C104 8.2 86 9 64 8.6 42 8.2 22 8.8 3 8Z",
];

type Props = {
  en: string;
  ko: string;
  index: number;
  as?: "h2" | "h3";
  htmlFor?: string;
};

export default function Heading({ en, ko, index, as = "h3", htmlFor }: Props) {
  const Tag = as;
  const inner = (
    <>
      <span className={styles.en}>
        {en}
        <svg className={styles.stroke} viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden>
          <path d={STROKES[index % STROKES.length]} />
        </svg>
      </span>
      <span className={styles.ko}>{ko}</span>
    </>
  );
  return (
    <Tag className={styles.heading}>
      {htmlFor ? <label htmlFor={htmlFor}>{inner}</label> : inner}
    </Tag>
  );
}
