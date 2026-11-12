import type { GameState, Phase } from './game';

export function guestLines(state: GameState): { caption: string; action?: string; step: string } {
  const who = state.guestName ? `${state.guestName}, someone` : 'Someone';
  switch (state.phase) {
    case 'intro':
      return {
        step: 'A short one',
        caption: `${who} started a sentence and got shy. Help finish it.`,
        action: 'Begin',
      };
    case 'vine':
      return state.vineLocked
        ? { step: '1 of 4', caption: 'Early May. That is the when.', action: 'Add it to the sentence' }
        : { step: '1 of 4', caption: 'Slide the sun until the branch remembers.' };
    case 'block':
      return state.blockPlaced
        ? { step: '2 of 4', caption: 'H. Just an H.', action: 'Add the letter' }
        : { step: '2 of 4', caption: 'The sign is missing a piece. One block fits.' };
    case 'fireflies':
      return {
        step: '3 of 4',
        caption:
          state.fireflies === 0
            ? 'Top one first. Then the left. Then the little one on the flower.'
            : `${state.fireflies} of 3. Keep the order.`,
      };
    case 'hold':
      return { step: 'Look', caption: 'Read the first word.', action: 'One more' };
    case 'ribbon':
      return state.ribbonLocked
        ? { step: '4 of 4', caption: 'It wants the front of the word.', action: 'Let it in' }
        : { step: '4 of 4', caption: 'The last mark is a ribbon. Smooth it flat.' };
    case 'reveal':
      return { step: 'The sentence', caption: 'She will be joining our family in early May.' };
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
    case 'vine':
      return state.vineLocked
        ? {
            kicker: 'The vine',
            say: 'Early May. Ask them to add it to the sentence.',
            doing: 'The branch bloomed.',
          }
        : {
            kicker: 'The vine',
            say: 'Slide the sun until the branch remembers the month.',
            doing: 'They are moving the sun.',
          };
    case 'block':
      return state.blockPlaced
        ? {
            kicker: 'The sign',
            say: 'Just an H. Let them set it in the sentence.',
            doing: 'The H is in the sign.',
          }
        : {
            kicker: 'The sign',
            say: 'One of those blocks belongs in the gap.',
            doing: 'They are choosing a block.',
          };
    case 'fireflies':
      return {
        kicker: 'The fireflies',
        say: 'Top one first. Then the left. Then the little one on the flower.',
        doing:
          state.fireflies === 0 ? 'Looking at the dusk.' : `Caught ${state.fireflies} of 3, in order.`,
      };
    case 'hold':
      return {
        kicker: 'Let it sit',
        say: 'Let them read the first word. Then say: almost.',
        doing: 'This is the pause. The word looks unfinished.',
      };
    case 'ribbon':
      return state.ribbonLocked
        ? {
            kicker: 'The ribbon',
            say: 'It wants the front of the word. Let them bring it in.',
            doing: 'The ribbon is smooth.',
          }
        : {
            kicker: 'The ribbon',
            say: 'The last mark is a ribbon. Smooth it flat.',
            doing: 'They are smoothing the ribbon.',
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
  return phase === 'reveal' ? 'reveal' : phase === 'hold' ? 'hold' : '';
}
