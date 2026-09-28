"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useProfile } from "@/lib/profile";
import type { RecordKind } from "@/lib/bus";
import { Toaster } from "@/components/ui/toast";
import Onboarding from "./Onboarding";
import RecordSheets from "./RecordSheets";
import TabBar from "./TabBar";
import styles from "./app.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const pathname = usePathname();
  const [record, setRecord] = useState<{ kind: RecordKind; date?: string } | null>(null);

  useEffect(() => {
    const on = (e: Event) => setRecord((e as CustomEvent<{ kind: RecordKind; date?: string }>).detail);
    window.addEventListener("artmood:record", on);
    return () => window.removeEventListener("artmood:record", on);
  }, []);

  const inEditor = pathname.startsWith("/app/day");

  return (
    <div className={styles.frame}>
      <Link href="/" className={styles.outsideLink}>
        ← artmood 소개
      </Link>
      <div className={styles.column} data-editor={inEditor ? "" : undefined}>
        {profile === null ? (
          <div className={styles.boot} aria-busy />
        ) : !profile.onboarded ? (
          <Onboarding />
        ) : (
          <>
            <main className={styles.main} data-tabs={inEditor ? undefined : ""}>
              {children}
            </main>
            {!inEditor && <TabBar onRecord={() => setRecord({ kind: "choose" })} />}
          </>
        )}
      </div>
      <RecordSheets state={record} onChange={setRecord} />
      <Toaster />
    </div>
  );
}
