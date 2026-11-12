import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

export function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  return (
    <main className="home">
      <p className="eyebrow">On a call</p>
      <h1>A sentence is waiting.</h1>
      <p className="lede">
        Open this on the laptop. Send them the play link. Read the card out loud while they tap.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const code = randomCode();
          const trimmed = name.trim().replace(/[/#?]/g, '');
          navigate(trimmed ? `/watch/${code}/${trimmed}` : `/watch/${code}`);
        }}
      >
        <label>
          Their name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Optional"
            autoComplete="off"
            maxLength={24}
          />
        </label>
        <button className="go" type="submit">
          Start a call
        </button>
      </form>
    </main>
  );
}

export function screenPaths(code: string, name: string): { play: string; watch: string } {
  const origin = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const namePart = name.trim() ? `/${encodeURIComponent(name.trim())}` : '';
  return {
    play: `${origin}#/play/${code}${namePart}`,
    watch: `${origin}#/watch/${code}${namePart}`,
  };
}
