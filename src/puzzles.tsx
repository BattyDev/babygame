import type { ReactNode } from 'react';
import type { GameState } from './game';
import { DragMeter } from './DragMeter';

const FIREFLIES = ['top', 'left', 'flower'] as const;

export function Stage({
  state,
  onPatch,
  onAdvance,
}: {
  state: GameState;
  onPatch: (patch: Partial<GameState>) => void;
  onAdvance: () => void;
}) {
  switch (state.phase) {
    case 'intro':
      return (
        <div className="stage intro-stage">
          <p className="quiet">Four little things. Then the sentence can finish.</p>
          <button className="go" type="button" onClick={onAdvance}>
            Begin
          </button>
        </div>
      );
    case 'vine':
      return (
        <Vine
          value={state.vine}
          locked={state.vineLocked}
          onChange={(vine) => {
            if (state.vineLocked) return;
            const locked = vine >= 97;
            onPatch(locked ? { vine: 100, vineLocked: true } : { vine });
            if (locked) navigator.vibrate?.(12);
          }}
          onAdvance={onAdvance}
        />
      );
    case 'block':
      return (
        <Blocks
          placed={state.blockPlaced}
          onPick={(letter) => {
            if (letter === 'H') {
              onPatch({ blockPlaced: true });
              navigator.vibrate?.(12);
            }
          }}
          onAdvance={onAdvance}
        />
      );
    case 'fireflies':
      return (
        <Fireflies
          progress={state.fireflies}
          onTap={(id) => {
            if (state.fireflies >= 3) return;
            if (id === FIREFLIES[state.fireflies]) onPatch({ fireflies: state.fireflies + 1 });
            else onPatch({ fireflies: 0 });
          }}
        />
      );
    case 'hold':
      return (
        <div className="stage hold-stage">
          <p className="quiet">The first word is still missing something.</p>
          <button className="go" type="button" onClick={onAdvance}>
            One more
          </button>
        </div>
      );
    case 'ribbon':
      return (
        <Ribbon
          value={state.ribbon}
          locked={state.ribbonLocked}
          onChange={(ribbon) => {
            if (state.ribbonLocked) return;
            const locked = ribbon >= 97;
            onPatch(locked ? { ribbon: 100, ribbonLocked: true } : { ribbon });
            if (locked) navigator.vibrate?.(12);
          }}
          onAdvance={onAdvance}
        />
      );
    case 'reveal':
      return (
        <div className="stage reveal-stage">
          <p className="caveat">
            A blood test called NIPT says girl. It is right almost all the time. We will know for
            certain when we meet her.
          </p>
        </div>
      );
  }
}

function Vine({
  value,
  locked,
  onChange,
  onAdvance,
}: {
  value: number;
  locked: boolean;
  onChange: (value: number) => void;
  onAdvance: () => void;
}) {
  const blooms = [18, 34, 50, 66, 82];
  return (
    <div className="stage">
      <div className="vine-card" aria-hidden="true">
        <div className="sun" style={{ left: `${8 + value * 0.78}%` }} />
        <div className="branch" />
        {blooms.map((at) => (
          <i
            key={at}
            className="bloom"
            style={{
              left: `${at}%`,
              opacity: Math.min(1, Math.max(0, (value - (at - 28)) / 22)),
              transform: `scale(${0.4 + Math.min(1, Math.max(0, (value - (at - 28)) / 22)) * 0.6})`,
            }}
          />
        ))}
        {locked && <em className="plaque">early May</em>}
      </div>
      <DragMeter label="Slide the sun toward summer" value={value} disabled={locked} onChange={onChange} />
      {locked && (
        <button className="go" type="button" onClick={onAdvance}>
          Add it to the sentence
        </button>
      )}
    </div>
  );
}

function Blocks({
  placed,
  onPick,
  onAdvance,
}: {
  placed: boolean;
  onPick: (letter: string) => void;
  onAdvance: () => void;
}) {
  const choices = [
    { id: 'star', label: '★' },
    { id: 'H', label: 'H' },
    { id: 'moon', label: '☾' },
  ];
  return (
    <div className="stage">
      <div className="sign" aria-hidden="true">
        <div className={placed ? 'gap filled' : 'gap'}>{placed ? 'H' : ''}</div>
      </div>
      <div className="choices">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="choice"
            disabled={placed}
            onClick={() => onPick(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {placed && (
        <button className="go" type="button" onClick={onAdvance}>
          Add the letter
        </button>
      )}
    </div>
  );
}

function Fireflies({ progress, onTap }: { progress: number; onTap: (id: string) => void }) {
  return (
    <div className="stage">
      <div className="sky">
        <i className="moon" />
        <i className="flower" />
        {FIREFLIES.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`fly ${id}${index < progress ? ' caught' : ''}`}
            aria-label={id === 'top' ? 'Top firefly' : id === 'left' ? 'Left firefly' : 'Firefly on the flower'}
            onClick={() => onTap(id)}
          />
        ))}
      </div>
    </div>
  );
}

function Ribbon({
  value,
  locked,
  onChange,
  onAdvance,
}: {
  value: number;
  locked: boolean;
  onChange: (value: number) => void;
  onAdvance: () => void;
}) {
  const curl = 1 - value / 100;
  return (
    <div className="stage">
      <div className="ribbon-card" aria-hidden="true">
        <span className="ribbon-letter" style={{ transform: `rotate(${curl * 28}deg) scaleX(${1 - curl * 0.18})` }}>
          S
        </span>
      </div>
      <DragMeter label="Smooth the ribbon" value={value} disabled={locked} onChange={onChange} />
      {locked && (
        <button className="go" type="button" onClick={onAdvance}>
          Let it in
        </button>
      )}
    </div>
  );
}

export function Petals(): ReactNode {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <i key={index} style={{ left: `${(index * 11) % 100}%`, animationDelay: `${index * 0.4}s` }} />
      ))}
    </div>
  );
}
