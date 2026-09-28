import type { Metadata } from "next";
import MoodTest from "@/components/test/MoodTest";

export const metadata: Metadata = {
  title: "요즘 내 마음은 무슨 색일까? 무드 컬러 테스트",
  description: "여덟 가지 질문으로 알아보는 요즘 내 마음의 색. 1분이면 끝나는 artmood 무드 컬러 테스트",
};

export default function TestPage() {
  return <MoodTest />;
}
