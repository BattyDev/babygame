import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Cube, GameState, Spin } from './game';

const TAURUS: Array<[number, number]> = [
  [52, 18],
  [60, 32],
  [64, 40],
  [70, 32],
  [78, 16],
  [60, 52],
  [74, 50],
];

const LINES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
];

const FIELD: Array<[number, number]> = [
  [8, 14],
  [16, 28],
  [12, 48],
  [22, 62],
  [8, 78],
  [28, 18],
  [34, 44],
  [30, 72],
  [42, 16],
  [46, 58],
  [40, 82],
  [58, 70],
  [62, 84],
  [74, 68],
  [82, 40],
  [88, 22],
  [90, 58],
  [84, 80],
  [50, 30],
  [24, 88],
  [70, 14],
  [14, 40],
];

const TAURUS_AT = { x: 65, y: 36 };

export function Stage({
  state,
  readonly = false,
  onPatch,
  onAdvance,
  onTurn,
}: {
  state: GameState;
  readonly?: boolean;
  onPatch: (patch: Partial<GameState>) => void;
  onAdvance: () => void;
  onTurn: (index: number, dir: Exclude<Spin, null>) => void;
}) {
  return <Crossfade id={state.phase}>{scene(state, readonly, onPatch, onAdvance, onTurn)}</Crossfade>;
}

function Crossfade({ id, children }: { id: string; children: ReactNode }) {
  const seen = useRef({ id, children });
  const [leaving, setLeaving] = useState<ReactNode>(null);

  if (seen.current.id !== id) {
    setLeaving(seen.current.children);
    seen.current = { id, children };
  } else {
    seen.current = { id, children };
  }

  useEffect(() => {
    if (leaving == null) return;
    const timer = window.setTimeout(() => setLeaving(null), 620);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  return (
    <div className="stage-frame">
      {leaving != null ? <div className="stage-leave">{leaving}</div> : null}
      <div className="stage-enter" key={id}>
        {children}
      </div>
    </div>
  );
}

function scene(
  state: GameState,
  readonly: boolean,
  onPatch: (patch: Partial<GameState>) => void,
  onAdvance: () => void,
  onTurn: (index: number, dir: Exclude<Spin, null>) => void,
) {
  switch (state.phase) {
    case 'intro':
      return (
        <div className="stage intro-stage">
          <button className="go" type="button" onClick={onAdvance} disabled={readonly}>
            Begin
          </button>
        </div>
      );
    case 'stars':
      return <Stars state={state} readonly={readonly} onPatch={onPatch} />;
    case 'blocks':
      return <Blocks state={state} readonly={readonly} onTurn={onTurn} />;
    case 'cups':
      return <Cups state={state} readonly={readonly} onPatch={onPatch} />;
    case 'touch':
      if (readonly) return null;
      return (
        <div className="stage touch-stage">
          <button className="go last" type="button" onClick={onAdvance}>
            One last touch
          </button>
        </div>
      );
    case 'reveal':
      return null;
  }
}

function Stars({
  state,
  readonly,
  onPatch,
}: {
  state: GameState;
  readonly: boolean;
  onPatch: (patch: Partial<GameState>) => void;
}) {
  const sky = useRef<HTMLDivElement>(null);
  const last = useRef(0);

  const move = (clientX: number, clientY: number, force: boolean) => {
    if (readonly || state.dateLocked) return;
    const rect = sky.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 6, 94);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 8, 90);
    const now = performance.now();
    const distance = Math.hypot(x - TAURUS_AT.x, y - TAURUS_AT.y);
    const locked = distance < 12;
    if (!force && !locked && now - last.current < 90) return;
    last.current = now;
    onPatch(locked ? { lensX: TAURUS_AT.x, lensY: TAURUS_AT.y, dateLocked: true } : { lensX: x, lensY: y });
    if (locked) navigator.vibrate?.(12);
  };

  const near = Math.hypot(state.lensX - TAURUS_AT.x, state.lensY - TAURUS_AT.y) < 20;

  return (
    <div className="stage">
      <div
        ref={sky}
        className={state.dateLocked ? 'night found' : near ? 'night warm' : 'night'}
        onPointerDown={(event) => {
          move(event.clientX, event.clientY, true);
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            /* drag still tracks while the pointer stays over the sky */
          }
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event.clientX, event.clientY, false);
        }}
      >
        {FIELD.map(([x, y], index) => (
          <i key={index} className="star" style={starStyle(x, y, state.lensX, state.lensY, state.dateLocked)} />
        ))}
        <div className="constellation">
          {TAURUS.map(([x, y], index) => (
            <i key={`t-${index}`} className="star bull" style={starStyle(x, y, state.lensX, state.lensY, state.dateLocked)} />
          ))}
          <svg className="lines" viewBox="0 0 100 100" aria-hidden="true">
            {LINES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={TAURUS[a][0]}
                y1={TAURUS[a][1]}
                x2={TAURUS[b][0]}
                y2={TAURUS[b][1]}
              />
            ))}
          </svg>
        </div>
        <div className="glass" style={{ left: `${state.lensX}%`, top: `${state.lensY}%` }} aria-hidden="true" />
      </div>
      {state.dateLocked && <p className="taurus-line">Is that Taurus? That means early May!</p>}
    </div>
  );
}

