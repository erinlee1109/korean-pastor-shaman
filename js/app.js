// ─────────────────────────────────────────────────────────────
// Tiny screen router. Each screen module exports:
//   export default { id, mount(root, ctx) → cleanup() }
// ctx = { state, go(id, patch), t(entry), config, lang, dev }
// Flow: intro → services → camera|touch → ritual → result → intro
// Sensor screens and ritual advance on their own; no "next" buttons.
// ─────────────────────────────────────────────────────────────
import { CONFIG } from './config.js';
import { t, getLang } from './lib/i18n.js';
import intro from './screens/intro.js';
import services from './screens/services.js';
import camera from './screens/camera.js';
import touch from './screens/touch.js';
import ritual from './screens/ritual.js';
import result from './screens/result.js';

const SCREENS = Object.fromEntries([intro, services, camera, touch, ritual, result].map((s) => [s.id, s]));

const params = new URLSearchParams(location.search);
document.body.dataset.theme = params.get('theme') || CONFIG.theme;
document.documentElement.lang = getLang();

const root = document.getElementById('app');
const fresh = () => ({ serviceId: null, flow: null, signals: null, diagnosis: null });
const state = fresh();
let cleanup = null, idleTimer = 0;

function go(id, patch = {}) {
  Object.assign(state, patch);
  try { cleanup?.(); } catch (e) { console.error(e); }
  root.innerHTML = '';
  root.dataset.screen = id;
  window.scrollTo(0, 0);
  cleanup = SCREENS[id].mount(root, ctx) || null;
  history.replaceState(null, '', `${location.search}#${id}`);
  poke(); // every screen starts its own idle countdown
}

// gallery mode: return to start after inactivity. Sensor screens count as
// active while someone is actually there (face in frame / hand pressing):
// they call ctx.poke(). Only the short, self-advancing ritual is exempt.
const poke = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (root.dataset.screen === 'ritual') return poke();
    if (root.dataset.screen !== 'intro') go('intro', fresh());
  }, CONFIG.idleResetSeconds * 1000);
};
['pointerdown', 'keydown', 'mousemove'].forEach((e) => addEventListener(e, poke));

const ctx = { state, go, t, poke, config: CONFIG, lang: getLang(), dev: params.has('dev') };
poke();

// dev: start on any screen with #services, #camera, #result …
// (also follows manual hash edits, e.g. typing #result into the address bar)
const FLOWS = { camera: { flow: 'camera', serviceId: 'basic' }, touch: { flow: 'touch', serviceId: 'premium' } };
const goToHash = () => {
  const id = location.hash.slice(1);
  if (id === root.dataset.screen) return;
  go(SCREENS[id] ? id : 'intro', FLOWS[id] || {});
};
addEventListener('hashchange', goToHash);
goToHash();
