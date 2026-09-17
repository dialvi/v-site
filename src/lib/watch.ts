import { storyBeats } from '@/content/story';

const VISIT_KEY = 'v-watch';

type Watch = {
  id: string;
  visits: number;
};

function labels(section: string) {
  if (section === 'historia') return 'Historia';
  if (section === 'lista') return 'Lista';
  if (section === 'archivo') return 'Archivo';
  if (section === 'mapa') return 'Mapa';
  if (section === 'secretos') return 'Confidencial';
  if (section === 'conclusion') return 'Conclusión';
  if (section === 'investigacion') return 'Investigación';
  return section;
}

function loadWatch(): Watch {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Watch;
      if (parsed.id && parsed.visits >= 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { id: Math.random().toString(36).slice(2, 8), visits: 0 };
}

function saveWatch(watch: Watch) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(watch));
  } catch {
    /* ignore */
  }
}

let sessionSent = false;
let cachedWhere: string | null | undefined;

async function locate() {
  if (cachedWhere !== undefined) return cachedWhere;
  cachedWhere = null;
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as {
        success?: boolean;
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        connection?: { isp?: string };
      };
      if (data.success !== false) {
        const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
        const isp = data.connection?.isp;
        cachedWhere = [place, data.ip, isp].filter(Boolean).join(' · ');
        return cachedWhere;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
    if (!res.ok) return cachedWhere;
    const data = (await res.json()) as {
      ip?: string;
      city?: string;
      region?: string;
      country?: string;
      organization?: string;
    };
    const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
    cachedWhere = [place, data.ip, data.organization].filter(Boolean).join(' · ');
  } catch {
    /* ignore */
  }
  return cachedWhere;
}

function pingWithWhere(text: string) {
  void locate().then((where) => {
    ping(where ? `${text}\n${where}` : text);
  });
}

export function ping(text: string) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN?.trim();
  const chat = import.meta.env.VITE_TELEGRAM_CHAT_ID?.trim();
  if (!token || !chat) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${encodeURIComponent(chat)}&text=${encodeURIComponent(text)}`;
  void fetch(url, { mode: 'no-cors', keepalive: true }).catch(() => undefined);
}

export function pingSession(kind: 'gate' | 'return') {
  if (sessionSent) return;
  sessionSent = true;
  const watch = loadWatch();
  watch.visits += 1;
  saveWatch(watch);
  if (kind === 'gate' && watch.visits <= 1) {
    pingWithWhere(`Puerta · primera vez · ${watch.id}`);
    return;
  }
  if (kind === 'gate') {
    pingWithWhere(`Puerta otra vez · visita ${watch.visits} · ${watch.id}`);
    return;
  }
  pingWithWhere(`Volvió · visita ${watch.visits} · ${watch.id}`);
}

export function pingSection(section: string) {
  ping(`Abrió ${labels(section)}`);
}

export function pingUniverse() {
  ping('Exploró el universo');
}

function historiaSlide(beatIndex: number, depth: number) {
  const beat = storyBeats[beatIndex];
  if (!beat) return '?';
  if (depth <= 0) return `${beat.index} ${beat.title} · portada`;
  const detail = beat.details[depth - 1];
  const step = detail?.kicker ?? String(depth);
  const title = detail?.title ?? '';
  return `${beat.index}.${step} ${title}`.trim();
}

function historiaTime(seconds: number) {
  if (seconds < 2) return 'pasó rápido';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function pingHistoriaOpen(beatIndex: number, depth: number) {
  ping(`Historia · lee ${historiaSlide(beatIndex, depth)}`);
}

export function pingHistoriaMove(
  fromBeat: number,
  fromDepth: number,
  toBeat: number,
  toDepth: number,
  seconds: number,
) {
  const how = fromBeat !== toBeat ? (toBeat > fromBeat ? '→' : '←') : toDepth > fromDepth ? '↓' : '↑';
  ping(
    `Historia · ${how} ${historiaSlide(toBeat, toDepth)} · ${historiaTime(seconds)} en ${historiaSlide(fromBeat, fromDepth)}`,
  );
}

export function pingHistoriaLeave(beatIndex: number, depth: number, seconds: number) {
  ping(`Historia · salió · ${historiaTime(seconds)} en ${historiaSlide(beatIndex, depth)}`);
}

export function pingHistoriaMap(beatIndex: number, depth: number) {
  ping(`Historia · mapa desde ${historiaSlide(beatIndex, depth)}`);
}

