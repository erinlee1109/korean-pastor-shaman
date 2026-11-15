// ─────────────────────────────────────────────────────────────
// Camera ritual (basic tier). Starts the camera on mount, waits for a face to
// stay inside the light for CONFIG.camera.holdSeconds, then stops the camera
// and goes to 'ritual' on its own. No photo is taken (see sense/face.js).
// ?dev → press Enter to finish instantly.
// ─────────────────────────────────────────────────────────────
import { COPY } from '../data/copy.js?v=ecee5c41b3';
import { PART_BY_ID } from '../data/bodyparts.js?v=ecee5c41b3';
import { createFaceSensor, isCentered, blendCues, landmarksToKnots, geometrySeed } from '../sense/face.js?v=ecee5c41b3';
import { rays, progressBar, setProgress } from '../render/motifs.js?v=ecee5c41b3';

export default {
  id: 'camera',
  mount(root, { t, go, poke, config, dev }) {
    const C = config.camera;
    root.innerHTML = `
      <section class="screen screen-camera">
        <h1 class="display display-sm">${t(COPY.camera.title)}</h1>
        <div class="cam-stage" data-state="loading">
          ${rays({ size: 900, n: 24, inner: 0.62, width: 3, cls: 'cam-rays' })}
          <video playsinline muted></video>
          <canvas class="cam-mesh"></canvas>
          <div class="cam-oval"></div>
        </div>
        ${progressBar()}
        <p class="lead cam-msg" aria-live="polite">${t(COPY.camera.loading)}</p>
        <div class="cam-actions">
          <button class="btn" data-retry hidden>${t(COPY.camera.retry)}</button>
          <button class="btn btn-quiet" data-back>${t(COPY.camera.back)}</button>
        </div>
        <p class="fineprint">${t(COPY.camera.privacy)}</p>
      </section>`;

    const $ = (s) => root.querySelector(s);
    const stage = $('.cam-stage'), video = $('video'), mesh = $('.cam-mesh'), msg = $('.cam-msg'), bar = $('.obang-progress');
    const ctx2d = mesh.getContext('2d');
    let face = null, cancelled = false, finished = false, msgKey = 'loading';
    let progress = 0, lastSeen = -1e9, last = performance.now(), lastFrame = null, lastPoke = 0;
    const avgBlend = {};
    const timers = [];

    const say = (key) => { if (key !== msgKey) { msgKey = key; msg.innerHTML = t(COPY.camera[key]); } };

    // Match the stage to the camera's real aspect ratio so the mesh lines up.
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth) stage.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    });

    function finish() {
      if (finished) return;
      finished = true;
      const part = PART_BY_ID['head-front'];
      const lm = lastFrame?.landmarks;
      const signals = {
        seed: lm ? geometrySeed(lm) : (Math.random() * 1e9) | 0,
        cues: blendCues(avgBlend, config.faceCues),
        faceKnots: lm ? landmarksToKnots(lm, part) : [],
      };
      setProgress(bar, 1);
      stage.dataset.state = 'done';
      say('done');
      face?.stop();
      timers.push(setTimeout(() => go('ritual', { signals }), C.doneHoldMs));
    }

    function onFrame(f) {
      if (finished) return;
      lastFrame = f.present ? f : lastFrame;
      const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
      const ok = f.present && isCentered(f.box, C.ovalTolerance);
      if (ok) lastSeen = now;
      // someone is standing here → keep the gallery idle-reset away (throttled)
      if (f.present && now - lastPoke > 1000) { lastPoke = now; poke(); }
      const holding = now - lastSeen < C.graceMs;
      progress = Math.max(0, Math.min(1, progress + (holding ? dt : -dt * 1.5) / C.holdSeconds));
      setProgress(bar, progress);
      stage.dataset.state = holding ? 'seen' : 'searching';
      say(holding ? 'hold' : progress > 0.05 ? 'lost' : 'align');
      for (const [k, v] of Object.entries(f.blendshapes)) avgBlend[k] = (avgBlend[k] ?? v) * 0.95 + v * 0.05;

      // "scan": landmark dots only — derived numbers, never pixels
      mesh.width = mesh.clientWidth; mesh.height = mesh.clientHeight;
      ctx2d.clearRect(0, 0, mesh.width, mesh.height);
      if (C.showMesh && f.landmarks) {
        ctx2d.fillStyle = holding ? '#F2B705' : '#FFFFFF';
        f.landmarks.forEach((p, i) => { if (i % 2 === 0) ctx2d.fillRect(p.x * mesh.width - 1, p.y * mesh.height - 1, 2, 2); });
      }
      if (progress >= 1) finish();
    }

    async function start() {
      $('[data-retry]').hidden = true;
      stage.dataset.state = 'loading';
      say('loading');
      try {
        face = await createFaceSensor(video, C);
      } catch (e) {
        console.warn('[camera]', e);
        if (cancelled) return;
        stage.dataset.state = 'denied';
        const why = e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'permission'
          : e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError' ? 'nocamera' : 'offline';
        msg.innerHTML = `${t(COPY.camera.denied)}${t(COPY.camera[why])}`;
        msgKey = 'denied';
        $('[data-retry]').hidden = false;
        return;
      }
      if (cancelled) { face.stop(); return; }
      say('align');
      stage.dataset.state = 'searching';
      face.onFrame(onFrame);
    }

    $('[data-retry]').onclick = start;
    $('[data-back]').onclick = () => go('services');
    const onKey = (e) => { if (dev && e.key === 'Enter') finish(); };
    addEventListener('keydown', onKey);
    start();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      removeEventListener('keydown', onKey);
      face?.stop();
    };
  },
};
