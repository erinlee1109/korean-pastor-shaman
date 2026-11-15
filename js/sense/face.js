// ─────────────────────────────────────────────────────────────
// Face presence + landmarks via MediaPipe FaceLandmarker (runs locally
// in the browser; frames never leave the device and are never stored).
//
// PRIVACY CONTRACT — keep it true if you edit this file:
//   • no canvas.drawImage(video), no toDataURL/toBlob, no MediaRecorder
//   • only derived numbers leave this module (box, a few points, blendshapes)
//   • stop() ends every camera track
//
// Usage:
//   const face = await createFaceSensor(videoEl, CONFIG.camera);
//   face.onFrame(({present, box, landmarks, blendshapes}) => …);
//   face.stop();
// ─────────────────────────────────────────────────────────────
import { hashString } from '../lib/rng.js';

// The model is loaded once and reused for every visitor (loading takes seconds).
let _landmarker = null;
export function preloadFaceModel(cfg) {
  _landmarker ??= (async () => {
    const vision = await import(/* @vite-ignore */ cfg.moduleUrl);
    const fileset = await vision.FilesetResolver.forVisionTasks(cfg.wasmBase);
    const landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: cfg.modelUrl, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
    });
    return { vision, landmarker };
  })().catch((e) => { _landmarker = null; throw e; });
  return _landmarker;
}

export async function createFaceSensor(video, cfg) {
  const modelReady = preloadFaceModel(cfg);
  modelReady.catch(() => {}); // handled below; avoids an 'unhandled rejection' while the camera opens
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
    audio: false,
  });
  let vision, landmarker;
  try {
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    ({ vision, landmarker } = await modelReady);
  } catch (e) {
    stream.getTracks().forEach((t) => t.stop()); // never leave the camera on after a failure
    video.srcObject = null;
    throw e;
  }

  const listeners = new Set();
  let raf = 0, lastTime = -1, stopped = false;
  const loop = () => {
    if (stopped) return;
    if (video.readyState >= 2 && video.currentTime !== lastTime) {
      lastTime = video.currentTime;
      const res = landmarker.detectForVideo(video, performance.now());
      const landmarks = res.faceLandmarks?.[0] || null;
      const blend = res.faceBlendshapes?.[0]?.categories || [];
      const frame = {
        present: !!landmarks,
        landmarks,
        box: landmarks ? faceBox(landmarks) : null,
        blendshapes: Object.fromEntries(blend.map((c) => [c.categoryName, c.score])),
      };
      listeners.forEach((fn) => fn(frame));
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    connectors: vision.FaceLandmarker, // FACE_LANDMARKS_TESSELATION, _FACE_OVAL, … for drawing
    onFrame(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
      // landmarker stays loaded for the next visitor (it holds no images)
    },
  };
}

/** Normalised bounding box (0..1, un-mirrored) of the landmarks. */
export function faceBox(lm) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const p of lm) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/** Is the face roughly centred and big enough to "be seen"? */
export function isCentered(box, tol = 0.18, minSize = 0.22) {
  return !!box && Math.abs(box.cx - 0.5) < tol && Math.abs(box.cy - 0.5) < tol * 1.2 && box.h > minSize;
}

/** Blendshape scores → cue words (see CONFIG.faceCues). Pass an averaged map for stability. */
export function blendCues(blend, cueCfg) {
  return Object.entries(cueCfg)
    .filter(([, c]) => c.from.reduce((s, k) => s + (blend[k] || 0), 0) / c.from.length > c.over)
    .map(([name]) => name);
}

// Landmark indices (MediaPipe 468 mesh) worth "finding spirits" at.
export const SPIRIT_LANDMARKS = {
  browL: 105, browR: 334, between: 9, noseTip: 1, lipTop: 13, chin: 152, cheekL: 50, cheekR: 280, forehead: 10,
};

/** Map chosen landmarks onto the illustrated head (part.faceBox) → [[x,y]] knots. */
export function landmarksToKnots(lm, part, names = ['browL', 'browR', 'lipTop']) {
  const b = faceBox(lm), fb = part.faceBox;
  return names.map((n) => {
    const p = lm[SPIRIT_LANDMARKS[n]];
    const u = 1 - (p.x - b.x) / b.w; // mirror so it matches the mirrored preview
    const v = (p.y - b.y) / b.h;
    return [fb.x + u * fb.w, fb.y + v * fb.h];
  });
}

/** A seed from face *proportions* (quantised ratios) — stable-ish per person, not an image. */
export function geometrySeed(lm) {
  const d = (a, b) => Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y);
  const h = d(10, 152) || 1;
  const ratios = [d(33, 263), d(61, 291), d(1, 152), d(105, 334)].map((r) => Math.round((r / h) * 40));
  return hashString(ratios.join('-'));
}