function starStyle(x: number, y: number, lensX: number, lensY: number, locked: boolean): CSSProperties {
  const distance = Math.hypot(x - lensX, y - lensY);
  const scale = locked ? 1 : distance < 9 ? 2.1 : distance < 16 ? 1.35 : 1;
  return { left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${scale})` };
}

const TILT = [
  { rx: '22deg', ry: '-38deg' },
  { rx: '-14deg', ry: '36deg' },
  { rx: '-34deg', ry: '16deg' },
];

function Blocks({
  state,
  readonly,
  onTurn,
}: {
  state: GameState;
  readonly: boolean;
  onTurn: (index: number, dir: Exclude<Spin, null>) => void;
}) {
  return (
    <div className="stage">
      <div className={state.blocksDone ? 'table lined' : 'table'}>
        {state.cubes.map((cube, index) => (
          <CubeView
            key={index}
            cube={cube}
            index={index}
            hint={state.blockHint && !state.blocksDone}
            readonly={readonly || state.blocksDone}
            onTurn={onTurn}
          />
        ))}
      </div>
    </div>
  );
}

function CubeView({
  cube,
  index,
  hint,
  readonly,
  onTurn,
}: {
  cube: Cube;
  index: number;
  hint: boolean;
  readonly: boolean;
  onTurn: (index: number, dir: Exclude<Spin, null>) => void;
}) {
  const start = useRef({ x: 0, y: 0 });
  const tilt = TILT[index] ?? TILT[0];
  const prize = [cube.front, cube.right, cube.back, cube.left, cube.top, cube.bottom].includes('H');

  return (
    <div className="cube-scene">
      {hint && prize && <i className="hint-arrow" aria-hidden="true" />}
      <div
        className={cube.spin ? `cube spin-${cube.spin}` : 'cube'}
        style={{ '--rx': tilt.rx, '--ry': tilt.ry } as CSSProperties}
        aria-label={`Block showing ${cube.front}`}
        onPointerDown={(event) => {
          if (readonly) return;
          event.preventDefault();
          start.current = { x: event.clientX, y: event.clientY };
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            /* a mouse drag still works without capture */
          }
        }}
        onPointerUp={(event) => {
          if (readonly) return;
          const dx = event.clientX - start.current.x;
          const dy = event.clientY - start.current.y;
          if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
          if (Math.abs(dx) > Math.abs(dy)) onTurn(index, dx < 0 ? 'left' : 'right');
          else onTurn(index, dy < 0 ? 'up' : 'down');
        }}
      >
        <Face name="front" symbol={cube.front} />
        <Face name="back" symbol={cube.back} />
        <Face name="right" symbol={cube.right} />
        <Face name="left" symbol={cube.left} />
        <Face name="top" symbol={cube.top} />
        <Face name="bottom" symbol={cube.bottom} />
      </div>
    </div>
  );
}

function Face({ name, symbol }: { name: string; symbol: string }) {
  return <span className={symbol === 'H' ? `face ${name} letter` : `face ${name}`}>{symbol}</span>;
}

function Cups({
  state,
  readonly,
  onPatch,
}: {
  state: GameState;
  readonly: boolean;
  onPatch: (patch: Partial<GameState>) => void;
}) {
  const lifting = (id: number) => state.miss === id || (state.cupBeat === 'found' && state.ball === id);

  return (
    <div className="stage">
      <div className="shell">
        {[0, 1, 2].map((id) => {
          const slot = state.order.indexOf(id);
          return (
            <button
              key={id}
              type="button"
              className={
                lifting(id) ? 'cup lifted' : state.cupBeat === 'show' && id === state.ball ? 'cup show-ball' : 'cup'
              }
              style={{ transform: `translateX(${slot * 6.4}rem)` }}
              disabled={readonly || state.cupBeat !== 'guess'}
              onClick={() => {
                if (id === state.ball) onPatch({ cupBeat: 'found', miss: null });
                else onPatch({ miss: id });
              }}
            >
              {state.cupBeat === 'show' && id === state.ball && <i className="pea drop" />}
              {state.cupBeat === 'found' && id === state.ball && <i className="pea show-e">E</i>}
              <span className="cup-model">
                <span className="cup-body" />
                <span className="cup-lip" />
              </span>
            </button>
          );
        })}
      </div>
      {state.cupBeat === 'ready' && !readonly && (
        <button
          className="go"
          type="button"
          disabled={readonly}
          onClick={() => {
            const ball = Math.floor(Math.random() * 3);
            const swaps = Array.from({ length: 7 }, () => (Math.random() < 0.5 ? 0 : 1));
            onPatch({ cupBeat: 'show', ball, swaps, swapAt: 0, order: [0, 1, 2], miss: null });
          }}
        >
          Ready
        </button>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
