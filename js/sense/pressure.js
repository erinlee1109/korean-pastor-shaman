// ─────────────────────────────────────────────────────────────
// Pressure input with graceful fallbacks.
//
//   'force'   Safari on a Force Touch trackpad (all modern MacBooks).
//             webkitForce: ~1.0 at click → 2.0 at force-click → up to 3.0.
//             ONLY Safari exposes this. Chrome/Firefox report a flat 0.5.
//   'pointer' Real PointerEvent.pressure (iPad + pencil, some tablets).
//   'hold'    Fallback: pressure is *performed* — rises the longer you hold,
//             breathes, and jitters with tiny finger movements. Visitors
//             can't tell the difference, which is rather the point.
//
// Keyboard: hold SPACE anywhere to simulate pressing (for testing).
//
// Usage:
//   const p = createPressureSource(el, CONFIG.touch);
//   p.value     → 0..1 smoothed     p.touching → bool     p.kind → string
//   p.stats()   → {mean, peak, steadiness, duration, elapsed, seed}
//                 duration = seconds actually pressed; elapsed = first press → now
//   p.destroy()
// ─────────────────────────────────────────────────────────────
import { clamp, hashString } from '../lib/rng.js?v=ecee5c41b3';

export function detectPressureKind() {
  if (typeof MouseEvent !== 'undefined' && 'WEBKIT_FORCE_AT_MOUSE_DOWN' in MouseEvent) return 'force';
  return 'pointer?'; // decided on first pointerdown (real pressure or not)
}

export function createPressureSource(el, cfg = {}) {
  const [f0, f1] = cfg.forceRange || [1, 3];
  const minP = cfg.minPressure ?? 0.08;
  // presses that start on these (e.g. a "back" button) are left alone
  const skip = (e) => !!(cfg.ignore && e.target?.closest?.(cfg.ignore));
  // cfg.mode 'hold' → always the simulated hold (phones: a resting finger has no usable pressure)
  let kind = cfg.mode === 'hold' ? 'hold' : detectPressureKind();
  let raw = 0, value = 0, touching = false, downAt = 0, lastMove = 0, moveEnergy = 0, keySim = false;
  let firstDownAt = 0, pressedMs = 0, lastTick = performance.now(), touchHold = false;
  const samples = [];
  let raf = 0;
  const off = [];
  const on = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); off.push(() => t.removeEventListener(type, fn, opt)); };

  const press = () => { touching = true; downAt = performance.now(); firstDownAt ||= downAt; };
  const release = () => { touching = false; raw = 0; };

  if (kind === 'force') {
    // Stop the system "Look Up" popover / force-click default action.
    on(el, 'webkitmouseforcewillbegin', (e) => e.preventDefault());
    on(el, 'mousedown', (e) => { if (skip(e)) return; e.preventDefault(); press(); raw = 0.1; });
    on(el, 'webkitmouseforcechanged', (e) => { raw = clamp(0.1 + (e.webkitForce - f0) / (f1 - f0) * 0.9); });
    on(window, 'mouseup', release);
  } else {
    on(el, 'pointerdown', (e) => {
      if (skip(e)) return;
      try { el.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone: release still comes via window */ }
      press();
      // Fingers report a flat or meaningless pressure and send no events while
      // resting, so touch is always the simulated hold. Pens/mice: 0 or 0.5
      // means no real sensor.
      if (cfg.mode === 'hold' || e.pointerType === 'touch') kind = 'hold';
      else kind = e.pressure > 0 && e.pressure !== 0.5 ? 'pointer' : 'hold';
      if (kind === 'pointer') raw = e.pressure;
    });
    // long-press on a phone: no context menu / callout
    on(el, 'contextmenu', (e) => e.preventDefault());
    on(el, 'pointermove', (e) => {
      if (!touching) return;
      if (kind === 'pointer') raw = e.pressure;
      const now = performance.now();
      moveEnergy = Math.min(1, moveEnergy + Math.hypot(e.movementX || 0, e.movementY || 0) * 0.02);
      lastMove = now;
    });
    on(window, 'pointerup', release);
    // a cancelled pointer while the finger is still down (iOS) is not a lift
    on(window, 'pointercancel', () => { if (!touchHold) release(); });
  }
  // Fingers, any mode (iPhone Safari above all): claim the touch so the
  // browser's long-press gestures (text selection, magnifier, link preview,
  // scroll) can't start and cancel the press. Pointer events still fire.
  on(el, 'touchstart', (e) => {
    if (skip(e)) return;
    e.preventDefault();
    touchHold = true;
    if (!touching) press();
  }, { passive: false });
  const touchEnd = (e) => { if (touchHold && !e.touches.length) { touchHold = false; release(); } };
  on(window, 'touchend', touchEnd);
  on(window, 'touchcancel', touchEnd);

  // keyboard simulation
  on(window, 'keydown', (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); keySim = true; press(); } });
  on(window, 'keyup', (e) => { if (e.code === 'Space') { keySim = false; release(); } });

  const tick = (now) => {
    const dt = Math.min(100, now - lastTick); lastTick = now;
    const k = dt / (1000 / 60); // 1 at 60 Hz, 0.5 at 120 Hz: same feel on any display
    if (touching && (keySim || touchHold || kind === 'hold' || kind === 'pointer?')) {
      const held = (now - downAt) / 1000;
      const ramp = 1 - Math.exp(-held / 2.5);              // slow rise
      const breath = 0.12 * Math.sin(now / 900) + 0.06 * Math.sin(now / 237);
      raw = clamp(0.15 + ramp * 0.55 + breath + moveEnergy * 0.4);
    }
    moveEnergy *= 0.94 ** k;
    value += (raw - value) * (1 - 0.82 ** k);
    if (touching) { samples.push(value); pressedMs += dt; }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    get value() { return value; },
    get touching() { return touching && value > minP; },
    get kind() { return kind === 'pointer?' ? 'hold' : kind; },
    get samples() { return samples; },
    reset() { samples.length = 0; pressedMs = 0; firstDownAt = 0; },
    stats() {
      const n = samples.length || 1;
      const mean = samples.reduce((a, b) => a + b, 0) / n;
      const peak = Math.max(0, ...samples);
      const sd = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
      // seed from the *shape* of the pressure trace (quantised), not from anything personal
      const q = samples.filter((_, i) => i % 10 === 0).map((v) => Math.round(v * 20)).join('');
      const elapsed = firstDownAt ? (performance.now() - firstDownAt) / 1000 : 0;
      return { mean, peak, steadiness: clamp(1 - sd * 4), duration: pressedMs / 1000, elapsed, seed: hashString(q) };
    },
    destroy() { cancelAnimationFrame(raf); off.forEach((f) => f()); },
  };
}

/** Pressure stats → cue words used by data/spirits.js `signal`. */
// 'long' = the visitor kept lifting off, so the reading took a while overall
// (pressing time alone is always ~holdSeconds, so it can't tell visitors apart).
export function pressureCues({ mean, steadiness, elapsed }, cfg = {}) {
  const cues = [];
  cues.push(mean > 0.55 ? 'heavy' : mean < 0.3 ? 'light' : 'mid');
  cues.push(steadiness > 0.7 ? 'steady' : 'shaky');
  cues.push(elapsed > (cfg.longSeconds ?? 18) ? 'long' : 'short');
  return cues;
}
