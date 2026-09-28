import type { Metadata } from "next";
import DayEditor from "@/components/app/DayEditor";

export const metadata: Metadata = { title: "오늘의 페이지" };

export default async function DayPage({ searchParams }: PageProps<"/app/day">) {
  const { d } = await searchParams;
  return <DayEditor requested={typeof d === "string" ? d : null} />;
}
