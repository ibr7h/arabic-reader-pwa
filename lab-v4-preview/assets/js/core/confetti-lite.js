const palette = ['#f43f5e','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ec4899'];

export function confetti(options = {}) {
  if (typeof document === 'undefined') return;
  const requested = Number(options.particleCount || 40);
  const count = Math.max(8, Math.min(requested, 90));
  const originX = Math.max(0, Math.min(1, options.origin?.x ?? 0.5));
  const originY = Math.max(0, Math.min(1, options.origin?.y ?? 0.65));
  const spread = Math.max(20, Math.min(Number(options.spread || 70), 140));
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'confetti-lite-particle';
    el.style.left = `${originX * innerWidth}px`;
    el.style.top = `${originY * innerHeight}px`;
    el.style.background = palette[i % palette.length];
    const angle = ((Math.random() - 0.5) * spread) * Math.PI / 180;
    const distance = 120 + Math.random() * 240;
    const dx = Math.sin(angle) * distance;
    const dy = 180 + Math.cos(angle) * distance + Math.random() * 220;
    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--rot', `${360 + Math.random() * 900}deg`);
    el.style.setProperty('--fall-ms', `${900 + Math.random() * 900}ms`);
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}
