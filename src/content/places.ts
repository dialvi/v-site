import type { SectionId } from '@/features/universe/views';
import { storyBeats } from '@/content/story';

export type MapLink = {
  section: SectionId;
  label: string;
  focus?: string;
};

export type PlacePlan = 'hike' | 'san-juan' | 'madrid-norte' | 'rooftop';

export type Place = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kicker: string;
  body: string;
  storyId?: string;
  plan?: PlacePlan;
  seq?: number;
  links?: MapLink[];
};

export const SPAIN_BOUNDS: [[number, number], [number, number]] = [
  [36.0, -9.4],
  [43.8, 3.35],
];

export function encodeStoryFocus(beatId: string, depth: number) {
  return depth > 0 ? `${beatId}:${depth}` : beatId;
}

export function parseStoryFocus(focusId?: string) {
  if (!focusId) return { beatId: storyBeats[0]?.id ?? '', beatIndex: 0, depth: 0 };
  const [beatId, raw] = focusId.split(':');
  const beatIndex = storyBeats.findIndex((b) => b.id === beatId);
  const depth = raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0;
  return {
    beatId: beatIndex < 0 ? (storyBeats[0]?.id ?? '') : beatId,
    beatIndex: beatIndex < 0 ? 0 : beatIndex,
    depth,
  };
}

export function storyFocusForPlace(placeId: string) {
  for (const beat of storyBeats) {
    if (beat.placeId === placeId || beat.id === placeId) return encodeStoryFocus(beat.id, 0);
    const i = beat.details.findIndex((d) => d.placeId === placeId);
    if (i >= 0) return encodeStoryFocus(beat.id, i + 1);
  }
  return undefined;
}

function historiaLink(placeId: string): MapLink | undefined {
  const focus = storyFocusForPlace(placeId);
  if (!focus) return undefined;
  return { section: 'historia', label: 'Ver en Historia', focus };
}

function withHistoriaLink(place: Place): Place {
  const auto = historiaLink(place.id);
  const rest = place.links ?? [];
  const links = auto ? [auto, ...rest.filter((l) => l.section !== 'historia')] : rest;
  return links.length ? { ...place, links } : place;
}

const extras: Place[] = [
  {
    id: 'jarritos',
    lat: 40.51898,
    lng: -3.79408,
    label: 'Aquí tomamos el primer jarritos',
    kicker: 'Madrid',
    body: 'Un jarrito. El primero. manguito y guava. El tuyo más rico ​🙂‍↕️​',
    plan: 'madrid-norte',
    seq: 1,
    links: [{ section: 'historia', label: 'Ir a Historia', focus: 'cabras' }],
  },
  {
    id: 'jeep',
    lat: 40.752403,
    lng: -3.993109,
    label: 'Aparcamos el jeep',
    kicker: 'El Hike',
    body: 'Aquí aparcamos el jeep. Me hizo mucha gracia que salimos del asfalto y dijiste algo como: «eso es! levantando polvo».',
    plan: 'hike',
    seq: 2,
  },
  {
    id: 'madre-machete',
    lat: 40.737242,
    lng: -4.007053,
    label: 'La llamada a tu madre',
    kicker: 'El Hike',
    body: 'Aquí hiciste la llamada a tu madre para decirle que estabas con dos desconocidos que tienen un MACHETE en el coche y que no íbamos a tener cobertura en unas horas.',
    plan: 'hike',
    seq: 1,
  },
  {
    id: 'cachibache',
    lat: 40.774136,
    lng: -3.971902,
    label: 'El Cachibache',
    kicker: 'El Hike',
    body: 'El Cachibache. Aquí surgió la idea de La Conclusión.',
    plan: 'hike',
    seq: 6,
    links: [{ section: 'conclusion', label: 'Ir a La Conclusión' }],
  },
  {
    id: 'piedras-rio',
    lat: 40.769016,
    lng: -3.992104,
    label: '15 minutos de piedras',
    kicker: 'El Hike',
    body: 'Estuvimos aquí como 15 minutos lanzando piedras al río. Tu culpa, nosotros no pudimos controlarnos ​😶‍🌫️​',
    plan: 'hike',
    seq: 5,
  },
  {
    id: 'picnic-manguitos',
    lat: 40.771164,
    lng: -3.988455,
    label: 'Picnic de manguitos',
    kicker: 'El Hike',
    body: 'Picnic riquísimo con manguitos de Mercadona a orillas del río.',
    plan: 'hike',
    seq: 4,
  },
  {
    id: 'nieve',
    lat: 40.779869,
    lng: -3.9743,
    label: 'La nieve',
    kicker: 'El Hike',
    body: 'Tocamos la nieve y nos empapamos un poco.',
    plan: 'hike',
    seq: 7,
  },
  {
    id: 'casi-al-rio',
    lat: 40.763635,
    lng: -3.994827,
    label: 'Casi al río',
    kicker: 'El Hike',
    body: 'Casi te caes al río. Nunca he pasado tanto miedo.',
    plan: 'hike',
    seq: 3,
  },
  {
    id: 'macha',
    lat: 40.54129,
    lng: -3.612746,
    label: 'Tu Macha',
    kicker: 'Madrid',
    body: 'Aquí me dejaste probar tu Macha. Y sí, sabe a pasto.',
    plan: 'madrid-norte',
    seq: 3,
  },
  {
    id: 'asturiano',
    lat: 40.506246,
    lng: -3.657206,
    label: 'Oricios asturianos',
    kicker: 'Madrid',
    body: 'Cenita de oricios en el restaurante asturiano.',
    plan: 'madrid-norte',
    seq: 4,
  },
  {
    id: 'ataque-tos',
    lat: 40.509171,
    lng: -3.661061,
    label: 'El ataque de tos',
    kicker: 'Madrid',
    body: 'Me dio un ataque de tos horrible. Gracias por tu paciencia ese día ​😂​',
    plan: 'madrid-norte',
    seq: 5,
  },
  {
    id: 'granizados-torreznos',
    lat: 40.38178,
    lng: -4.345886,
    label: 'Granizados y torreznos',
    kicker: 'San Juan',
    body: 'Nos tomamos unos granizados, cenamos y me cortaste los torreznos ​🫶​',
    plan: 'san-juan',
    seq: 1,
  },
  {
    id: 'playita-vip',
    lat: 40.384905,
    lng: -4.349429,
    label: 'La playita VIP',
    kicker: 'San Juan',
    body: 'La playita VIP de Madrid, en el pantano de San Juan. Ese barquito quedó increíble.',
    plan: 'san-juan',
    seq: 2,
  },
  {
    id: 'jeep-piedras',
    lat: 40.3704,
    lng: -4.330433,
    label: 'Atardecer en el techo',
    kicker: 'San Juan',
    body: 'Subimos el jeep a unas rocas y vimos el atardecer en el techo del coche. (Aún no me has enviado esos videos ​🫠​)',
    plan: 'san-juan',
    seq: 3,
  },
  {
    id: 'atico-torre',
    lat: 40.48604781830427,
    lng: -3.670276183891721,
    label: 'El ático de mi torre',
    kicker: 'Madrid',
    body: 'Tu vídeo espectacular en el ático de mi torre.',
    plan: 'rooftop',
    seq: 1,
  },
  {
    id: 'mexicana-apuesta',
    lat: 40.475658338882226,
    lng: -3.6714369358758026,
    label: 'La apuesta mexicana',
    kicker: 'Madrid',
    body: 'Comida mexicana rica rica que no te convenció, pero ganaste la apuesta: el camarero no era mexicano.',
    plan: 'rooftop',
    seq: 2,
  },
];

