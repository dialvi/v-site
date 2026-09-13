import { useEffect, useMemo, useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { haptic } from '@/lib/haptics';
import { loadSave, writeSave } from '@/lib/storage';
import { Starfield } from '@/components/Starfield';
import { Grain } from '@/components/Grain';
import { HistoriaLayer } from '@/features/historia/HistoriaLayer';
import { ListaLayer } from '@/features/lista/ListaLayer';
import { ArchivoLayer } from '@/features/archivo/ArchivoLayer';
import { FinaleLayer } from '@/features/finale/FinaleLayer';
import { WorldNode } from '@/features/universe/WorldNode';
import { nodes, viewFor, WORLD, type ViewId } from '@/features/universe/views';

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight };
}

export function Universe() {
  const reduced = usePrefersReducedMotion();
  const save = useMemo(() => loadSave(), []);
  const [view, setView] = useState<ViewId>(save.entered ? 'map' : 'intro');
  const [layer, setLayer] = useState<Exclude<ViewId, 'intro' | 'map'> | null>(null);
  const [entered, setEntered] = useState(save.entered);
  const [unlockedFirst, setUnlockedFirst] = useState(save.unlockedFirst);
  const [hint, setHint] = useState(false);
  const pinchOut = useRef(0);
  const start = save.entered
    ? viewFor('map', typeof window === 'undefined' ? 390 : window.innerWidth, typeof window === 'undefined' ? 844 : window.innerHeight)
    : viewFor('intro', typeof window === 'undefined' ? 390 : window.innerWidth, typeof window === 'undefined' ? 844 : window.innerHeight);
  const { camera, flyTo, bind, minScale } = useCamera(start);

  useEffect(() => {
    if (entered) {
      const t = window.setTimeout(() => setHint(true), 1400);
      return () => window.clearTimeout(t);
    }
  }, [entered]);

  const goMap = (duration = reduced ? 1 : 1200) => {
    const { w, h } = viewport();
    setLayer(null);
    setView('map');
    flyTo(viewFor('map', w, h), duration);
  };

  const enter = () => {
    const { w, h } = viewport();
    haptic('medium');
    writeSave({ entered: true });
    setEntered(true);
    flyTo(viewFor('map', w, h), reduced ? 1 : 1400, () => {
      setView('map');
    });
  };

  const open = (next: Exclude<ViewId, 'intro' | 'map'>) => {
    const { w, h } = viewport();
    haptic('medium');
    const seen = loadSave().seenSections;
    if (!seen.includes(next)) writeSave({ seenSections: [...seen, next] });
    setView(next);
    flyTo(viewFor(next, w, h), reduced ? 1 : 900, () => setLayer(next));
  };

  const backFromLayer = () => {
    haptic('light');
    goMap();
  };

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
            <TitleMark />
            <WorldNode
              x={nodes.historia.x}
              y={nodes.historia.y}
              kicker="01"
              label="Historia"
              glyph="✦"
              visible={entered}
              delay={120}
              onOpen={() => open('historia')}
            />
            <WorldNode
              x={nodes.archivo.x}
              y={nodes.archivo.y}
              kicker="archivo"
              label="Archivo"
              glyph="◎"
              visible={entered}
              delay={260}
              onOpen={() => open('archivo')}
            />
            <WorldNode
              x={nodes.lista.x}
              y={nodes.lista.y}
              kicker="128"
              label="La lista"
              glyph="⌘"
              visible={entered}
              delay={400}
              onOpen={() => open('lista')}
            />
          </div>
        </div>
      </div>

      {!entered && <IntroHud onEnter={enter} />}

      {entered && !layer && view !== 'intro' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 safe-pad flex flex-col items-center gap-3">
          {hint && (
            <p className="text-center text-[11px] uppercase tracking-[0.22em] text-paper/40 animate-fade-in">
              pellizca · arrastra · toca
            </p>
          )}
          <button
            type="button"
            className="pointer-events-auto text-[11px] uppercase tracking-[0.22em] text-gold/70"
            onClick={() => {
              haptic('light');
              open('finale');
            }}
          >
            esto es solo el comienzo
          </button>
        </div>
      )}

      {layer === 'historia' && <HistoriaLayer onBack={backFromLayer} />}
      {layer === 'lista' && (
        <ListaLayer
          onBack={backFromLayer}
          onFirstUnlock={() => setUnlockedFirst(true)}
        />
      )}
      {layer === 'archivo' && <ArchivoLayer onBack={backFromLayer} />}
      {layer === 'finale' && (
        <FinaleLayer
          alreadyUnlocked={unlockedFirst}
          onBack={backFromLayer}
          onUnlock={() => {
            setUnlockedFirst(true);
            writeSave({ unlockedFirst: true });
            const { w, h } = viewport();
            setLayer('lista');
            setView('lista');
            flyTo(viewFor('lista', w, h), reduced ? 1 : 700);
          }}
        />
      )}

      <Grain />
    </div>
  );
}

function TitleMark() {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
      style={{ left: nodes.title.x, top: nodes.title.y }}
    >
      <p className="font-display text-[4.6rem] italic leading-none text-paper">Valeria</p>
    </div>
  );
}

function Constellation({ entered }: { entered: boolean }) {
  const pts = [
    [nodes.historia.x, nodes.historia.y],
    [nodes.archivo.x, nodes.archivo.y],
    [nodes.lista.x, nodes.lista.y],
    [nodes.historia.x, nodes.historia.y],
  ];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
    >
      <path
        d={d}
        fill="none"
        stroke="rgba(232,184,109,0.22)"
        strokeWidth="1.2"
        strokeDasharray="4 10"
        style={{
          opacity: entered ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      />
    </svg>
  );
}

function IntroHud({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end safe-pad">
      <div className="mb-[18vh] flex flex-col items-center text-center animate-slide-up">
        <p className="max-w-[18ch] text-[15px] leading-relaxed text-paper/60">
          Tu regalo tiene varias partes.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="pointer-events-auto mt-8 text-[13px] uppercase tracking-[0.32em] text-gold"
        >
          Entrar →
        </button>
      </div>
    </div>
  );
}
