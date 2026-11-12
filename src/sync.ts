import { useCallback, useEffect, useRef, useState } from 'react';
import { freshState, isGameState, type GameState } from './game';

type Envelope =
  | { kind: 'state'; state: GameState }
  | { kind: 'hello'; revision: number }
  | { kind: 'reset'; revision: number };

function topic(code: string): string {
  return `bgstory-${code.toLowerCase()}`;
}

function isEnvelope(value: unknown): value is Envelope {
  if (!value || typeof value !== 'object' || !('kind' in value)) return false;
  const kind = (value as { kind: unknown }).kind;
  return kind === 'state' || kind === 'hello' || kind === 'reset';
}

function publish(code: string, envelope: Envelope): void {
  try {
    const bus = new BroadcastChannel(topic(code));
    bus.postMessage(envelope);
    bus.close();
  } catch {
    // BroadcastChannel is same-browser only. The network publish still runs.
  }
  void fetch(`https://ntfy.sh/${topic(code)}`, {
    method: 'POST',
    body: JSON.stringify(envelope),
  }).catch(() => {});
}

function subscribe(code: string, onEnvelope: (envelope: Envelope) => void): () => void {
  let closed = false;
  const accept = (value: unknown) => {
    if (closed || !isEnvelope(value)) return;
    if (value.kind === 'state' && !isGameState(value.state)) return;
    onEnvelope(value);
  };

  let bus: BroadcastChannel | null = null;
  try {
    bus = new BroadcastChannel(topic(code));
    bus.onmessage = (event) => accept(event.data);
  } catch {
    bus = null;
  }

  const source = new EventSource(`https://ntfy.sh/${topic(code)}/sse`);
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as { event?: string; message?: string };
      if (data.event !== 'message' || !data.message) return;
      accept(JSON.parse(data.message));
    } catch {
      // Ignore keepalives and anything that is not our envelope.
    }
  };

  return () => {
    closed = true;
    bus?.close();
    source.close();
  };
}

export function usePlaySync(
  code: string,
  getState: () => GameState,
  onReset: (revision: number) => void,
): { linked: boolean; publish: (state: GameState) => void } {
  const getStateRef = useRef(getState);
  const onResetRef = useRef(onReset);
  getStateRef.current = getState;
  onResetRef.current = onReset;
  const [linked, setLinked] = useState(false);
  const linkedTimer = useRef(0);

  useEffect(() => {
    return subscribe(code, (envelope) => {
      if (envelope.kind === 'state') return;
      const revision = envelope.revision;
      if (revision > getStateRef.current().revision) onResetRef.current(revision);
      if (envelope.kind === 'hello') {
        publish(code, { kind: 'state', state: getStateRef.current() });
        setLinked(true);
        window.clearTimeout(linkedTimer.current);
        linkedTimer.current = window.setTimeout(() => setLinked(false), 12000);
      }
    });
  }, [code]);

  const send = useCallback((state: GameState) => {
    publish(code, { kind: 'state', state });
  }, [code]);

  return { linked, publish: send };
}

export function useWatchSync(code: string, guestName: string): {
  state: GameState;
  live: boolean;
  replay: () => void;
} {
  const [state, setState] = useState(() => ({ ...freshState(code, guestName), updatedAt: 0 }));
  const [live, setLive] = useState(false);
  const revisionRef = useRef(0);

  useEffect(() => {
    const stop = subscribe(code, (envelope) => {
      if (envelope.kind !== 'state') return;
      const revision = typeof envelope.state.revision === 'number' ? envelope.state.revision : 0;
      if (revision < revisionRef.current) return;
      setState((current) =>
        envelope.state.updatedAt > current.updatedAt ? { ...envelope.state, revision } : current,
      );
      setLive(true);
    });

    const hello = () => publish(code, { kind: 'hello', revision: revisionRef.current });
    hello();
    const beat = window.setInterval(hello, 4000);
    return () => {
      window.clearInterval(beat);
      stop();
    };
  }, [code]);

  const replay = () => {
    const revision = revisionRef.current + 1;
    revisionRef.current = revision;
    setState(freshState(code, guestName, revision));
    setLive(false);
    publish(code, { kind: 'reset', revision });
  };

  return { state, live, replay };
}
