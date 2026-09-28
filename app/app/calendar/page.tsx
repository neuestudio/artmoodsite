import type { Metadata } from "next";
import CalendarView from "@/components/app/CalendarView";

export const metadata: Metadata = { title: "달력" };

export default function CalendarPage() {
  return <CalendarView />;
}
