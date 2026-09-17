import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PLAN_ROUTE, places, planRoutes, SPAIN_BOUNDS, type MapLink, type Place } from '@/content/places';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';

type Props = {
  onBack: () => void;
  backLabel?: string;
  onJump: (link: MapLink, placeId: string) => void;
  focusId?: string;
};

const pinCache = new Map<string, L.DivIcon>();

function pinIcon(plan: Place['plan'], on: boolean) {
  const key = `${plan ?? 'none'}-${on ? 'on' : 'off'}`;
  const cached = pinCache.get(key);
  if (cached) return cached;
  const mark = plan ? `<b style="background:${PLAN_ROUTE[plan].mark}"></b>` : '';
  const icon = L.divIcon({
    className: `v-pin${on ? ' v-pin-on' : ''}`,
    html: `<i>${mark}</i>`,
    iconSize: on ? [28, 28] : [22, 22],
    iconAnchor: on ? [14, 14] : [11, 11],
  });
  pinCache.set(key, icon);
  return icon;
}

const routes = planRoutes();

export function MapaLayer({ onBack, backLabel = 'universo', onJump, focusId }: Props) {
  const [open, setOpen] = useState<string | null>(focusId ?? null);
  const [clusterTick, setClusterTick] = useState(0);
  const place = places.find((p) => p.id === open) ?? null;
  const activePlan = place?.plan;

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
          {routes.map((route) => {
            const on = activePlan === route.plan;
            const dim = Boolean(activePlan) && !on;
            return (
              <Polyline
                key={route.plan}
                positions={route.positions}
                interactive={false}
                pathOptions={{
                  color: PLAN_ROUTE[route.plan].color,
                  weight: on ? 3.2 : 2,
                  opacity: dim ? 0.18 : on ? 0.9 : 0.55,
                  dashArray: '5 8',
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })}
          {places.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={pinIcon(item.plan, open === item.id)}
              opacity={activePlan && item.plan && item.plan !== activePlan ? 0.45 : 1}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e.originalEvent);
                  haptic('medium');
                  setOpen(item.id);
                },
              }}
            />
          ))}
          <MapTapClose open={Boolean(place)} onClose={() => setOpen(null)} />
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

function MapTapClose({ open, onClose }: { open: boolean; onClose: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!open) return;
    const onClick = () => {
      haptic('light');
      onClose();
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, open, onClose]);
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
  const sheet = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [snapping, setSnapping] = useState(false);

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;

    const g = { y: 0, dy: 0, dragging: false };

    const canDragFrom = (target: EventTarget | null) => {
      const node = target instanceof HTMLElement ? target : null;
      const body = node?.closest('[data-place-body]');
      if (body instanceof HTMLElement && body.scrollTop > 4) return false;
      return true;
    };

    const down = (e: TouchEvent) => {
      if (!canDragFrom(e.target)) return;
      g.y = e.touches[0].clientY;
      g.dy = 0;
      g.dragging = true;
      setSnapping(false);
    };

    const move = (e: TouchEvent) => {
      if (!g.dragging) return;
      const dy = e.touches[0].clientY - g.y;
      if (dy < 0) {
        g.dy = 0;
        setOffset(0);
        return;
      }
      e.preventDefault();
      g.dy = dy;
      setOffset(dy);
    };

    const up = () => {
      if (!g.dragging) return;
      g.dragging = false;
      if (g.dy > 72) {
        haptic('light');
        onClose();
        return;
      }
      setSnapping(true);
      setOffset(0);
    };

    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', up);
    el.addEventListener('touchcancel', up);
    return () => {
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', up);
      el.removeEventListener('touchcancel', up);
    };
  }, [onClose]);

  return (
    <div
      ref={sheet}
      className="absolute inset-x-0 bottom-0 z-30 max-h-[48%] rounded-t-[1.6rem] border-t border-paper/10 bg-[#14110f] px-5 pb-[calc(var(--safe-bottom)+1.2rem)] pt-2"
      style={{
        transform: `translateY(${offset}px)`,
        transition: snapping ? 'transform 0.22s ease' : 'none',
      }}
    >
      <button
        type="button"
        onClick={() => {
          haptic('light');
          onClose();
        }}
        className="mx-auto mb-1 flex h-7 w-full items-center justify-center"
        aria-label="Cerrar"
      >
        <span className="block h-1 w-12 rounded-full bg-paper/35" />
      </button>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#e23a32]/90">{place.kicker}</p>
        <button
          type="button"
          onClick={() => {
            haptic('light');
            onClose();
          }}
          className="shrink-0 rounded-full border border-paper/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-paper/70"
        >
          cerrar
        </button>
      </div>
      <h3 className="mt-2 font-display text-[1.7rem] italic leading-tight text-paper">{place.label}</h3>
      <p
        data-place-body
        className="selectable mt-3 max-h-[14vh] overflow-y-auto text-[15px] leading-relaxed text-paper/70"
      >
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
