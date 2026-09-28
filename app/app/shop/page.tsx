import type { Metadata } from "next";
import Shop from "@/components/app/Shop";

export const metadata: Metadata = { title: "스토어" };

export default function ShopPage() {
  return <Shop />;
}
