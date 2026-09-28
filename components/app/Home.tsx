"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DayThumb from "@/components/ui/DayThumb";
import MoodDrop from "@/components/ui/MoodDrop";
import MoodMix from "@/components/ui/MoodMix";
import { onChanged, openRecord } from "@/lib/bus";
import { WEEK_LABELS, formatKey, formatShort, fromKey, todayKey, weekKeys } from "@/lib/date";
import { drawingForDay } from "@/lib/drawings";
import { colorById } from "@/lib/palette";
import { useProfile } from "@/lib/profile";
import { entryColor, entryRatios, listEntries, type Entry } from "@/lib/store";
import styles from "./home.module.css";

// 매일 바뀌는 짧은 기록 이야기 (칼럼 미리보기 역할)
const NOTES = [
  { tag: "기록 팁", text: "색에는 정답이 없어요. 오늘 끌리는 색이 곧 오늘의 감정이에요." },
  { tag: "마음 공부", text: "화는 소중한 무언가가 침범당했다는 신호래요. 참기 전에 먼저 알아차려 주세요." },
  { tag: "기록 팁", text: "바쁜 날엔 한 방울만 남겨도 충분해요. 빈칸 없이 쌓인 달력이 쉼표가 되어줄 거예요." },
  { tag: "마음 공부", text: "불안은 머릿속에 두면 커지고, 밖으로 꺼내면 작아진다고 해요. 한 줄로 적어보세요." },
  { tag: "퇴근길 한 줄", text: "오늘 하루도 잘 버텼어요. 그걸로 충분한 날도 있어요." },
  { tag: "마음 공부", text: "슬픔은 고쳐야 할 문제가 아니라, 잠시 쉬어가라는 신호일 때가 많아요." },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "늦은 밤이에요";
  if (h < 11) return "좋은 아침이에요";
  if (h < 17) return "오후도 힘내고 있나요";
  return "오늘 하루 수고했어요";
}