const fromStory: Place[] = storyBeats
  .filter((beat) => beat.lat != null && beat.lng != null)
  .map((beat) => ({
    id: beat.id,
    lat: beat.lat as number,
    lng: beat.lng as number,
    label: beat.id === 'cabras' ? 'Nuestras cabras' : beat.title,
    kicker: beat.title,
    body: beat.lead,
    storyId: beat.id,
    plan: beat.id === 'cabras' ? 'madrid-norte' : undefined,
    seq: beat.id === 'cabras' ? 2 : undefined,
    links: [
      { section: 'historia', label: 'Ver en Historia', focus: beat.id },
      { section: 'investigacion', label: 'Ver expediente', focus: beat.id },
    ],
  }));

export const places: Place[] = [...fromStory, ...extras.map(withHistoriaLink)];

export function placeForSlide(beatId: string, depth: number) {
  const beat = storyBeats.find((b) => b.id === beatId);
  if (!beat) return undefined;
  if (depth <= 0) {
    if (beat.placeId) return places.find((p) => p.id === beat.placeId);
    if (beat.lat != null && beat.lng != null) return places.find((p) => p.id === beat.id);
    return undefined;
  }
  const detail = beat.details[depth - 1];
  if (!detail?.placeId) return undefined;
  return places.find((p) => p.id === detail.placeId);
}

export function placeForStory(storyId: string) {
  return placeForSlide(storyId, 0) ?? places.find((p) => p.storyId === storyId || p.id === storyId);
}

export const PLAN_ROUTE: Record<
  PlacePlan,
  { color: string; mark: string }
> = {
  hike: { color: '#f3ead8', mark: '#f3ead8' },
  'san-juan': { color: '#e8b86d', mark: '#e8b86d' },
  'madrid-norte': { color: '#c9a08a', mark: '#c9a08a' },
  rooftop: { color: '#d8c4ae', mark: '#d8c4ae' },
};

export function planRoutes() {
  const groups = new Map<PlacePlan, Place[]>();
  for (const place of places) {
    if (!place.plan) continue;
    const list = groups.get(place.plan) ?? [];
    list.push(place);
    groups.set(place.plan, list);
  }
  return [...groups.entries()]
    .map(([plan, pts]) => ({
      plan,
      positions: pts
        .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
        .map((p) => [p.lat, p.lng] as [number, number]),
    }))
    .filter((route) => route.positions.length > 1);
}
