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
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${(index * 19) % 100}%`,
              animationDelay: `${2.2 + (index % 8) * 0.08}s`,
              animationDuration: `${3.6 + (index % 4) * 0.4}s`,
            }}
          />
        ))}
      </div>
      <div className="finale-lockup">
        <div className="she-row">
          <span className="s-slot">
            <b className="s-letter">S</b>
          </span>
          <span className="he-pair">
            <b>H</b>
            <b>E</b>
            <i className="satin" aria-hidden="true" />
          </span>
        </div>
        <p className="finale-line">will be joining our family early May</p>
      </div>
      <p className="nipt">
        A blood test called NIPT says girl. Right almost all the time. Certain when you meet her.
      </p>
    </div>
  );
}