export default function Home() {
  const profile = useProfile();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const today = todayKey();

  useEffect(() => {
    const load = () => listEntries().then(setEntries);
    load();
    return onChanged(load);
  }, []);

  const byDate = new Map((entries ?? []).map((e) => [e.date, e]));
  const todayEntry = byDate.get(today) ?? null;
  const todayColor = entryColor(todayEntry);
  const recent = [...(entries ?? [])].reverse().filter((e) => e.date !== today).slice(0, 6);
  const f = formatKey(today);
  const note = NOTES[fromKey(today).getDate() % NOTES.length];
  const name = profile?.nickname;
  const test = profile?.testResult ? colorById(profile.testResult.id) : null;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <span className={styles.logo}>artmood</span>
        <span className={styles.today}>
          {fromKey(today).getMonth() + 1}월 {fromKey(today).getDate()}일 {f.weekdayKo}요일
        </span>
      </header>

      <section className={styles.hello}>
        <p>{greeting()}</p>
        <h1>
          {name ? `${name}님, ` : ""}
          <br />
          오늘 하루는 <em>어떤 색</em>이었나요?
        </h1>
      </section>

      {/* 오늘 */}
      <section className={styles.todayCard} style={{ "--tc": colorById(todayColor)?.hex ?? "#E9E2D6" } as React.CSSProperties}>
        <div className={styles.todayThumb}>
          <DayThumb entry={todayEntry} drawing={todayEntry?.drawing ?? drawingForDay(today)} />
        </div>
        <div className={styles.todayInfo}>
          {todayColor ? (
            <>
              <p className={styles.label}>오늘의 색</p>
              <p className={styles.todayMood}>
                <MoodDrop id={todayColor} size={22} />
                {colorById(todayColor)!.ko}
              </p>
              <MoodMix ratios={entryRatios(todayEntry!)} compact />
              <p className={styles.todayNote}>
                {todayEntry?.closing || todayEntry?.quick?.note || colorById(todayColor)!.line}
              </p>
            </>
          ) : (
            <>
              <p className={styles.label}>오늘의 도안</p>
              <p className={styles.todayEmpty}>아직 비어 있어요.{"\n"}어떤 색으로 채워볼까요?</p>
            </>
          )}
        </div>
        <div className={styles.todayActions}>
          <button className={styles.btnDark} onClick={() => openRecord("quick")}>
            {todayEntry?.quick ? "한 방울 바꾸기" : "한 방울 기록"}
            <small>30초</small>
          </button>
          <Link className={styles.btnLight} href="/app/day">
            {todayEntry?.ratios?.length || todayEntry?.what ? "페이지 이어 쓰기" : "도안 색칠하기"}
            <small>10분</small>
          </Link>
        </div>
      </section>

      {/* 이번 주 */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2>이번 주의 색</h2>
          <Link href="/app/calendar">달력 보기</Link>
        </div>
        <div className={styles.week}>
          {weekKeys(today).map((k, i) => {
            const e = byDate.get(k);
            const future = k > today;
            const inner = (
              <>
                <span className={styles.wLabel}>{WEEK_LABELS[i]}</span>
                <MoodDrop id={entryColor(e)} size={30} />
                <span className={styles.wDate}>{fromKey(k).getDate()}</span>
              </>
            );
            return future ? (
              <span key={k} className={styles.wDay} data-future="">
                {inner}
              </span>
            ) : (
              <Link
                key={k}
                href={k === today ? "/app/day" : `/app/day?d=${k}`}
                className={styles.wDay}
                data-today={k === today ? "" : undefined}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 테스트 */}
      {test ? (
        <Link href="/test" className={styles.testDone}>
          <MoodDrop id={test.id} size={40} />
          <span>
            <small>요즘 내 마음의 색</small>
            <b>
              {test.ko} · {test.colorName}
            </b>
          </span>
          <span className={styles.arrow}>다시 해보기</span>
        </Link>
      ) : (
        <Link href="/test" className={styles.testCta}>
          <span className={styles.testDrops} aria-hidden>
            <MoodDrop id="calm" size={34} />
            <MoodDrop id="flutter" size={26} />
            <MoodDrop id="anxiety" size={30} />
          </span>
          <span>
            <small>1분 테스트</small>
            <b>요즘 내 마음은 무슨 색일까?</b>
          </span>
          <span className={styles.arrow}>→</span>
        </Link>
      )}

      {/* 최근 */}
      <section className={styles.section}>
        <div className={styles.cardHead}>
          <h2>지난 페이지</h2>
          {recent.length > 0 && <Link href="/app/calendar">전체</Link>}
        </div>
        {entries && recent.length === 0 ? (
          <p className={styles.emptyText}>기록이 쌓이면 이곳에 지난 페이지가 모여요.</p>
        ) : (
          <div className={styles.recent}>
            {recent.map((e) => (
              <Link key={e.date} href={`/app/day?d=${e.date}`} className={styles.recentItem}>
                <DayThumb entry={e} drawing={e.drawing} />
                <span className={styles.recentMeta}>
                  <MoodDrop id={entryColor(e)} size={10} />
                  {formatShort(e.date)}
                </span>
                <span className={styles.recentText}>{e.closing || e.quick?.note || colorById(entryColor(e))?.line}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 오늘의 한 마디 */}
      <section className={styles.note}>
        <span>{note.tag}</span>
        <p>{note.text}</p>
      </section>

      <Link href="/app/shop" className={styles.shopBanner}>
        <span>
          <small>펀딩 준비 중</small>
          <b>종이 위에서도, artmood 컬러링북</b>
        </span>
        <span className={styles.bannerArt} aria-hidden>
          {["#F2C14E", "#EE8A6F", "#9DBF9E", "#4A6FA5"].map((c, i) => (
            <i key={c} style={{ background: c, transform: `rotate(${i * 9 - 12}deg)` }} />
          ))}
        </span>
      </Link>
    </div>
  );
}
