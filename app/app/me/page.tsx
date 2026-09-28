import type { Metadata } from "next";
import Me from "@/components/app/Me";

export const metadata: Metadata = { title: "나" };

export default function MePage() {
  return <Me />;
}
