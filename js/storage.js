const KEY = 'arabic-reader:progress-v1';
const DEFAULT = {
  short: { learned: [], correct: 0, attempts: 0 },
  long: { learned: [], correct: 0, attempts: 0 },
  positions: { learned: [] },
  blend: { attempts: 0, success: 0 },
  spell: { attempts: 0, success: 0 }
};

export function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return typeof structuredClone === 'function' ? merge(structuredClone(DEFAULT), stored) : merge(JSON.parse(JSON.stringify(DEFAULT)), stored);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT));
  }
}

function merge(base, extra) {
  const out = JSON.parse(JSON.stringify(base));
  Object.entries(extra || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = { ...out[k], ...v };
    else out[k] = v;
  });
  return out;
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function resetProgress() {
  localStorage.removeItem(KEY);
  return JSON.parse(JSON.stringify(DEFAULT));
}
