import type { GameState } from './game';

export function Sentence({ state, large = false }: { state: GameState; large?: boolean }) {
  const showH = state.blockPlaced;
  const showE = state.phase === 'hold' || state.phase === 'ribbon' || state.phase === 'reveal';
  const showS = state.phase === 'reveal';
  const showDate = state.vineLocked && state.phase !== 'intro';

  const tiles = showS
    ? [
        { key: 's', letter: 'S', fresh: true },
        { key: 'h', letter: 'H', fresh: false },
        { key: 'e', letter: 'E', fresh: false },
      ]
    : [
        { key: 'h', letter: showH ? 'H' : '', fresh: false },
        { key: 'e', letter: showE ? 'E' : '', fresh: false },
        { key: 'blank', letter: '', fresh: false },
      ];

  return (
    <header className={large ? 'sentence large' : 'sentence'}>
      <div className="tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <span key={tile.key} className={tile.letter ? `tile${tile.fresh ? ' fresh' : ''}` : 'tile empty'}>
            {tile.letter}
          </span>
        ))}
      </div>
      <p>
        will be joining
        <br />
        our family{' '}
        <span className={showDate ? 'date on' : 'date'}>{showDate ? 'early May' : ''}</span>
      </p>
      <p className="sr">
        {showS ? 'SHE' : `${showH ? 'H' : 'blank'} ${showE ? 'E' : 'blank'} blank`} will be joining our
        family {showDate ? 'early May' : 'date still blank'}
      </p>
    </header>
  );
}
