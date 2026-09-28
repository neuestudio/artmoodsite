import Link from "next/link";
import MoodDrop from "@/components/ui/MoodDrop";
import ProductArt from "@/components/ui/ProductArt";
import { PALETTE } from "@/lib/palette";
import styles from "./landing.module.css";

// 목업 속 "이번 주" 색 (예시 데이터)
const WEEK = ["calm", "tired", "anxiety", "joy", "warmth", "flutter", null];

export default function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            artmood
          </Link>
          <nav className={styles.navLinks} aria-label="사이트 메뉴">
            <a href="#features">서비스</a>
            <a href="#palette">무드 컬러</a>
            <Link href="/test">마음 색 테스트</Link>
            <a href="#store">스토어</a>
          </nav>
          <Link href="/app" className={styles.navCta}>
            기록 시작하기
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span className={styles.kickerDot} /> 직장인을 위한 감정 컬러링 다이어리
            </p>
            <h1>
              오늘의 감정을,
              <br />
              <span className={styles.hl}>한 장의 그림</span>으로.
            </h1>
            <p className={styles.heroText}>
              여덟 가지 무드 컬러로 하루를 색칠하세요.
              <br />
              바쁜 날엔 30초 한 방울, 여유로운 날엔 한 페이지.
              <br />
              쌓인 색이 한 달의 마음을 보여줘요.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/app" className={styles.ctaDark}>
                오늘의 도안 칠해보기
              </Link>
              <Link href="/test" className={styles.ctaLight}>
                1분 마음 색 테스트 →
              </Link>
            </div>
            <p className={styles.heroNote}>회원가입 없이 바로 시작 · 기록은 내 기기에만 저장</p>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.phone}>
              <div className={styles.screen}>
                <div className={styles.mTop}>
                  <span className={styles.mLogo}>artmood</span>
                  <span>9월 28일</span>
                </div>
                <p className={styles.mHello}>
                  오늘 하루는
                  <br />
                  <b>어떤 색</b>이었나요?
                </p>
                <div className={styles.mCard}>
                  <div className={styles.mArt}>
                    <span style={{ background: "#9DBF9E", left: "12%", top: "22%" }} />
                    <span style={{ background: "#F2C14E", left: "40%", top: "44%" }} />
                    <span style={{ background: "#EE8A6F", left: "22%", top: "56%" }} />
                    <span style={{ background: "#9DBF9E", left: "46%", top: "18%" }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/drawings/d1.png" alt="" />
                  </div>
                  <div className={styles.mInfo}>
                    <small>오늘의 색</small>
                    <b>
                      <MoodDrop id="calm" size={14} /> 평온
                    </b>
                    <div className={styles.mMix}>
                      <i style={{ flex: 52, background: "#9DBF9E" }} />
                      <i style={{ flex: 30, background: "#F2C14E" }} />
                      <i style={{ flex: 18, background: "#EE8A6F" }} />
                    </div>
                    <em>오늘도 충분히 애썼다.</em>
                  </div>
                </div>
                <div className={styles.mWeek}>
                  <small>이번 주의 색</small>
                  <div>
                    {WEEK.map((c, i) => (
                      <span key={i}>
                        <MoodDrop id={c} size={20} />
                        <i>{"일월화수목금토"[i]}</i>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.float} ${styles.floatA}`}>
              <MoodDrop id="joy" size={22} />
              <span>
                <b>한 방울 기록</b>
                <small>30초면 충분해요</small>
              </span>
            </div>
            <div className={`${styles.float} ${styles.floatB}`}>
              <span className={styles.floatMix}>
                <i style={{ flex: 46, background: "#9DBF9E" }} />
                <i style={{ flex: 28, background: "#9A8FB5" }} />
                <i style={{ flex: 26, background: "#F2C14E" }} />
              </span>
              <small>이달의 감정 비율</small>
            </div>
          </div>
        </div>
      </section>

      {/* 문제 제기 */}
      <section className={styles.problem}>
        <p className={styles.sectionKicker}>WHY ARTMOOD</p>
        <h2>
          기록이 숙제가 되는 순간,
          <br />
          다이어리는 멈춥니다.
        </h2>
        <p className={styles.sectionText}>
          퇴근 후 남은 힘으로 긴 글을 쓰기는 어려워요. 감정에 점수를 매기는 것도 어색하고요.
          <br />
          artmood는 쓰는 대신 <b>칠하는</b> 다이어리예요. 평가하지 않고, 강요하지 않고, 색으로 풀어내요.
        </p>
      </section>

      {/* 핵심 기능 */}
      <section id="features" className={styles.features}>
        <article className={styles.feature}>
          <div className={styles.featureArt} data-kind="drop">
            {["joy", "calm", "sadness", "flutter"].map((c, i) => (
              <MoodDrop key={c} id={c} size={[52, 38, 44, 30][i]} />
            ))}
          </div>
          <p className={styles.featureNo}>01</p>
          <h3>30초, 한 방울 기록</h3>
          <p>바쁜 날엔 오늘의 색 하나만 톡. 한 줄 메모는 선택이에요. 지하철 한 정거장이면 충분해요.</p>
        </article>
        <article className={styles.feature}>
          <div className={styles.featureArt} data-kind="page">
            <div className={styles.fPaint}>
              <span style={{ background: "#D98BA0", left: "18%", top: "30%" }} />
              <span style={{ background: "#9A8FB5", left: "42%", top: "46%" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/drawings/d2.png" alt="" />
            </div>
          </div>
          <p className={styles.featureNo}>02</p>
          <h3>매일 새 도안, 오늘의 페이지</h3>
          <p>손그림 도안을 자유롭게 색칠하고, What · Why · How와 오늘을 닫는 한 문장을 남겨요.</p>
        </article>
        <article className={styles.feature}>
          <div className={styles.featureArt} data-kind="cal">
            <div className={styles.fCal}>
              {Array.from({ length: 21 }, (_, i) => (
                <MoodDrop key={i} id={i % 5 === 4 ? null : PALETTE[(i * 3) % 8].id} size={20} />
              ))}
            </div>
          </div>
          <p className={styles.featureNo}>03</p>
          <h3>한 달의 마음을 한눈에</h3>
          <p>칠한 색이 달력에 모여 감정 비율이 돼요. 월간 무드 카드로 저장해 공유할 수도 있어요.</p>
        </article>
      </section>

      {/* 팔레트 */}
      <section id="palette" className={styles.palette}>
        <div className={styles.paletteHead}>
          <p className={styles.sectionKicker}>MOOD COLOR PALETTE</p>
          <h2>여덟 가지 마음의 색</h2>
          <p className={styles.sectionText}>좋은 감정도, 무거운 감정도 모두 아름다운 색이에요. 어떤 색도 틀리지 않아요.</p>
        </div>
        <ul className={styles.paletteGrid}>
          {PALETTE.map((c) => (
            <li key={c.id}>
              <MoodDrop id={c.id} size={54} />
              <div>
                <b>{c.ko}</b>
                <span className={styles.pEn}>
                  {c.en} · {c.colorName}
                </span>
                <small>{c.line}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 흐름 */}
      <section className={styles.flow}>
        <p className={styles.sectionKicker}>HOW IT WORKS</p>
        <h2>하루를 닫는 세 단계</h2>
        <ol className={styles.steps}>
          <li>
            <span>1</span>
            <b>고르기</b>
            <p>오늘 마음에 가장 가까운 무드 컬러를 골라요.</p>
          </li>
          <li>
            <span>2</span>
            <b>칠하기</b>
            <p>오늘의 도안 위에 붓 가는 대로 색을 얹어요.</p>
          </li>
          <li>
            <span>3</span>
            <b>돌아보기</b>
            <p>쌓인 색으로 한 주, 한 달의 마음을 돌아봐요.</p>
          </li>
        </ol>
      </section>

      {/* 테스트 배너 */}
      <section className={styles.testBanner}>
        <div className={styles.testDrops} aria-hidden>
          {PALETTE.map((c, i) => (
            <MoodDrop key={c.id} id={c.id} size={[40, 28, 34, 24, 38, 30, 26, 36][i]} />
          ))}
        </div>
        <div>
          <p className={styles.sectionKicker}>1 MINUTE TEST</p>
          <h2>요즘 내 마음은 무슨 색일까?</h2>
          <p className={styles.sectionText}>회사에서, 퇴근길에, 혼자 있는 밤에. 여덟 가지 질문으로 알아봐요.</p>
          <Link href="/test" className={styles.ctaDark}>
            테스트 하러 가기
          </Link>
        </div>
      </section>

      {/* 스토어 */}
      <section id="store" className={styles.store}>
        <div className={styles.storeArt}>
          <ProductArt kind="book-pencils" />
        </div>
        <div className={styles.storeCopy}>
          <p className={styles.sectionKicker}>ARTMOOD OBJECT</p>
          <h2>
            화면 밖에서도,
            <br />
            종이 위에 하루를 색칠해요
          </h2>
          <p className={styles.sectionText}>
            앱 속 도안을 엮은 무드 컬러링북과 8 무드 컬러 색연필. 페이지마다 있는 QR로 종이 위의 색이 앱의 달력으로 이어져요.
          </p>
          <span className={styles.badge}>
            <i /> 크라우드 펀딩 준비 중
          </span>
          <Link href="/app/shop" className={styles.ctaLight}>
            구성 보기 →
          </Link>
        </div>
      </section>

      {/* 마무리 */}
      <section className={styles.closing}>
        <h2>
          오늘 하루는
          <br />
          어떤 색이었나요?
        </h2>
        <Link href="/app" className={styles.ctaDark}>
          지금 한 방울 남기기
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>artmood</span>
          <p>색으로 기록하는 감정 다이어리 · 테스트 버전</p>
          <p className={styles.footSmall}>
            테스트 버전의 모든 기록은 서버로 전송되지 않고 이용자의 브라우저에만 저장됩니다. 마음 색 테스트는 의학적 진단이
            아닙니다.
          </p>
          <p className={styles.footSmall}>© 2026 artmood</p>
        </div>
      </footer>
    </div>
  );
}
