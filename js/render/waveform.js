// ─────────────────────────────────────────────────────────────
// "Spirit frequency" waveform — a scrolling trace whose amplitude is the
// visitor's pressure. Reads colours from CSS vars on the canvas element.
//
//   const w = createWaveform(canvas, () => pressure.value, CONFIG.touch.waveform);
//   w.stop();
// ─────────────────────────────────────────────────────────────

export function createWaveform(canvas, getValue, opts = {}) {
  const { points = 240, speed = 1.4, maxAmp = 0.42 } = opts;
  const ctx = canvas.getContext('2d');
  const hist = new Float32Array(points);
  let raf = 0, t = 0, last = performance.now();

  const resize = () => {
    const dpr = devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  const frame = (now = performance.now()) => {
    t += Math.min(0.1, (now - last) / 1000) * speed; last = now;
    hist.copyWithin(0, 1);
    hist[points - 1] = getValue();
    const cs = getComputedStyle(canvas);
    const main = cs.getPropertyValue('--wave-ink').trim() || cs.getPropertyValue('--accent').trim() || '#c00';
    const ghost = cs.getPropertyValue('--wave-ghost').trim() || cs.getPropertyValue('--gold').trim() || '#aa8';
    const W = canvas.width, H = canvas.height, mid = H / 2;
    ctx.clearRect(0, 0, W, H);

    // baseline
    ctx.globalAlpha = 0.25; ctx.strokeStyle = main; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

    const trace = (color, phase, freqA, freqB, alpha, width) => {
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width * (devicePixelRatio || 1);
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const v = hist[i];
        const x = (i / (points - 1)) * W;
        const tremor = v > 0.6 ? (Math.random() - 0.5) * (v - 0.6) * 0.5 : 0;
        const s = Math.sin(i * freqA + t * 6 + phase) * 0.65 + Math.sin(i * freqB - t * 3 + phase) * 0.35 + tremor;
        const y = mid - s * v * maxAmp * H;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    trace(ghost, 1.7, 0.19, 0.07, 0.45, 1);
    trace(main, 0, 0.27, 0.11, 1, 2);
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { stop() { cancelAnimationFrame(raf); ro.disconnect(); } };
}
