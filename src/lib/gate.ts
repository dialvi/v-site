import { GATE_PHRASE } from '@/content/gate';

const KEY = 'valeria.gate.v1';

function normalize(value: string) {
  return value.normalize('NFKC').trim().toLowerCase();
}

export function isUnlocked() {
  try {
    return sessionStorage.getItem(KEY) === 'ok' || localStorage.getItem(KEY) === 'ok';
  } catch {
    return false;
  }
}

export function rememberUnlock() {
  try {
    localStorage.setItem(KEY, 'ok');
    sessionStorage.setItem(KEY, 'ok');
  } catch {
    /* private mode */
  }
}

export function phraseMatches(input: string) {
  return normalize(input) === normalize(GATE_PHRASE);
}
