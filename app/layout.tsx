import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gowun_Batang, Nanum_Pen_Script } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

const serifKo = Gowun_Batang({
  variable: "--font-ko",
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
});

const serifEn = Cormorant_Garamond({
  variable: "--font-en",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const hand = Nanum_Pen_Script({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "artmood · 색으로 기록하는 감정 다이어리",
    template: "%s · artmood",
  },
  description: "여덟 가지 무드 컬러로 오늘의 감정을 색칠하고, 한 방울로 기록하고, 한 달의 마음을 돌아보는 감정 다이어리",
  openGraph: {
    title: "artmood · 색으로 기록하는 감정 다이어리",
    description: "오늘 하루는 어떤 색이었나요? 30초면 충분한 감정 기록",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EFE8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${serifKo.variable} ${serifEn.variable} ${hand.variable}`}>
      <body>
        {children}
        <PaperFilters />
      </body>
    </html>
  );
}

// 수채화 가장자리와 손으로 그린 선에 쓰는 공용 SVG 필터
function PaperFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="wc-edge">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="4" />
      </filter>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="2.5" />
      </filter>
    </svg>
  );
}
