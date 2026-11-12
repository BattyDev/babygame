import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { screenPaths } from './Home';
import { phaseClass, watchScript } from './lines';
import { Petals } from './puzzles';
import { Sentence } from './Sentence';
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
      {state.phase === 'reveal' && <Petals />}
      <section className="watch-story">
        <Sentence state={state} large />
        <article className="say">
          <small>{script.kicker}</small>
          <p>{script.say}</p>
          <span>{live ? script.doing : 'Send the link. This screen follows their phone.'}</span>
        </article>
        {state.phase === 'reveal' && (
          <p className="caveat">
            A blood test called NIPT says girl. It is right almost all the time. We will know for
            certain when we meet her.
          </p>
        )}
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
