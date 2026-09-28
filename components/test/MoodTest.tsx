"use client";

import Link from "next/link";
import { useState } from "react";
import MoodDrop from "@/components/ui/MoodDrop";
import MoodMix from "@/components/ui/MoodMix";
import { Toaster, toast } from "@/components/ui/toast";
import { QUESTIONS, RESULTS, scoreAnswers, scoreRatios } from "@/lib/moodTest";
import { PALETTE, colorById } from "@/lib/palette";
import { saveTestResult } from "@/lib/profile";
import { downloadBlob, renderTestCard } from "@/lib/shareImage";
import styles from "./test.module.css";

export default function MoodTest() {
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [result, setResult] = useState<{ id: string; scores: Record<string, number> } | null>(null);
  const [busy, setBusy] = useState(false);

  const step = answers?.length ?? -1;

  const answer = (i: number) => {
    const next = [...(answers ?? []), i];
    if (next.length === QUESTIONS.length) {
      const r = scoreAnswers(next);
      setResult(r);
      saveTestResult(r);
      window.scrollTo({ top: 0 });
    }
    setAnswers(next);
  };

  const restart = () => {
    setAnswers([]);
    setResult(null);
  };

  const saveCard = async () => {
    if (!result) return;
    setBusy(true);
    try {
      const c = colorById(result.id)!;
      const blob = await renderTestCard(c, RESULTS[result.id].title, scoreRatios(result.scores));
      const file = new File([blob], `artmood-${c.id}.png`, { type: "image/png" });
      // 모바일에서는 공유 시트로, 아니면 파일 저장
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "요즘 내 마음의 색", text: `요즘 내 마음의 색은 ${c.ko}` }).catch(() => {});
      } else {
        downloadBlob(blob, file.name);
        toast("결과 카드를 저장했어요");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.frame}>
      <div className={styles.column}>
        <header className={styles.top}>
          <Link href="/" className={styles.logo}>
            artmood
          </Link>
          {step >= 0 && !result && (
            <span className={styles.count}>
              {step + 1} / {QUESTIONS.length}
            </span>
          )}
        </header>

        {step < 0 && (
          <section className={styles.intro}>
            <div className={styles.introDrops} aria-hidden>
              {PALETTE.map((c, i) => (
                <MoodDrop key={c.id} id={c.id} size={[46, 34, 40, 30, 44, 36, 32, 42][i]} />
              ))}
            </div>
            <p className={styles.eyebrow}>1분 무드 컬러 테스트</p>
            <h1>
              요즘 내 마음은
              <br />
              무슨 색일까?
            </h1>
            <p className={styles.lead}>
              회사에서, 퇴근길에, 혼자 있는 밤에.
              <br />
              여덟 가지 질문으로 요즘의 마음을 색으로 비춰봐요.
            </p>
            <button className={styles.primary} onClick={() => setAnswers([])}>
              테스트 시작하기
            </button>
            <p className={styles.disclaimer}>가벼운 마음 체크예요. 의학적 진단이 아니에요.</p>
          </section>
        )}

        {step >= 0 && step < QUESTIONS.length && !result && (
          <section className={styles.question} key={step}>
            <div className={styles.progress} aria-hidden>
              <i style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
            </div>
            <p className={styles.qNum}>Q{step + 1}</p>
            <h2>{QUESTIONS[step].q}</h2>
            <div className={styles.options}>
              {QUESTIONS[step].options.map((o, i) => (
                <button key={o.label} className={styles.option} onClick={() => answer(i)}>
                  {o.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button className={styles.back} onClick={() => setAnswers(answers!.slice(0, -1))}>
                ← 이전 질문
              </button>
            )}
          </section>
        )}

        {result && (
          <ResultView result={result} onRestart={restart} onSave={saveCard} busy={busy} appHref="/app" />
        )}
      </div>
      <Toaster />
    </div>
  );
}

function ResultView({
  result,
  onRestart,
  onSave,
  busy,
  appHref,
}: {
  result: { id: string; scores: Record<string, number> };
  onRestart: () => void;
  onSave: () => void;
  busy: boolean;
  appHref: string;
}) {
  const c = colorById(result.id)!;
  const copy = RESULTS[result.id];
  const ratios = scoreRatios(result.scores);
  return (
    <section className={styles.result} style={{ "--rc": c.hex } as React.CSSProperties}>
      <div className={styles.resultCard}>
        <p className={styles.eyebrow}>요즘 내 마음의 색</p>
        <div className={styles.resultBlob} aria-hidden>
          <MoodDrop id={c.id} size={150} />
        </div>
        <h1 className={styles.resultName}>{c.ko}</h1>
        <p className={styles.resultEn}>
          {c.en} · {c.colorName}
        </p>
        <h2 className={styles.resultTitle}>{copy.title}</h2>
        <p className={styles.resultBody}>{copy.body}</p>
      </div>

      <div className={styles.block}>
        <h3>내 마음 속 색의 비율</h3>
        <MoodMix ratios={ratios} />
      </div>

      <div className={styles.block}>
        <h3>오늘 해보면 좋은 한 가지</h3>
        <p className={styles.ritual}>
          <MoodDrop id={c.id} size={18} />
          {copy.ritual}
        </p>
      </div>

      <div className={styles.actions}>
        <Link href={appHref} className={styles.primary}>
          artmood에 오늘의 색 기록하기
        </Link>
        <div className={styles.row}>
          <button className={styles.secondary} onClick={onSave} disabled={busy}>
            결과 카드 저장
          </button>
          <button className={styles.secondary} onClick={onRestart}>
            다시 하기
          </button>
        </div>
      </div>
      <p className={styles.disclaimer}>가벼운 마음 체크예요. 의학적 진단이 아니에요.</p>
    </section>
  );
}
