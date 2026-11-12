import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { screenPaths } from './Home';
import { phaseClass, watchScript } from './lines';
import { Stage } from './puzzles';
import { Finale, Sentence } from './Sentence';
import { useWatchSync } from './sync';

export function Watch() {
  const { code = '', name = '' } = useParams();
  const guestName = decodeName(name);
  const { state, live, replay } = useWatchSync(code, guestName);
  const script = watchScript({ ...state, guestName: state.guestName || guestName });
  const playUrl = screenPaths(code, guestName).play;
  const [copied, setCopied] = useState(false);

  return (
    <main className={`watch ${phaseClass(state.phase)}`}>
      {state.phase === 'reveal' && <Finale />}
      <section className="watch-story">
        <Sentence state={state} large />
        {state.phase !== 'reveal' && state.phase !== 'intro' && (
          <Stage
            state={state}
            readonly
            onPatch={() => {}}
            onAdvance={() => {}}
            onTurn={() => {}}
          />
        )}
        <article className="say">
          <small>{script.kicker}</small>
          <p>{script.say}</p>
          <span>{live ? script.doing : 'Send the link. This screen follows their phone.'}</span>
        </article>
      </section>
      <aside className="watch-side">
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
