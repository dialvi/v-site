import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, easeOutExpo, lerp } from '@/lib/motion';

export type CameraState = {
  x: number;
  y: number;
  scale: number;
};

type Fly = {
  from: CameraState;
  to: CameraState;
  start: number;
  duration: number;
  onDone?: () => void;
};

type Pointer = { id: number; x: number; y: number };

const MIN_SCALE = 0.55;
const MAX_SCALE = 3.4;

function distance(a: Pointer, b: Pointer) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Pointer, b: Pointer) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function useCamera(initial: CameraState) {
  const cam = useRef<CameraState>({ ...initial });
  const vel = useRef({ x: 0, y: 0 });
  const fly = useRef<Fly | null>(null);
  const pointers = useRef<Pointer[]>([]);
  const lastPinch = useRef<number | null>(null);
  const lastPan = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragging = useRef(false);
  const [, tick] = useState(0);
  const frame = useRef(0);

  const paint = useCallback(() => {
    tick((n) => (n + 1) % 1_000_000);
  }, []);

  useEffect(() => {
    let alive = true;
    const loop = (now: number) => {
      if (!alive) return;
      const f = fly.current;
      if (f) {
        const t = clamp((now - f.start) / f.duration, 0, 1);
        const e = easeOutExpo(t);
        cam.current = {
          x: lerp(f.from.x, f.to.x, e),
          y: lerp(f.from.y, f.to.y, e),
          scale: lerp(f.from.scale, f.to.scale, e),
        };
        vel.current = { x: 0, y: 0 };
        paint();
        if (t >= 1) {
          const done = f.onDone;
          fly.current = null;
          done?.();
        }
      } else if (!dragging.current) {
        const friction = 0.92;
        vel.current.x *= friction;
        vel.current.y *= friction;
        if (Math.abs(vel.current.x) > 0.02 || Math.abs(vel.current.y) > 0.02) {
          cam.current.x += vel.current.x;
          cam.current.y += vel.current.y;
          paint();
        }
      }
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frame.current);
    };
  }, [paint]);

  const flyTo = useCallback((to: CameraState, duration = 1100, onDone?: () => void) => {
    fly.current = {
      from: { ...cam.current },
      to,
      start: performance.now(),
      duration,
      onDone,
    };
  }, []);

  const setCamera = useCallback((next: Partial<CameraState>) => {
    cam.current = { ...cam.current, ...next };
    paint();
  }, [paint]);

  const zoomAt = useCallback((screenX: number, screenY: number, nextScale: number) => {
    const { innerWidth: w, innerHeight: h } = window;
    const c = cam.current;
    const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const wx = c.x + (screenX - w / 2) / c.scale;
    const wy = c.y + (screenY - h / 2) / c.scale;
    cam.current = {
      x: wx - (screenX - w / 2) / scale,
      y: wy - (screenY - h / 2) / scale,
      scale,
    };
    paint();
  }, [paint]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    fly.current = null;
    pointers.current.push({ id: e.pointerId, x: e.clientX, y: e.clientY });
    dragging.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    vel.current = { x: 0, y: 0 };
    if (pointers.current.length === 2) {
      lastPinch.current = distance(pointers.current[0], pointers.current[1]);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const list = pointers.current;
    const idx = list.findIndex((p) => p.id === e.pointerId);
    if (idx < 0) return;
    const prev = list[idx];
    list[idx] = { id: e.pointerId, x: e.clientX, y: e.clientY };

    if (list.length === 2 && lastPinch.current) {
      const nextDist = distance(list[0], list[1]);
      const mid = midpoint(list[0], list[1]);
      const ratio = nextDist / lastPinch.current;
      lastPinch.current = nextDist;
      zoomAt(mid.x, mid.y, cam.current.scale * ratio);
      return;
    }

    if (list.length === 1 && dragging.current) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      cam.current.x -= dx / cam.current.scale;
      cam.current.y -= dy / cam.current.scale;
      const now = performance.now();
      const last = lastPan.current;
      if (last) {
        const dt = Math.max(1, now - last.t);
        vel.current = {
          x: -(e.clientX - last.x) / cam.current.scale / (dt / 16),
          y: -(e.clientY - last.y) / cam.current.scale / (dt / 16),
        };
      }
      lastPan.current = { x: e.clientX, y: e.clientY, t: now };
      paint();
    }
  }, [paint, zoomAt]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current = pointers.current.filter((p) => p.id !== e.pointerId);
    if (pointers.current.length < 2) lastPinch.current = null;
    if (pointers.current.length === 0) {
      dragging.current = false;
      lastPan.current = null;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const next = cam.current.scale * (e.deltaY > 0 ? 0.92 : 1.08);
      zoomAt(e.clientX, e.clientY, next);
      return;
    }
    cam.current.x += e.deltaX / cam.current.scale;
    cam.current.y += e.deltaY / cam.current.scale;
    paint();
  }, [paint, zoomAt]);

  return {
    camera: cam.current,
    flyTo,
    setCamera,
    zoomAt,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    },
  };
}
