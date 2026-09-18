const BASE = 0.42;
const DUCK = 0.2;
const FILE = `${import.meta.env.BASE_URL}media/audio/universe.mp3`;

let theme: HTMLAudioElement | null = null;
let keepAlive = false;
let ducking = false;
let warmed = false;
let readySrc = FILE;

function applyVolume() {
  if (!theme) return;
  theme.volume = ducking ? DUCK : BASE;
}

function getTheme() {
  if (typeof Audio === 'undefined') return null;
  if (!theme) {
    theme = new Audio(readySrc);
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

export function preloadUniverseTheme() {
  const audio = getTheme();
  if (audio && audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    audio.load();
  }
  if (warmed) return;
  warmed = true;
  void fetch(FILE, { cache: 'force-cache' })
    .then((res) => {
      if (!res.ok) throw new Error('theme');
      return res.blob();
    })
    .then((blob) => {
      readySrc = URL.createObjectURL(blob);
      if (!theme || keepAlive || !theme.paused) return;
      theme.src = readySrc;
      theme.loop = true;
      theme.load();
    })
    .catch(() => undefined);
}

export function startUniverseTheme() {
  keepAlive = true;
  const audio = getTheme();
  if (!audio) return;
  if (readySrc !== FILE && audio.src !== readySrc) {
    audio.src = readySrc;
    audio.loop = true;
  }
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
