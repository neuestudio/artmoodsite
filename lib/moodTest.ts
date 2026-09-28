import { PALETTE } from "./palette";

// "요즘 내 마음의 색" 테스트. 성격 유형이 아니라 최근 마음 상태를 색으로 비춰보는 가벼운 체크이며, 진단이 아니다.
type Weights = Partial<Record<string, number>>;

export type Question = {
  q: string;
  options: { label: string; w: Weights }[];
};

export const QUESTIONS: Question[] = [
  {
    q: "월요일 아침, 알람이 울리면 드는 생각은?",
    options: [
      { label: "왠지 오늘은 좋은 일이 있을 것 같아", w: { joy: 2, flutter: 1 } },
      { label: "5분만 더… 몸이 천근만근이야", w: { tired: 2 } },
      { label: "오늘 할 일 목록부터 떠올라", w: { anxiety: 2 } },
      { label: "커피 한 잔이면 괜찮아", w: { calm: 2 } },
    ],
  },
  {
    q: "점심시간, 지금 가장 끌리는 건?",
    options: [
      { label: "동료들과 수다 떨며 먹기", w: { warmth: 2, joy: 1 } },
      { label: "혼자 조용히 회사 근처 산책", w: { calm: 2 } },
      { label: "새로 생긴 가게 도전하기", w: { flutter: 2 } },
      { label: "일이 밀려서 책상에서 대충", w: { anxiety: 1, tired: 1 } },
    ],
  },
  {
    q: "회의에서 내 의견이 가볍게 넘겨졌을 때",
    options: [
      { label: "겉으론 웃지만 속은 부글부글", w: { anger: 2 } },
      { label: "괜히 말했나, 하루 종일 곱씹어", w: { anxiety: 1, sadness: 1 } },
      { label: "다음엔 더 준비해서 말해보자", w: { flutter: 1, calm: 1 } },
      { label: "그럴 수도 있지, 가볍게 넘겨", w: { calm: 2 } },
    ],
  },
  {
    q: "요즘 퇴근길의 나는?",
    options: [
      { label: "이어폰을 끼고 멍하니 창밖만", w: { tired: 2 } },
      { label: "주말 계획을 세우며 두근두근", w: { flutter: 2 } },
      { label: "친구에게 오늘 있었던 일을 털어놔", w: { warmth: 2 } },
      { label: "오늘 했던 말을 머릿속으로 되감기", w: { anxiety: 1, sadness: 1 } },
    ],
  },
  {
    q: "최근 일주일, 가장 자주 한 말은?",
    options: [
      { label: "“아 진짜, 짜증 나”", w: { anger: 2 } },
      { label: "“피곤하다…”", w: { tired: 2 } },
      { label: "“고마워”", w: { warmth: 2 } },
      { label: "“좋다~”", w: { joy: 2 } },
    ],
  },
  {
    q: "혼자 있는 주말 밤, 문득 드는 생각은?",
    options: [
      { label: "이 조용한 시간이 참 좋다", w: { calm: 2 } },
      { label: "왠지 모르게 마음 한쪽이 허전해", w: { sadness: 2 } },
      { label: "벌써 다음 주가 걱정돼", w: { anxiety: 2 } },
      { label: "내일은 뭐 하고 놀지?", w: { joy: 1, flutter: 1 } },
    ],
  },
  {
    q: "지금 내 책상 위 풍경은?",
    options: [
      { label: "깔끔하게 정리되어 있어", w: { calm: 1, joy: 1 } },
      { label: "할 일 메모와 서류가 쌓여 있어", w: { anxiety: 1, tired: 1 } },
      { label: "좋아하는 사진과 소품이 가득", w: { warmth: 2 } },
      { label: "솔직히 손대고 싶지 않은 상태", w: { tired: 1, sadness: 1 } },
    ],
  },
  {
    q: "요즘 나에게 가장 필요한 건?",
    options: [
      { label: "아무것도 하지 않아도 되는 하루", w: { tired: 2 } },
      { label: "마음껏 웃을 수 있는 일", w: { joy: 1, sadness: 1 } },
      { label: "누군가의 따뜻한 한마디", w: { warmth: 1, sadness: 1 } },
      { label: "속 시원하게 털어놓을 곳", w: { anger: 2 } },
    ],
  },
];

