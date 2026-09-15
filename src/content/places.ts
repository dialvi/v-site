import type { SectionId } from '@/features/universe/views';
import { storyBeats } from '@/content/story';

export type MapLink = {
  section: SectionId;
  label: string;
  focus?: string;
};

export type Place = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kicker: string;
  body: string;
  storyId?: string;
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
    body: 'Un jarrito. El primero. El mapa se acuerda aunque el vaso ya no esté.',
    links: [{ section: 'historia', label: 'Ir a Historia', focus: 'cabras' }],
  },
  {
    id: 'jeep',
    lat: 40.752403,
    lng: -3.993109,
    label: 'Aparcamos el jeep',
    kicker: 'El Hike',
    body: 'Aquí aparcamos el jeep. Me hizo mucha gracia que salimos del asfalto y dijiste algo como: «eso es! levantando polvo».',
  },
  {
    id: 'madre-machete',
    lat: 40.737242,
    lng: -4.007053,
    label: 'La llamada a tu madre',
    kicker: 'El Hike',
    body: 'Aquí llamaste a tu madre para decirle que estabas con dos desconocidos que tienen un MACHETE en el coche y que no íbamos a tener cobertura en unas horas.',
  },
  {
    id: 'cachibache',
    lat: 40.774136,
    lng: -3.971902,
    label: 'El Cachibache',
    kicker: 'El Hike',
    body: 'El Cachibache. Aquí surgió la idea de La Conclusión.',
    links: [{ section: 'conclusion', label: 'Ir a La Conclusión' }],
  },
  {
    id: 'piedras-rio',
    lat: 40.769016,
    lng: -3.992104,
    label: '15 minutos de piedras',
    kicker: 'El Hike',
    body: 'Estuvimos lanzando piedras 15 minutos al río. Tú tiraste la primera.',
  },
  {
    id: 'picnic-manguitos',
    lat: 40.771164,
    lng: -3.988455,
    label: 'Picnic de manguitos',
    kicker: 'El Hike',
    body: 'Picnic riquísimo con manguitos de Mercadona.',
  },
  {
    id: 'nieve',
    lat: 40.779869,
    lng: -3.9743,
    label: 'La nieve',
    kicker: 'El Hike',
    body: 'Tocamos la nieve y nos empapamos un poco.',
  },
  {
    id: 'casi-al-rio',
    lat: 40.763635,
    lng: -3.994827,
    label: 'Casi al río',
    kicker: 'El Hike',
    body: 'Casi te caes al río. Nunca he pasado tanto miedo.',
  },
  {
    id: 'macha',
    lat: 40.54129,
    lng: -3.612746,
    label: 'Tu Macha',
    kicker: 'Madrid',
    body: 'Aquí me dejaste probar tu Macha. Y sí, sabe a pasto.',
  },
  {
    id: 'asturiano',
    lat: 40.506246,
    lng: -3.657206,
    label: 'Horicios asturianos',
    kicker: 'Madrid',
    body: 'Aquí cenamos unos horicios en el restaurante asturiano.',
  },
  {
    id: 'ataque-tos',
    lat: 40.509171,
    lng: -3.661061,
    label: 'El ataque de tos',
    kicker: 'Madrid',
    body: 'Aquí me dio un ataque de tos horrible.',
  },
  {
    id: 'granizados-torreznos',
    lat: 40.38178,
    lng: -4.345886,
    label: 'Granizados y torreznos',
    kicker: 'San Juan',
    body: 'Nos tomamos unos granizados, cenamos y me cortaste los torreznos.',
  },
  {
    id: 'playita-vip',
    lat: 40.384905,
    lng: -4.349429,
    label: 'La playita VIP',
    kicker: 'San Juan',
    body: 'La playita VIP de Madrid, en el pantano de San Juan. Ese barquito quedó increíble.',
  },
  {
    id: 'jeep-piedras',
    lat: 40.3704,
    lng: -4.330433,
    label: 'Atardecer en el techo',
    kicker: 'San Juan',
    body: 'Subimos el jeep a unas piedras y vimos el atardecer en el techo del coche.',
  },
  {
    id: 'atico-torre',
    lat: 40.48604781830427,
    lng: -3.670276183891721,
    label: 'El ático de mi torre',
    kicker: 'Madrid',
    body: 'Tu vídeo espectacular en el ático de mi torre.',
  },
  {
    id: 'mexicana-apuesta',
    lat: 40.475658338882226,
    lng: -3.6714369358758026,
    label: 'La apuesta mexicana',
    kicker: 'Madrid',
    body: 'Comida mexicana rica rica que no te convenció, pero ganaste la apuesta: el camarero no era mexicano.',
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
