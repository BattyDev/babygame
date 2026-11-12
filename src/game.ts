export type Phase = 'intro' | 'stars' | 'blocks' | 'cups' | 'touch' | 'reveal';

export type CupBeat = 'ready' | 'show' | 'shuffle' | 'guess' | 'found';

export type Spin = 'left' | 'right' | 'up' | 'down' | null;

export interface Cube {
  front: string;
  right: string;
  back: string;
  left: string;
  top: string;
  bottom: string;
  spin: Spin;
}

export interface GameState {
  code: string;
  guestName: string;
  phase: Phase;
  lensX: number;
  lensY: number;
  dateLocked: boolean;
  cubes: Cube[];
  blocksDone: boolean;
  cupBeat: CupBeat;
  order: [number, number, number];
  ball: number;
  swaps: number[];
  swapAt: number;
  miss: number | null;
  revision: number;
  updatedAt: number;
}

const PHASES = new Set<Phase>(['intro', 'stars', 'blocks', 'cups', 'touch', 'reveal']);

export function makeCube(
  front: string,
  right: string,
  back: string,
  left: string,
  top: string,
  bottom: string,
): Cube {
  return { front, right, back, left, top, bottom, spin: null };
}

export function startingCubes(): Cube[] {
  return [
    makeCube('★', '☾', 'H', '✦', '◆', '●'),
    makeCube('☾', '✦', '◆', 'H', '●', '★'),
    makeCube('◆', '●', '✦', '☾', '★', 'H'),
  ];
}

export function turnCube(cube: Cube, dir: Exclude<Spin, null>): Cube {
  if (dir === 'left') {
    return { ...cube, front: cube.right, right: cube.back, back: cube.left, left: cube.front, spin: dir };
  }
  if (dir === 'right') {
    return { ...cube, front: cube.left, left: cube.back, back: cube.right, right: cube.front, spin: dir };
  }
  if (dir === 'up') {
    return { ...cube, front: cube.bottom, bottom: cube.back, back: cube.top, top: cube.front, spin: dir };
  }
  return { ...cube, front: cube.top, top: cube.back, back: cube.bottom, bottom: cube.front, spin: dir };
}

export function applySwap(order: [number, number, number], slot: number): [number, number, number] {
  const next: [number, number, number] = [...order];
  const partner = slot + 1;
  [next[slot], next[partner]] = [next[partner], next[slot]];
  return next;
}

const storageKey = (code: string) => `sentence-${code}`;

export function freshState(code: string, guestName: string, revision = 0): GameState {
  return {
    code,
    guestName,
    phase: 'intro',
    lensX: 18,
    lensY: 78,
    dateLocked: false,
    cubes: startingCubes(),
    blocksDone: false,
    cupBeat: 'ready',
    order: [0, 1, 2],
    ball: 1,
    swaps: [],
    swapAt: 0,
    miss: null,
    revision,
    updatedAt: Date.now(),
  };
}

export function loadState(code: string, guestName: string): GameState {
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) return freshState(code, guestName);
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || parsed.code !== code || !parsed.phase || !PHASES.has(parsed.phase)) {
      return freshState(code, guestName);
    }
    const base = freshState(code, guestName);
    return {
      ...base,
      ...parsed,
      cubes: Array.isArray(parsed.cubes) && parsed.cubes.length === 3 ? parsed.cubes : base.cubes,
      order: Array.isArray(parsed.order) && parsed.order.length === 3 ? parsed.order : base.order,
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
  return (
    typeof v.code === 'string' &&
    typeof v.phase === 'string' &&
    PHASES.has(v.phase) &&
    typeof v.updatedAt === 'number' &&
    Array.isArray(v.cubes)
  );
}
