"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MoodDrop from "@/components/ui/MoodDrop";
import Sheet from "@/components/ui/Sheet";
import { toast } from "@/components/ui/toast";
import { notifyChanged } from "@/lib/bus";
import { colorById } from "@/lib/palette";
import { resetProfile, updateProfile, useProfile } from "@/lib/profile";
import { entryColor, exportAll, listEntries, wipeAll, type Entry } from "@/lib/store";
import styles from "./me.module.css";

const TIMES = ["20:00", "21:00", "21:30", "22:00", "23:00"];

export default function Me() {
  const profile = useProfile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    listEntries().then(setEntries);
  }, []);

  if (!profile) return null;
  const test = profile.testResult ? colorById(profile.testResult.id) : null;
  const colors: Record<string, number> = {};
  entries.forEach((e) => {
    const c = entryColor(e);
    if (c) colors[c] = (colors[c] ?? 0) + 1;
  });
  const favorite = Object.entries(colors).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pages = entries.filter((e) => e.ratios?.length || e.what || e.closing).length;

  const download = async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artmood-기록-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("기록을 파일로 내보냈어요");
  };

  const wipe = async () => {
    if (!confirm("이 기기에 저장된 모든 기록과 설정을 지울까요? 되돌릴 수 없어요.")) return;
    await wipeAll();
    notifyChanged();
    resetProfile();
  };

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1>나</h1>
      </header>

      <section className={styles.profile}>
        <MoodDrop id={test?.id ?? favorite ?? null} size={56} />
        <div>
          <p className={styles.name}>{profile.nickname || "이름 없는 기록자"}</p>
          <button
            className={styles.link}
            onClick={() => {
              setName(profile.nickname);
              setEditName(true);
            }}
          >
            닉네임 바꾸기
          </button>
        </div>
      </section>

      <section className={styles.stats}>
        <div>
          <b>{entries.length}</b>
          <small>함께한 날</small>
        </div>
        <div>
          <b>{pages}</b>
          <small>채운 페이지</small>
        </div>
        <div>
          <b className={styles.fav}>
            {favorite ? (
              <>
                <MoodDrop id={favorite} size={14} />
                {colorById(favorite)!.ko}
              </>
            ) : (
              "-"
            )}
          </b>
          <small>가장 자주 칠한 색</small>
        </div>
      </section>

      <Link href="/test" className={styles.row}>
        <span className={styles.rowIcon}>
          <MoodDrop id={test?.id ?? "calm"} size={20} />
        </span>
        <span className={styles.rowText}>
          요즘 내 마음의 색
          <small>{test ? `${test.ko} · ${test.colorName}` : "1분 테스트로 알아보기"}</small>
        </span>
        <span className={styles.chev}>›</span>
      </Link>

      <h2 className={styles.groupTitle}>설정</h2>
      <div className={styles.group}>
        <label className={styles.row}>
          <span className={styles.rowText}>
            기록 알림 시간
            <small>앱 버전에서 이 시간에 부드럽게 알려드려요</small>
          </span>
          <select
            className={styles.select}
            value={profile.notifyTime}
            onChange={(e) => {
              updateProfile({ notifyTime: e.target.value });
              toast(`알림 시간을 ${e.target.value}로 정했어요`);
            }}
          >
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button className={styles.row} onClick={download}>
          <span className={styles.rowText}>
            기록 내보내기
            <small>모든 기록을 파일(JSON)로 저장해요</small>
          </span>
          <span className={styles.chev}>›</span>
        </button>
        <button className={styles.row} onClick={wipe}>
          <span className={`${styles.rowText} ${styles.danger}`}>
            모든 기록 지우기
            <small>이 기기에 저장된 기록과 설정을 삭제해요</small>
          </span>
        </button>
      </div>

      <h2 className={styles.groupTitle}>정보</h2>
      <div className={styles.group}>
        <Link href="/" className={styles.row}>
          <span className={styles.rowText}>artmood 소개</span>
          <span className={styles.chev}>›</span>
        </Link>
        <div className={styles.row}>
          <span className={styles.rowText}>
            개인정보와 기록 보관
            <small>
              테스트 버전은 계정 없이 동작해요. 기록은 서버로 전송되지 않고 이 브라우저 안에만 저장되며, 브라우저 데이터를
              지우면 함께 사라져요.
            </small>
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowText}>버전</span>
          <span className={styles.version}>테스트 0.1</span>
        </div>
      </div>

      <Sheet open={editName} onClose={() => setEditName(false)} title="닉네임">
        <input
          className={styles.nameInput}
          value={name}
          maxLength={12}
          onChange={(e) => setName(e.target.value)}
          placeholder="어떻게 불러드릴까요?"
          autoFocus
        />
        <button
          className={styles.saveBtn}
          onClick={() => {
            updateProfile({ nickname: name.trim() });
            setEditName(false);
            toast("닉네임을 바꿨어요");
          }}
        >
          저장
        </button>
      </Sheet>
    </div>
  );
}
