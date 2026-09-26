"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ART_H, ART_W, drawingMaskSrc, drawingSrc } from "@/lib/drawings";
import { dilate, floodRegion, lineMaskFromImage } from "@/lib/fill";
import { NONE, computeRatios, decodeLabels, encodeLabels, labelsFromPixels, type MoodRatio } from "@/lib/labels";
import { PALETTE, hexToRgb } from "@/lib/palette";
import styles from "./ColoringCanvas.module.css";

export type Tool = "brush" | "fill" | "eraser";

export type ColoringHandle = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export type PaintChange = {
  ratios: MoodRatio[];
  labels: Uint32Array;
  // 캔버스가 사라진 뒤에도 저장할 수 있도록 변경 시점에 바로 이미지로 뽑아둔다
  paint: Promise<Blob | null>;
};

type Props = {
  drawingId: number;
  colorId: string;
  tool: Tool;
  size: number;
  initialPaint: Blob | null;
  initialLabels: Uint32Array | null;
  onChange: (change: PaintChange) => void;
  onHistory?: (canUndo: boolean, canRedo: boolean) => void;
  onNotice?: (msg: string) => void;
  ref?: Ref<ColoringHandle>;
};

type Snapshot = { image: HTMLCanvasElement; labels: Uint8Array };

// 물감을 한 겹씩 얹는 느낌: 획 하나는 균일하게, 겹칠수록 색이 섞이며 깊어진다
const GLAZE = 0.78;
const WALL_RADIUS = 5;
const MAX_HISTORY = 15;

