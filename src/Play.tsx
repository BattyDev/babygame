import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  applySwap,
  freshState,
  loadState,
  saveState,
  turnCube,
  type GameState,
  type Phase,
  type Spin,
} from './game';
import { guestLines, phaseClass } from './lines';
import { Stage } from './puzzles';
import { Finale, Sentence } from './Sentence';
import { usePlaySync } from './sync';

export function Play() {
  const { code = '', name = '' } = useParams();
  const guestName = decodeName(name);
  const [state, setState] = useState<GameState>(() => loadState(code, guestName));
  const stateRef = useRef(state);
  stateRef.current = state;

  const { linked, publish } = usePlaySync(
    code,
    () => stateRef.current,
    (revision) => {
      const next = freshState(code, guestName, revision);
      stateRef.current = next;
      saveState(next);
      setState(next);
    },
  );

  useEffect(() => {
    saveState(state);
    publish(state);
  }, [state, publish]);

  useEffect(() => {
    if (state.phase === 'stars' && state.dateLocked) {
      const timer = window.setTimeout(() => {
        setState((current) =>
          current.phase === 'stars' && current.dateLocked
            ? { ...current, phase: 'blocks', updatedAt: Date.now() }
            : current,
        );
      }, 3200);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'blocks' && state.blocksDone) {
      const timer = window.setTimeout(() => {
        setState((current) =>
          current.phase === 'blocks' && current.blocksDone
            ? { ...current, phase: 'cups', updatedAt: Date.now() }
            : current,
        );
      }, 1400);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'cups' && state.cupBeat === 'show') {
      const timer = window.setTimeout(() => {
        setState((current) =>
          current.cupBeat === 'show' ? { ...current, cupBeat: 'shuffle', swapAt: 0, updatedAt: Date.now() } : current,
        );
      }, 1750);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'cups' && state.cupBeat === 'shuffle') {
      const timer = window.setTimeout(() => {
        setState((current) => {
          if (current.cupBeat !== 'shuffle') return current;
          if (current.swapAt >= current.swaps.length) {
            return { ...current, cupBeat: 'guess', updatedAt: Date.now() };
          }
          return {
            ...current,
            order: applySwap(current.order, current.swaps[current.swapAt] ?? 0),
            swapAt: current.swapAt + 1,
            updatedAt: Date.now(),
          };
        });
      }, 480);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'cups' && state.cupBeat === 'found') {
      const timer = window.setTimeout(() => {
        setState((current) =>
          current.phase === 'cups' && current.cupBeat === 'found'
            ? { ...current, phase: 'touch', updatedAt: Date.now() }
            : current,
        );
      }, 1600);
      return () => window.clearTimeout(timer);
    }
    if (state.miss != null) {
      const timer = window.setTimeout(() => {
        setState((current) => (current.miss == null ? current : { ...current, miss: null, updatedAt: Date.now() }));
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [state.phase, state.dateLocked, state.blocksDone, state.cupBeat, state.swapAt, state.miss]);

  useEffect(() => {
    if (!state.cubes.some((cube) => cube.spin)) return;
    const timer = window.setTimeout(() => {
    setState((current) => {
      if (!current.cubes.some((cube) => cube.spin)) return current;
      return {
        ...current,
        cubes: current.cubes.map((cube) => ({ ...cube, spin: null })),
        updatedAt: Date.now(),
      };
    });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [state.cubes]);

  useEffect(() => {
    document.title = state.phase === 'reveal' ? 'She will be joining our family' : 'A sentence for you';
  }, [state.phase]);

  const caption = guestLines(state);

  const patch = (partial: Partial<GameState>) => {
    setState((current) => ({ ...current, ...partial, updatedAt: Date.now() }));
  };

  const advance = () => {
    const phase = nextPhase(state.phase);
    if (!phase) return;
    setState((current) => ({ ...current, phase, updatedAt: Date.now() }));
  };

  const onTurn = (index: number, dir: Exclude<Spin, null>) => {
    setState((current) => {
      if (current.blocksDone) return current;
      const cubes = current.cubes.map((cube, cubeIndex) => (cubeIndex === index ? turnCube(cube, dir) : cube));
      const blocksDone = cubes.every((cube) => cube.front === 'H');
      return { ...current, cubes, blocksDone, updatedAt: Date.now() };
    });
    navigator.vibrate?.(8);
  };

  const onSwap = (from: number, to: number) => {
    setState((current) => {
      if (current.blocksDone || to < 0 || to >= current.cubes.length) return current;
      const cubes = [...current.cubes];
      [cubes[from], cubes[to]] = [cubes[to], cubes[from]];
      return {
        ...current,
        cubes,
        blocksDone: cubes.every((cube) => cube.front === 'H'),
        updatedAt: Date.now(),
      };
    });
  };

  return (
    <main className={`play ${phaseClass(state.phase)}`}>
      {state.phase === 'reveal' && <Finale />}
      <Sentence state={state} />
      <Stage state={state} onPatch={patch} onAdvance={advance} onTurn={onTurn} onSwap={onSwap} />
      {state.phase !== 'reveal' && caption && <p className="caption">{caption}</p>}
      <p className={linked ? 'link-dot on' : 'link-dot'}>{linked ? 'She can see this' : 'On your phone'}</p>
    </main>
  );
}

function nextPhase(phase: Phase): Phase | null {
  if (phase === 'intro') return 'stars';
  if (phase === 'touch') return 'reveal';
  return null;
}

function decodeName(name: string): string {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