export type ResultCopy = { title: string; body: string; ritual: string };

export const RESULTS: Record<string, ResultCopy> = {
  joy: {
    title: "요즘 당신의 마음엔 볕이 들어요",
    body: "작은 일에도 웃음이 나고, 하루의 좋은 장면이 잘 보이는 시기예요. 이런 날들은 금방 지나가니, 흘려보내지 말고 붙잡아 두세요.",
    ritual: "오늘 가장 좋았던 장면 하나를 노란색으로 칠해 남겨두기",
  },
  flutter: {
    title: "무언가를 향해 마음이 두근거려요",
    body: "새로운 계획, 기다리는 약속, 시작하고 싶은 일. 설렘은 앞으로 나아가게 하는 힘이에요. 다만 너무 서두르지 않도록 숨도 함께 골라주세요.",
    ritual: "기다리는 일 하나를 적고, 그 옆을 코랄색으로 채워보기",
  },
  warmth: {
    title: "사람 사이의 온기가 마음을 채우고 있어요",
    body: "고마운 사람, 곁에 있는 사람이 자꾸 떠오르는 요즘이에요. 받은 온기를 기록해 두면, 힘든 날 다시 꺼내 볼 수 있어요.",
    ritual: "오늘 고마웠던 사람의 이름을 로즈색 옆에 적어두기",
  },
  calm: {
    title: "숨이 고르게 쉬어지는 시기예요",
    body: "크게 흔들리지 않고 내 속도를 지키고 있어요. 평온은 저절로 오지 않아요. 지금의 나를 지켜주는 습관이 무엇인지 알아두면 좋아요.",
    ritual: "나를 편안하게 하는 것 세 가지를 초록으로 칠하며 떠올리기",
  },
  sadness: {
    title: "마음이 조금 가라앉아 있어요",
    body: "이유가 분명하지 않아도 괜찮아요. 가라앉은 마음은 고쳐야 할 문제가 아니라, 잠시 쉬어가라는 신호일 때가 많아요.",
    ritual: "아무 말 없이 파란색으로 도안 한 칸을 천천히 채워보기",
  },
  anxiety: {
    title: "머릿속이 쉬지 않고 바빠요",
    body: "해야 할 일과 걱정이 동시에 떠오르는 시기예요. 머릿속에만 두면 커지고, 바깥으로 꺼내면 작아지는 게 불안이에요.",
    ritual: "걱정 하나를 적고, 라벤더색으로 그 칸을 덮어보기",
  },
  anger: {
    title: "참아온 말들이 뜨거워지고 있어요",
    body: "화는 소중한 것이 침범당했다는 신호예요. 참기만 하면 몸에 쌓이니, 안전한 곳에서 색으로 먼저 털어내 보세요.",
    ritual: "굵은 붓으로 테라코타색을 마음껏 휘둘러 칠해보기",
  },
  tired: {
    title: "오래 달려온 몸과 마음이 쉬고 싶어 해요",
    body: "잘 해내느라 스스로를 돌볼 틈이 없었을지도 몰라요. 오늘만큼은 기록도 짧게, 한 방울이면 충분해요.",
    ritual: "잠들기 전 30초, 오늘의 색 한 방울만 남기기",
  },
};

export function scoreAnswers(answers: number[]) {
  const scores: Record<string, number> = Object.fromEntries(PALETTE.map((c) => [c.id, 0]));
  answers.forEach((a, i) => {
    const w = QUESTIONS[i]?.options[a]?.w ?? {};
    for (const [id, v] of Object.entries(w)) scores[id] += v ?? 0;
  });
  // 동점이면 팔레트 순서대로
  const top = PALETTE.map((c) => c.id).reduce((best, id) => (scores[id] > scores[best] ? id : best));
  return { id: top, scores };
}

export function scoreRatios(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  return PALETTE.map((c) => ({ id: c.id, ratio: Math.round((scores[c.id] / total) * 100) }))
    .filter((r) => r.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);
}