export default function ColoringCanvas({
  drawingId,
  colorId,
  tool,
  size,
  initialPaint,
  initialLabels,
  onChange,
  onHistory,
  onNotice,
  ref,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const strokeRef = useRef<HTMLCanvasElement>(null);
  const wallRef = useRef<Uint8Array | null>(null);
  const areaRef = useRef<Uint8Array | null>(null);
  const labelsRef = useRef<Uint8Array>(new Uint8Array(ART_W * ART_H).fill(NONE));
  const undoRef = useRef<Snapshot[]>([]);
  const redoRef = useRef<Snapshot[]>([]);
  const drawing = useRef<{ id: number; x: number; y: number; px: number; py: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  const colorIndex = Math.max(0, PALETTE.findIndex((c) => c.id === colorId));
  const color = PALETTE[colorIndex].hex;

  const paintCtx = () => paintRef.current!.getContext("2d", { willReadFrequently: true })!;
  const strokeCtx = () => strokeRef.current!.getContext("2d", { willReadFrequently: true })!;

  // 저장된 그림과 색 기록 불러오기
  useEffect(() => {
    let cancelled = false;
    const ctx = paintCtx();
    ctx.clearRect(0, 0, ART_W, ART_H);
    labelsRef.current.fill(NONE);
    if (initialPaint) {
      createImageBitmap(initialPaint).then((bmp) => {
        if (cancelled) return;
        ctx.drawImage(bmp, 0, 0, ART_W, ART_H);
        const decoded = initialLabels && decodeLabels(initialLabels, ART_W * ART_H);
        labelsRef.current = decoded ?? labelsFromPixels(ctx.getImageData(0, 0, ART_W, ART_H).data);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [initialPaint, initialLabels]);

  // 채우기용 벽(선) 마스크
  useEffect(() => {
    wallRef.current = null;
    const img = new Image();
    img.src = drawingSrc(drawingId);
    img.onload = () => {
      const lines = lineMaskFromImage(img, ART_W, ART_H);
      wallRef.current = dilate(lines, ART_W, ART_H, WALL_RADIUS);
    };
  }, [drawingId]);

  // 감정 비율에 넣을 도안 안쪽 영역
  useEffect(() => {
    areaRef.current = null;
    const img = new Image();
    img.src = drawingMaskSrc(drawingId);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = ART_W;
      c.height = ART_H;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, ART_W, ART_H);
      const px = ctx.getImageData(0, 0, ART_W, ART_H).data;
      const area = new Uint8Array(ART_W * ART_H);
      for (let i = 0; i < area.length; i++) area[i] = px[i * 4] > 127 ? 1 : 0;
      areaRef.current = area;
    };
  }, [drawingId]);

  // 화면 크기 대비 캔버스 배율 (브러시 커서 표시용). 캔버스 해상도는 고정이라 크기가 바뀌어도 그림은 그대로다.
  useEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / ART_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const snapshot = (): Snapshot => {
    const image = document.createElement("canvas");
    image.width = ART_W;
    image.height = ART_H;
    image.getContext("2d")!.drawImage(paintRef.current!, 0, 0);
    return { image, labels: labelsRef.current.slice() };
  };

  const restore = (s: Snapshot) => {
    const ctx = paintCtx();
    ctx.clearRect(0, 0, ART_W, ART_H);
    ctx.drawImage(s.image, 0, 0);
    labelsRef.current = s.labels;
  };

  const reportHistory = () => onHistory?.(undoRef.current.length > 0, redoRef.current.length > 0);

  // 새 작업을 시작하기 직전의 상태를 기록 (다시 실행 기록은 버린다)
  const beginAction = () => {
    undoRef.current.push(snapshot());
    if (undoRef.current.length > MAX_HISTORY) undoRef.current.shift();
    redoRef.current = [];
    reportHistory();
  };

  const emitChange = () => {
    const canvas = paintRef.current!;
    const labels = labelsRef.current;
    const ratios = computeRatios(labels, areaRef.current);
    // 바탕에만 칠해서 비율이 비어 있어도 그림 자체는 저장한다
    const hasPaint = labels.some((v) => v !== NONE);
    onChange({
      ratios,
      labels: encodeLabels(labels),
      paint: hasPaint ? new Promise((res) => canvas.toBlob(res, "image/png")) : Promise.resolve(null),
    });
  };

  const glaze = (source: CanvasImageSource) => {
    const ctx = paintCtx();
    ctx.save();
    ctx.globalAlpha = GLAZE;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  };

  // 획이 지나간 자리의 색 기록을 갱신 (지우개면 비움)
  const stampLabels = (value: number) => {
    const alpha = strokeCtx().getImageData(0, 0, ART_W, ART_H).data;
    const labels = labelsRef.current;
    for (let i = 0; i < labels.length; i++) if (alpha[i * 4 + 3] > 0) labels[i] = value;
  };

  const toArt = (e: { clientX: number; clientY: number }) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ART_W,
      y: ((e.clientY - r.top) / r.height) * ART_H,
    };
  };

  // 지우개는 그림에서 바로 지우고, 지운 자리는 획 캔버스에도 남겨 색 기록을 비우는 데 쓴다
  const targets = () => {
    const s = strokeCtx();
    if (tool !== "eraser") {
      s.strokeStyle = color;
      return [s];
    }
    const p = paintCtx();
    p.save();
    p.globalCompositeOperation = "destination-out";
    p.strokeStyle = "#000";
    s.strokeStyle = "#000";
    return [p, s];
  };

  const releaseTargets = () => {
    if (tool === "eraser") paintCtx().restore();
  };

  const doFill = (x: number, y: number) => {
    const wall = wallRef.current;
    if (!wall) return;
    const res = floodRegion(wall, ART_W, ART_H, Math.round(x), Math.round(y));
    if (!res) return;
    // 선 아래까지 색이 스며들도록 영역을 벽 두께만큼 넓힌다
    const grown = dilate(res.region, ART_W, ART_H, WALL_RADIUS + 2);
    const [r, g, b] = hexToRgb(color);
    const layer = document.createElement("canvas");
    layer.width = ART_W;
    layer.height = ART_H;
    const lctx = layer.getContext("2d")!;
    const img = lctx.createImageData(ART_W, ART_H);
    beginAction();
    const labels = labelsRef.current;
    for (let i = 0; i < grown.length; i++) {
      if (!grown[i]) continue;
      const p = i * 4;
      img.data[p] = r;
      img.data[p + 1] = g;
      img.data[p + 2] = b;
      img.data[p + 3] = 255;
      labels[i] = colorIndex;
    }
    lctx.putImageData(img, 0, 0);
    glaze(layer);
    emitChange();
    if (res.area > ART_W * ART_H * 0.4) {
      onNotice?.("선이 열린 곳으로 색이 넓게 번졌어요. 마음에 들지 않으면 되돌리기를 눌러주세요.");
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // 두 번째 손가락이나 오른쪽 버튼은 무시 (진행 중인 획이 끊기지 않도록)
    if (!e.isPrimary || e.button !== 0 || drawing.current) return;
    e.preventDefault();
    const p = toArt(e);
    if (tool === "fill") {
      doFill(p.x, p.y);
      return;
    }
    wrapRef.current!.setPointerCapture(e.pointerId);
    beginAction();
    strokeCtx().clearRect(0, 0, ART_W, ART_H);
    drawing.current = { id: e.pointerId, x: p.x, y: p.y, px: p.x, py: p.y };
    for (const ctx of targets()) {
      ctx.lineCap = "round";
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.01, p.y);
      ctx.stroke();
    }
    releaseTargets();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      const r = wrapRef.current!.getBoundingClientRect();
      setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
    }
    const d = drawing.current;
    if (!d || e.pointerId !== d.id) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const ctxs = targets();
    for (const ev of events) {
      const p = toArt(ev);
      // 중간점을 이어 부드러운 곡선으로
      const mx = (d.x + p.x) / 2;
      const my = (d.y + p.y) / 2;
      for (const ctx of ctxs) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(d.px, d.py);
        ctx.quadraticCurveTo(d.x, d.y, mx, my);
        ctx.stroke();
      }
      d.px = mx;
      d.py = my;
      d.x = p.x;
      d.y = p.y;
    }
    releaseTargets();
  };

  const endStroke = (e: React.PointerEvent) => {
    const d = drawing.current;
    if (!d || e.pointerId !== d.id) return;
    drawing.current = null;
    if (tool === "eraser") {
      stampLabels(NONE);
    } else {
      stampLabels(colorIndex);
      glaze(strokeRef.current!);
    }
    strokeCtx().clearRect(0, 0, ART_W, ART_H);
    emitChange();
  };

  useImperativeHandle(ref, () => ({
    undo() {
      const prev = undoRef.current.pop();
      if (!prev) return;
      redoRef.current.push(snapshot());
      restore(prev);
      reportHistory();
      emitChange();
    },
    redo() {
      const next = redoRef.current.pop();
      if (!next) return;
      undoRef.current.push(snapshot());
      restore(next);
      reportHistory();
      emitChange();
    },
    clear() {
      beginAction();
      paintCtx().clearRect(0, 0, ART_W, ART_H);
      labelsRef.current.fill(NONE);
      emitChange();
    },
  }));

  const cursorPx = Math.max(size * scale, 6);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      data-tool={tool}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onPointerLeave={() => setCursor(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={paintRef} width={ART_W} height={ART_H} className={styles.layer} />
      <canvas
        ref={strokeRef}
        width={ART_W}
        height={ART_H}
        className={`${styles.layer} ${styles.stroke}`}
        style={{ opacity: tool === "eraser" ? 0 : GLAZE }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={drawingSrc(drawingId)} alt="오늘의 컬러링 도안" className={styles.lines} draggable={false} />
      {cursor && tool !== "fill" && (
        <span
          className={styles.cursor}
          style={{
            left: cursor.x,
            top: cursor.y,
            width: cursorPx,
            height: cursorPx,
            borderColor: tool === "eraser" ? "#8a8178" : color,
          }}
        />
      )}
    </div>
  );
}
