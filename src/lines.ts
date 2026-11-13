import type { GameState, Phase } from './game';

export function guestLines(state: GameState): string {
  const who = state.guestName ? `${state.guestName}, someone` : 'Someone';
  switch (state.phase) {
    case 'intro':
      return `${who} started a sentence and got shy. Help finish it.`;
    case 'stars':
      return state.dateLocked ? '' : 'Drag the glass across the stars.';
    case 'blocks':
      return state.blocksDone ? 'H.' : 'Turn the blocks. One of them is hiding a letter.';
    case 'cups':
      if (state.cupBeat === 'ready') return 'Say when.';
      if (state.cupBeat === 'show' || state.cupBeat === 'shuffle') return 'Watch the ball.';
      if (state.cupBeat === 'found') return 'E.';
      return state.miss != null ? 'Empty. Try another.' : 'Lift a cup.';
    case 'touch':
      return 'One last touch.';
    case 'reveal':
      return 'She will be joining our family in early May.';
  }
}

export function phaseClass(phase: Phase): string {
  if (phase === 'reveal') return 'reveal';
  if (phase === 'touch') return 'touch';
  return '';
}
