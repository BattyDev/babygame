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
      <p className="eyebrow">A little story</p>
      <h1>A sentence is waiting.</h1>
      <p className="lede">Someone started it and got shy. Help finish it.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const code = randomCode();
          const trimmed = name.trim().replace(/[/#?]/g, '');
          navigate(trimmed ? `/play/${code}/${trimmed}` : `/play/${code}`);
        }}
      >
        <label>
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Optional"
            autoComplete="off"
            maxLength={24}
          />
        </label>
        <button className="go" type="submit">
          Begin
        </button>
      </form>
    </main>
  );
}
