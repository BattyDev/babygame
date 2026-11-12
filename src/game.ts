export type Phase = 'intro' | 'vine' | 'block' | 'fireflies' | 'hold' | 'ribbon' | 'reveal';

export interface GameState {
  code: string;
  guestName: string;
  phase: Phase;
  vine: number;
  vineLocked: boolean;
  blockPlaced: boolean;
  fireflies: number;
  ribbon: number;
  ribbonLocked: boolean;
  /** Bumped when the watch screen starts the story over. */
  revision: number;
  updatedAt: number;
}

const storageKey = (code: string) => `sentence-${code}`;

export function freshState(code: string, guestName: string, revision = 0): GameState {
  return {
    code,
    guestName,
    phase: 'intro',
    vine: 0,
    vineLocked: false,
    blockPlaced: false,
    fireflies: 0,
    ribbon: 0,
    ribbonLocked: false,
    revision,
    updatedAt: Date.now(),
  };
}

export function loadState(code: string, guestName: string): GameState {
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) return freshState(code, guestName);
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || parsed.code !== code || !parsed.phase) return freshState(code, guestName);
    return {
      ...freshState(code, guestName),
      ...parsed,
      guestName: guestName || parsed.guestName || '',
      revision: typeof parsed.revision === 'number' ? parsed.revision : 0,
    };
  } catch {
    return freshState(code, guestName);
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(storageKey(state.code), JSON.stringify(state));
}

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<GameState>;
  return typeof v.code === 'string' && typeof v.phase === 'string' && typeof v.updatedAt === 'number';
}
