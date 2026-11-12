import type { GameState, Phase } from './game';

export function guestLines(state: GameState): string {
  const who = state.guestName ? `${state.guestName}, someone` : 'Someone';
  switch (state.phase) {
    case 'intro':
      return `${who} started a sentence and got shy. Help finish it.`;
    case 'stars':
      return state.dateLocked ? 'Early May.' : 'Drag the glass across the stars.';
    case 'blocks':
      return state.blocksDone ? 'H.' : 'Turn the blocks until the letters face you.';
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

export function watchScript(state: GameState): { kicker: string; say: string; doing: string } {
  switch (state.phase) {
    case 'intro':
      return {
        kicker: 'When they open it',
        say: 'Someone started a sentence and got shy. Want to help finish it?',
        doing: 'Waiting for them to begin.',
      };
    case 'stars':
      return state.dateLocked
        ? {
            kicker: 'The sky',
            say: 'Early May. The bull gave the month away.',
            doing: 'The stars just connected.',
          }
        : {
            kicker: 'The sky',
            say: 'Drag the glass over the stars. The bull marks the month.',
            doing: 'They are sweeping the sky.',
          };
    case 'blocks':
      return state.blocksDone
        ? {
            kicker: 'The blocks',
            say: 'Just an H.',
            doing: 'Every block is showing H.',
          }
        : {
            kicker: 'The blocks',
            say: 'A letter is hidden on each block. Turn them until they match.',
            doing: 'They are turning the blocks.',
          };
    case 'cups':
      if (state.cupBeat === 'ready') {
        return {
          kicker: 'The cups',
          say: 'When you are ready, watch the ball.',
          doing: 'Waiting for them to start.',
        };
      }
      if (state.cupBeat === 'guess') {
        return {
          kicker: 'The cups',
          say: 'Which cup?',
          doing: state.miss != null ? 'That one was empty.' : 'They are choosing a cup.',
        };
      }
      if (state.cupBeat === 'found') {
        return { kicker: 'The cups', say: 'E. Look at the word.', doing: 'They found it.' };
      }
      return { kicker: 'The cups', say: 'Keep your eyes on the ball.', doing: 'The cups are moving.' };
    case 'touch':
      return {
        kicker: 'Let it sit',
        say: 'Let them read the word. Then say: almost.',
        doing: 'One last touch is waiting.',
      };
    case 'reveal':
      return {
        kicker: 'Read it',
        say: 'She will be joining our family in early May.',
        doing: 'The sentence is finished.',
      };
  }
}

export function phaseClass(phase: Phase): string {
  if (phase === 'reveal') return 'reveal';
  if (phase === 'touch') return 'touch';
  return '';
}
