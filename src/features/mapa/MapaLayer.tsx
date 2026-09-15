import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { places, SPAIN_BOUNDS, type MapLink, type Place } from '@/content/places';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';

type Props = {
  onBack: () => void;
  backLabel?: string;
  onJump: (link: MapLink, placeId: string) => void;
  focusId?: string;
};

const pin = L.divIcon({
  className: 'v-pin',
  html: '<i></i>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const pinOn = L.divIcon({
  className: 'v-pin v-pin-on',
  html: '<i></i>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function MapaLayer({ onBack, backLabel = 'universo', onJump, focusId }: Props) {
  const [open, setOpen] = useState<string | null>(focusId ?? null);
  const [clusterTick, setClusterTick] = useState(0);
  const place = places.find((p) => p.id === open) ?? null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink">
      <header className="safe-pad relative z-30 flex items-center justify-between pb-2">
        <BackChip onClick={place ? () => setOpen(null) : onBack} label={place ? 'mapa' : backLabel} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Mapa</p>
      </header>

      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={[40.4, -3.7]}
          zoom={6}
          maxZoom={19}
          minZoom={5}
          zoomControl={false}
          attributionControl
          className="sat-map absolute inset-0"
        >
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            attribution=""
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            opacity={0.9}
          />
          <FitSpain skip={Boolean(focusId)} />
          {places.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={open === item.id ? pinOn : pin}
              eventHandlers={{
                click: () => {
                  haptic('medium');
                  setOpen(item.id);
                },
              }}
            />
          ))}
          <CameraToPins placeId={open} clusterTick={clusterTick} />
        </MapContainer>

        {!place && (
          <button
            type="button"
            className="absolute bottom-[calc(var(--safe-bottom)+1.2rem)] left-1/2 z-20 -translate-x-1/2 rounded-full border border-paper/20 bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-paper/80"
            onClick={() => {
              haptic('light');
              setClusterTick((n) => n + 1);
            }}
          >
            acercar a los puntos
          </button>
        )}
      </div>

      {place && <PlaceSheet place={place} onJump={onJump} onClose={() => setOpen(null)} />}
    </div>
  );
}

function FitSpain({ skip }: { skip: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (skip) return;
    map.fitBounds(SPAIN_BOUNDS, { padding: [28, 28], animate: false });
    window.setTimeout(() => map.invalidateSize(), 80);
  }, [map, skip]);
  return null;
}

function CameraToPins({ placeId, clusterTick }: { placeId: string | null; clusterTick: number }) {
  const map = useMap();

  useEffect(() => {
    if (!placeId) return;
    const p = places.find((x) => x.id === placeId);
    if (!p) return;
    map.flyTo([p.lat, p.lng], 17, { duration: 0.85 });
    const t = window.setTimeout(() => map.invalidateSize(), 400);
    return () => window.clearTimeout(t);
  }, [map, placeId]);

  useEffect(() => {
    if (clusterTick < 1) return;
    const lats = places.map((p) => p.lat);
    const lngs = places.map((p) => p.lng);
    map.flyToBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [70, 70], maxZoom: 17, duration: 0.9 },
    );
    const t = window.setTimeout(() => map.invalidateSize(), 400);
    return () => window.clearTimeout(t);
  }, [map, clusterTick]);

  return null;
}

function PlaceSheet({
  place,
  onJump,
  onClose,
}: {
  place: Place;
  onJump: (link: MapLink, placeId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[42%] rounded-t-[1.6rem] border-t border-paper/10 bg-[#14110f] px-5 pb-[calc(var(--safe-bottom)+1.2rem)] pt-4">
      <button type="button" onClick={onClose} className="mx-auto mb-3 block h-1 w-10 rounded-full bg-paper/25" />
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#e23a32]/90">{place.kicker}</p>
      <h3 className="mt-2 font-display text-[1.7rem] italic leading-tight text-paper">{place.label}</h3>
      <p className="selectable mt-3 max-h-[14vh] overflow-y-auto text-[15px] leading-relaxed text-paper/70">
        {place.body}
      </p>
      {place.links && place.links.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {place.links.map((link) => (
            <button
              key={`${link.section}-${link.focus ?? ''}`}
              type="button"
              onClick={() => {
                haptic('medium');
                onJump(link, place.id);
              }}
              className="rounded-full border border-paper/20 py-3 text-[11px] uppercase tracking-[0.2em] text-paper/80"
            >
              {link.label} →
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
