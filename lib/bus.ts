// 화면 사이 가벼운 신호: 기록 시트 열기, 기록 변경 알림
export type RecordKind = "choose" | "quick";

export function openRecord(kind: RecordKind, date?: string) {
  window.dispatchEvent(new CustomEvent("artmood:record", { detail: { kind, date } }));
}

export function notifyChanged() {
  window.dispatchEvent(new Event("artmood:changed"));
}

export function onChanged(fn: () => void) {
  window.addEventListener("artmood:changed", fn);
  return () => window.removeEventListener("artmood:changed", fn);
}
