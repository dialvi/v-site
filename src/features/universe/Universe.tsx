import { useEffect, useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { haptic } from '@/lib/haptics';
import { startUniverseTheme } from '@/lib/universeTheme';
import { pingSection, pingUniverse } from '@/lib/watch';
import { useUniverseState } from '@/state/UniverseState';
import { Starfield } from '@/components/Starfield';
import { Grain } from '@/components/Grain';
import { HistoriaLayer } from '@/features/historia/HistoriaLayer';
import { ListaLayer } from '@/features/lista/ListaLayer';
import { ArchivoLayer } from '@/features/archivo/ArchivoLayer';
import { ConclusionLayer } from '@/features/conclusion/ConclusionLayer';
import { InvestigacionLayer } from '@/features/investigacion/InvestigacionLayer';
import { SecretosLayer } from '@/features/secretos/SecretosLayer';
import { MapaLayer } from '@/features/mapa/MapaLayer';
import { WorldNode } from '@/features/universe/WorldNode';
import {
  constellationLines,
  nodes,
  sectionNodes,
  viewFor,
  WORLD,
  type SectionId,
  type ViewId,
} from '@/features/universe/views';

type Hop = { section: SectionId; focus?: string };

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function hopLabel(section: SectionId) {
  if (section === 'investigacion') return 'investigación';
  if (section === 'secretos') return 'confidencial';
  return section;
}

export function Universe() {
  const reduced = usePrefersReducedMotion();
  const { save, patch } = useUniverseState();
  const [view, setView] = useState<ViewId>('intro');
  const [layer, setLayer] = useState<SectionId | null>(null);
  const [jumpFocus, setJumpFocus] = useState<string | undefined>();
  const [stack, setStack] = useState<Hop[]>([]);
  const [entered, setEntered] = useState(false);
  const [hint, setHint] = useState(false);
  const pinchOut = useRef(0);
  const start = viewFor(
    'intro',
    typeof window === 'undefined' ? 390 : window.innerWidth,
    typeof window === 'undefined' ? 844 : window.innerHeight,
  );
  const { camera, flyTo, bind, minScale } = useCamera(start);

  useEffect(() => {
    if (entered) {
      const t = window.setTimeout(() => setHint(true), 1400);
      return () => window.clearTimeout(t);
    }
    setHint(false);
  }, [entered]);

  const goMap = (duration = reduced ? 1 : 1200) => {
    const { w, h } = viewport();
    setStack([]);
    setJumpFocus(undefined);
    setLayer(null);
    setView('map');
    flyTo(viewFor('map', w, h), duration);
  };

  const showSection = (next: SectionId, focus?: string, instant = false) => {
    const { w, h } = viewport();
    if (!save.seenSections.includes(next)) {
      void patch({ seenSections: [...save.seenSections, next] });
    }
    setJumpFocus(focus);
    setView(next);
    pingSection(next);
    if (instant) {
      setLayer(next);
      flyTo(viewFor(next, w, h), reduced ? 1 : 700);
      return;
    }
    flyTo(viewFor(next, w, h), reduced ? 1 : 900, () => setLayer(next));
  };

  const enter = () => {
    const { w, h } = viewport();
    haptic('medium');
    setEntered(true);
    pingUniverse();
    startUniverseTheme();
    flyTo(viewFor('map', w, h), reduced ? 1 : 1400, () => {
      setView('map');
    });
  };

  const goIntro = () => {
    if (!entered || layer) return;
    haptic('medium');
    setStack([]);
    setJumpFocus(undefined);
    setLayer(null);
    setEntered(false);
    setView('intro');
    const { w, h } = viewport();
    flyTo(viewFor('intro', w, h), reduced ? 1 : 1100);
  };

  const open = (next: SectionId, focus?: string) => {
    haptic('medium');
    setStack([]);
    showSection(next, focus);
  };

  const jump = (next: SectionId, focus: string | undefined, from: Hop) => {
    haptic('medium');
    setStack((s) => [...s, from]);
    showSection(next, focus, true);
  };

  const backFromLayer = () => {
    haptic('light');
    const prev = stack[stack.length - 1];
    if (prev) {
      setStack((s) => s.slice(0, -1));
      showSection(prev.section, prev.focus, true);
      return;
    }
    goMap();
  };

  const returnTo = stack[stack.length - 1];
  const backLabel = returnTo ? hopLabel(returnTo.section) : 'universo';

  const worldStyle = {
    width: WORLD.width,
    height: WORLD.height,
    transform: `translate(${-camera.x}px, ${-camera.y}px)`,
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, #1c1714 0%, #0c0b0a 62%, #070606 100%)',
        }}
      />
      <Starfield />

      <div
        className="absolute inset-0 touch-none"
        style={{ touchAction: 'none' }}
        {...(entered && !layer ? bind : {})}
        onPointerDown={(e) => {
          if (!entered || layer) return;
          pinchOut.current = camera.scale;
          bind.onPointerDown(e);
        }}
        onPointerUp={(e) => {
          if (!entered || layer) return;
          bind.onPointerUp(e);
          if (camera.scale < pinchOut.current * 0.82 && camera.scale < minScale + 0.35) {
            goMap(800);
          }
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{ transform: `scale(${camera.scale})`, transformOrigin: '0 0' }}
        >
          <div className="relative" style={worldStyle}>
            <Constellation entered={entered} />
            <TitleMark entered={entered} onOpenIntro={goIntro} />
            {sectionNodes.map((node) => (
              <WorldNode
                key={node.id}
                x={node.x}
                y={node.y}
                kicker={node.kicker}
                label={node.label}
                glyph={node.glyph}
                visible={entered}
                delay={node.delay}
                onOpen={() => open(node.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {!entered && <IntroHud onEnter={enter} />}

      {entered && !layer && view !== 'intro' && hint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 safe-pad flex flex-col items-center">
          <p className="text-center text-[11px] uppercase tracking-[0.22em] text-paper/40 animate-fade-in">
            pellizca · arrastra · toca
          </p>
        </div>
      )}

      {layer === 'historia' && (
        <HistoriaLayer
          onBack={backFromLayer}
          backLabel={backLabel}
          focusId={jumpFocus}
          onOpenMap={(placeId, storyFocus) =>
            jump('mapa', placeId, { section: 'historia', focus: storyFocus })
          }
        />
      )}
      {layer === 'lista' && <ListaLayer onBack={backFromLayer} />}
      {layer === 'archivo' && <ArchivoLayer onBack={backFromLayer} />}
      {layer === 'investigacion' && (
        <InvestigacionLayer onBack={backFromLayer} backLabel={backLabel} focusId={jumpFocus} />
      )}
      {layer === 'secretos' && <SecretosLayer onBack={backFromLayer} />}
      {layer === 'mapa' && (
        <MapaLayer
          onBack={backFromLayer}
          backLabel={backLabel}
          focusId={jumpFocus}
          onJump={(link, placeId) =>
            jump(link.section, link.focus, { section: 'mapa', focus: placeId })
          }
        />
      )}
      {layer === 'conclusion' && (
        <ConclusionLayer
          alreadyUnlocked={save.unlockedFirst}
          onBack={backFromLayer}
          backLabel={backLabel}
          onUnlock={() => {
            void patch({ unlockedFirst: true });
            setStack([]);
            const { w, h } = viewport();
            setLayer('lista');
            setView('lista');
            flyTo(viewFor('lista', w, h), reduced ? 1 : 700);
          }}
        />
      )}

      {layer !== 'mapa' && <Grain />}
    </div>
  );
}

function TitleMark({ entered, onOpenIntro }: { entered: boolean; onOpenIntro: () => void }) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
      style={{
        left: nodes.title.x,
        top: nodes.title.y,
        width: entered ? undefined : 300,
        pointerEvents: entered ? 'auto' : 'none',
      }}
      onPointerDown={
        entered
          ? (e) => {
              origin.current = { x: e.clientX, y: e.clientY };
            }
          : undefined
      }
      onClick={
        entered
          ? (e) => {
              const o = origin.current;
              if (o && Math.hypot(e.clientX - o.x, e.clientY - o.y) > 12) return;
              onOpenIntro();
            }
          : undefined
      }
    >
      {entered ? (
        <p className="whitespace-nowrap px-[0.45em] font-display text-[1.45rem] italic leading-none text-paper">
          Valeria 😊
        </p>
      ) : (
        <>
          <p className="font-display italic leading-none text-paper">
            <span className="text-[1.35rem]">Para </span>
            <span className="text-[2.55rem]">Valeria</span>
          </p>
          <p className="mt-2 font-display text-[1.25rem] italic leading-snug text-paper/75">de Diego...</p>
          <p className="mt-5 font-display text-[1.15rem] italic leading-snug text-paper/70">por tu cumpleaños</p>
          <p className="mt-1 text-[14px] leading-snug text-paper/55">para que sigas disfrutando la vida</p>
        </>
      )}
    </div>
  );
}

function Constellation({ entered }: { entered: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
    >
      {constellationLines.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(232,184,109,0.42)"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{ opacity: entered ? 1 : 0, transition: 'opacity 1.2s ease' }}
        />
      ))}
    </svg>
  );
}

function IntroHud({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end safe-pad">
      <div className="mb-[10vh] flex flex-col items-center text-center animate-slide-up">
        <p className="max-w-[28ch] text-[15px] leading-relaxed text-paper/70">
          Me dijiste que te gustaba la astronomía.
        </p>
        <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-paper/55">
          Mi regalo es un poco extraño, pero te servirá para recordar y explorar tu universo de experiencias.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="pointer-events-auto mt-8 text-[13px] uppercase tracking-[0.32em] text-gold"
        >
          Explorar mi universo →
        </button>
      </div>
    </div>
  );
}
