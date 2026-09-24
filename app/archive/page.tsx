import type { Metadata } from "next";
import Archive from "@/components/Archive";

export const metadata: Metadata = {
  title: "지난 페이지 · artmood",
};

export default function ArchivePage() {
  return <Archive />;
}
