const BASE = 0.42;
const DUCK = 0.2;

let theme: HTMLAudioElement | null = null;
let keepAlive = false;
let ducking = false;

function applyVolume() {
  if (!theme) return;
  theme.volume = ducking ? DUCK : BASE;
}

function getTheme() {
  if (typeof Audio === 'undefined') return null;
  if (!theme) {
    theme = new Audio(`${import.meta.env.BASE_URL}media/audio/universe.mp3`);
    theme.loop = true;
    theme.preload = 'auto';
    applyVolume();
    theme.addEventListener('pause', () => {
      if (!keepAlive) return;
      window.setTimeout(() => {
        if (keepAlive && theme?.paused) void theme.play().catch(() => undefined);
      }, 60);
    });
  }
  return theme;
}

export function startUniverseTheme() {
  keepAlive = true;
  const audio = getTheme();
  if (!audio) return;
  applyVolume();
  void audio.play().catch(() => undefined);
}

export function ensureUniverseTheme() {
  if (!keepAlive) return;
  const audio = getTheme();
  if (!audio) return;
  applyVolume();
  if (audio.paused) void audio.play().catch(() => undefined);
}

export function duckUniverseTheme(on: boolean) {
  ducking = on;
  applyVolume();
  ensureUniverseTheme();
}
