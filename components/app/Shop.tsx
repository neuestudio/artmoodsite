"use client";

import MoodDrop from "@/components/ui/MoodDrop";
import ProductArt from "@/components/ui/ProductArt";
import { toast } from "@/components/ui/toast";
import { updateProfile, useProfile } from "@/lib/profile";
import styles from "./shop.module.css";

const PRODUCTS = [
  {
    id: "set-a",
    art: "book-bookmark" as const,
    tag: "입문 세트",
    name: "컬러링북 + 색칠하는 책갈피",
    desc: "하루 한 장, 부담 없이 시작하는 구성. 책갈피에도 오늘의 색을 칠해 꽂아둘 수 있어요.",
    items: ["artmood 무드 컬러링북 (30일 도안)", "색칠하는 책갈피 2종", "앱 연동 QR 페이지"],
  },
  {
    id: "set-b",
    art: "book-pencils" as const,
    tag: "풀 세트",
    name: "컬러링북 + 8 무드 컬러 색연필",
    desc: "앱 속 여덟 가지 무드 컬러를 손에 쥐는 구성. 종이 위에서도 같은 색으로 감정을 기록해요.",
    items: ["artmood 무드 컬러링북 (30일 도안)", "8 무드 컬러 색연필 세트", "앱 연동 QR 페이지"],
  },
];

const IDEAS = [
  { name: "무드 캔들", desc: "여덟 가지 감정에 어울리는 향", color: "calm" },
  { name: "무드 티", desc: "퇴근 후 한 잔, 마음을 고르는 차", color: "warmth" },
  { name: "무드 엽서", desc: "칠한 도안을 누군가에게", color: "flutter" },
];

export default function Shop() {
  const profile = useProfile();
  const alerts = profile?.fundingAlerts ?? [];

  const toggle = (id: string, name: string) => {
    const on = alerts.includes(id);
    updateProfile({ fundingAlerts: on ? alerts.filter((a) => a !== id) : [...alerts, id] });
    toast(on ? "알림 신청을 취소했어요" : `‘${name}’ 오픈 알림을 신청했어요`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1>스토어</h1>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>첫 번째 artmood 오브젝트</p>
        <h2>
          화면 밖에서도,
          <br />
          종이 위에 하루를 색칠해요
        </h2>
        <p className={styles.heroText}>
          앱 속 도안을 한 권의 컬러링북으로 엮고 있어요. 크라우드 펀딩으로 먼저 만나보세요.
        </p>
        <span className={styles.badge}>
          <i /> 펀딩 준비 중
        </span>
      </section>

      <div className={styles.products}>
        {PRODUCTS.map((p) => {
          const on = alerts.includes(p.id);
          return (
            <article key={p.id} className={styles.product}>
              <div className={styles.art}>
                <ProductArt kind={p.art} />
                <span className={styles.tag}>{p.tag}</span>
              </div>
              <div className={styles.body}>
                <h3>{p.name}</h3>
                <p className={styles.desc}>{p.desc}</p>
                <ul className={styles.items}>
                  {p.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <div className={styles.priceRow}>
                  <span>가격은 펀딩 오픈 때 공개돼요</span>
                </div>
                <button className={styles.alertBtn} data-on={on ? "" : undefined} onClick={() => toggle(p.id, p.name)}>
                  {on ? "✓ 오픈 알림 신청됨" : "오픈 알림 받기"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className={styles.bridge}>
        <h3>종이와 앱이 이어져요</h3>
        <ol>
          <li>
            <span>1</span>
            <p>
              <b>종이에 칠하기</b>
              컬러링북의 오늘 도안을 색연필로 채워요
            </p>
          </li>
          <li>
            <span>2</span>
            <p>
              <b>QR 스캔</b>
              페이지마다 있는 QR을 휴대폰으로 비춰요
            </p>
          </li>
          <li>
            <span>3</span>
            <p>
              <b>앱에 한 방울</b>
              오늘의 색이 달력에 차곡차곡 쌓여요
            </p>
          </li>
        </ol>
      </section>

      <section className={styles.ideas}>
        <h3>
          이런 것도 구상하고 있어요 <small>구상 단계</small>
        </h3>
        <div className={styles.ideaList}>
          {IDEAS.map((i) => (
            <div key={i.name} className={styles.idea}>
              <MoodDrop id={i.color} size={30} />
              <b>{i.name}</b>
              <small>{i.desc}</small>
            </div>
          ))}
        </div>
      </section>

      <p className={styles.foot}>테스트 버전이에요. 실제 주문이나 결제는 이루어지지 않아요.</p>
    </div>
  );
}
