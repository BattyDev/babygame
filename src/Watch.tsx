import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { Phase } from './game';
import { screenPaths } from './Home';
import { phaseClass, watchScript } from './lines';
import { Finale, Sentence } from './Sentence';
import { useWatchSync } from './sync';

const BEATS: Array<{ phase: Phase; label: string }> = [
  { phase: 'intro', label: 'Opening' },
  { phase: 'stars', label: 'The sky' },
  { phase: 'blocks', label: 'The blocks' },
  { phase: 'cups', label: 'The cups' },
  { phase: 'touch', label: 'Last touch' },
  { phase: 'reveal', label: 'The sentence' },
];

export function Watch() {
  const { code = '', name = '' } = useParams();
  const guestName = decodeName(name);
  const { state, live, replay } = useWatchSync(code, guestName);
  const script = watchScript({ ...state, guestName: state.guestName || guestName });
  const playUrl = screenPaths(code, guestName).play;
  const [copied, setCopied] = useState(false);
  const beat = BEATS.findIndex((item) => item.phase === state.phase);

  return (
    <main className={`watch ${phaseClass(state.phase)}`}>
      {state.phase === 'reveal' && <Finale />}
      <section className="watch-story">
        {state.phase === 'intro' && (
          <p className="lede watch-lede">This is your script. It follows their phone and tells you what to read.</p>
        )}
        <ol className="beats" aria-label="Where they are">
          {BEATS.map((item, index) => (
            <li
              key={item.phase}
              className={index === beat ? 'on' : index < beat ? 'done' : undefined}
              aria-current={index === beat ? 'step' : undefined}
            >
              {item.label}
            </li>
          ))}
        </ol>
        <article className="say">
          <small>{script.kicker}</small>
          <p>{script.say}</p>
        </article>
        <p className="doing">{live ? script.doing : 'They have not opened the link yet.'}</p>
        <div className="so-far">
          <small>The sentence so far</small>
          <Sentence state={state} />
        </div>
      </section>
      <aside className="watch-side">
        <p className="side-label">{live ? 'Their link' : 'Send this to their phone'}</p>
        <p className={live ? 'link-dot on' : 'link-dot'}>{live ? 'Live with their phone' : 'Waiting for them'}</p>
        <QRCodeSVG value={playUrl} size={168} bgColor="#fffaf2" fgColor="#241c16" />
        <p className="url">{playUrl}</p>
        <button
          className="go"
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(playUrl).then(
              () => setCopied(true),
              () => setCopied(false),
            );
          }}
        >
          {copied ? 'Copied' : 'Copy play link'}
        </button>
        <button className="ghost" type="button" onClick={replay}>
          Start this link over
        </button>
        <Link to="/">New call</Link>
      </aside>
    </main>
  );
}

function decodeName(name: string): string {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
