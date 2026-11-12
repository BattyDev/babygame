import type { GameState } from './game';

export function Sentence({ state, large = false }: { state: GameState; large?: boolean }) {
  const showDate = state.dateLocked && state.phase !== 'intro';
  const showH = state.blocksDone;
  const showE = state.cupBeat === 'found' || state.phase === 'touch' || state.phase === 'reveal';
  const ribbon = state.phase === 'touch';
  const spoken = showE && showH ? 'H E' : showH ? 'H' : 'a blank line';

  return (
    <header className={large ? 'sentence large' : 'sentence'}>
      <p className="wordline">
        <span className={ribbon ? 'letters ribboned' : 'letters'}>
          {showH ? <b>H</b> : null}
          {showE ? <b className="e-in">E</b> : null}
          {!showH && <i className="rule" />}
          {ribbon && <i className="under-ribbon" aria-hidden="true" />}
        </span>
      </p>
      <p>
        will be joining
        <br />
        our family <span className={showDate ? 'date on' : 'date'}>{showDate ? 'early May' : ''}</span>
      </p>
      <p className="sr">
        {spoken} will be joining our family {showDate ? 'early May' : 'date still blank'}
      </p>
    </header>
  );
}

export function Finale() {
  return (
    <div className="finale" role="presentation">
      <div className="blush" />
      <div className="rays" />
      <div className="rays soft" />
      <div className="flash" />
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 46 }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${(index * 17) % 100}%`,
              animationDelay: `${(index % 10) * 0.08}s`,
              animationDuration: `${3.2 + (index % 5) * 0.5}s`,
            }}
          />
        ))}
      </div>
      <div className="finale-lockup">
        <div className="she-row">
          <span className="s-letter">S</span>
          <span className="he-pair">
            <b>H</b>
            <b>E</b>
            <i className="ribbon-fly" />
          </span>
        </div>
        <p>will be joining our family early May</p>
        <p className="caveat light">
          A blood test called NIPT says girl. It is right almost all the time. We will know for
          certain when we meet her.
        </p>
      </div>
    </div>
  );
}
