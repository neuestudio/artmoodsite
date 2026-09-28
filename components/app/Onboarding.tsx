"use client";

import { useState } from "react";
import MoodDrop from "@/components/ui/MoodDrop";
import { PALETTE } from "@/lib/palette";
import { updateProfile } from "@/lib/profile";
import styles from "./app.module.css";

const STEPS = [
  {
    eyebrow: "artmood",
    title: "오늘의 감정을,\n한 장의 그림으로",
    body: "여덟 가지 무드 컬러로 하루를 색칠해요.\n잘 그릴 필요도, 정답도 없어요.",
  },
  {
    eyebrow: "30초면 충분해요",
    title: "바쁜 날엔 한 방울,\n여유로운 날엔 한 페이지",
    body: "색 하나만 톡 남기는 날도,\n도안을 천천히 채우는 날도 모두 기록이 돼요.",
  },
  {
    eyebrow: "나만 보는 다이어리",
    title: "기록은 이 기기에만\n저장돼요",
    body: "테스트 버전에서는 계정 없이 사용해요.\n모든 기록은 이 브라우저 안에만 남아요.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const finish = () => updateProfile({ onboarded: true, nickname: name.trim().slice(0, 12) });

  return (
    <div className={styles.onboard}>
      <div className={styles.onboardArt} data-step={step} aria-hidden>
        {step === 0 && (
          <div className={styles.onboardDrops}>
            {PALETTE.map((c, i) => (
              <MoodDrop key={c.id} id={c.id} size={i % 3 === 0 ? 58 : 44} style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </div>
        )}
        {step === 1 && (
          <div className={styles.onboardPaint}>
            <span style={{ background: "#9DBF9E", left: "18%", top: "30%" }} />
            <span style={{ background: "#F2C14E", left: "45%", top: "48%" }} />
            <span style={{ background: "#EE8A6F", left: "30%", top: "58%" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/drawings/d3.png" alt="" />
          </div>
        )}
        {step === 2 && (
          <div className={styles.onboardLock}>
            <svg viewBox="0 0 64 64">
              <rect x="14" y="28" width="36" height="26" rx="7" />
              <path d="M22 28v-6a10 10 0 0 1 20 0v6" />
              <circle cx="32" cy="41" r="3" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.onboardBody}>
        <p className={styles.onboardEyebrow}>{s.eyebrow}</p>
        <h1 className={styles.onboardTitle}>{s.title}</h1>
        <p className={styles.onboardText}>{s.body}</p>

        {last && (
          <label className={styles.nameField}>
            <span>어떻게 불러드릴까요?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              placeholder="닉네임 (선택)"
              onKeyDown={(e) => e.key === "Enter" && finish()}
            />
          </label>
        )}
      </div>

      <div className={styles.onboardFoot}>
        <div className={styles.dots} aria-hidden>
          {STEPS.map((_, i) => (
            <i key={i} data-on={i === step ? "" : undefined} />
          ))}
        </div>
        <button className={styles.primaryBtn} onClick={() => (last ? finish() : setStep(step + 1))}>
          {last ? "시작하기" : "다음"}
        </button>
        {!last && (
          <button className={styles.skipBtn} onClick={() => setStep(STEPS.length - 1)}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
