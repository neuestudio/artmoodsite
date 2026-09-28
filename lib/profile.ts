"use client";

import { useSyncExternalStore } from "react";

// 기기에만 남는 가벼운 설정값. 기록 자체는 IndexedDB(lib/store)에 있다.
export type TestResult = { id: string; scores: Record<string, number>; at: number };

export type Profile = {
  nickname: string;
  onboarded: boolean;
  testResult: TestResult | null;
  notifyTime: string;
  fundingAlerts: string[];
};

const KEY = "artmood:profile";
const DEFAULT: Profile = { nickname: "", onboarded: false, testResult: null, notifyTime: "21:30", fundingAlerts: [] };

let cache: Profile | null = null;
const listeners = new Set<() => void>();

function read(): Profile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    cache = DEFAULT;
  }
  return cache!;
}

export function updateProfile(patch: Partial<Profile>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // 사생활 보호 모드 등에서 저장이 막혀도 이번 방문 동안은 동작하게 둔다
  }
  listeners.forEach((l) => l());
}

export function saveTestResult(r: { id: string; scores: Record<string, number> }) {
  updateProfile({ testResult: { ...r, at: Date.now() } });
}

export function resetProfile() {
  cache = DEFAULT;
  try {
    localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// 서버 렌더링과 첫 수화 단계에서는 null
export function useProfile() {
  return useSyncExternalStore(subscribe, read, () => null);
}
