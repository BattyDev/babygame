import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { freshState, loadState, saveState, type GameState, type Phase } from './game';
import { guestLines, phaseClass } from './lines';
import { Petals, Stage } from './puzzles';
import { Sentence } from './Sentence';
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
    if (state.phase !== 'fireflies' || state.fireflies < 3) return;
    const timer = window.setTimeout(() => {
      setState((current) =>
        current.phase === 'fireflies' ? { ...current, phase: 'hold', updatedAt: Date.now() } : current,
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.fireflies]);

  useEffect(() => {
    document.title = state.phase === 'reveal' ? 'She will be joining our family' : 'A sentence for you';
  }, [state.phase]);

  const lines = guestLines(state);

  const patch = (partial: Partial<GameState>) => {
    setState((current) => ({ ...current, ...partial, updatedAt: Date.now() }));
  };

  const advance = () => {
    const phase = nextPhase(state.phase);
    if (!phase) return;
    setState((current) => ({ ...current, phase, updatedAt: Date.now() }));
  };

  return (
    <main className={`play ${phaseClass(state.phase)}`}>
      {state.phase === 'reveal' && <Petals />}
      <Sentence state={state} />
      <p className="step">{lines.step}</p>
      <Stage state={state} onPatch={patch} onAdvance={advance} />
      <p className="caption">{lines.caption}</p>
      <p className={linked ? 'link-dot on' : 'link-dot'}>{linked ? 'She can see this' : 'On your phone'}</p>
    </main>
  );
}

function nextPhase(phase: Phase): Phase | null {
  switch (phase) {
    case 'intro':
      return 'vine';
    case 'vine':
      return 'block';
    case 'block':
      return 'fireflies';
    case 'hold':
      return 'ribbon';
    case 'ribbon':
      return 'reveal';
    default:
      return null;
  }
}

function decodeName(name: string): string {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
