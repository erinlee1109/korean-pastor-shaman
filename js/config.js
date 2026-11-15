// ─────────────────────────────────────────────────────────────
// One place for every knob. Change here, not in screens.
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  theme: 'obang-pentecost',  // obang-pentecost | neon-cross | holy-light | photocopy | mushindo
  lang: 'en',                // 'en' | 'ko' — primary language (or ?lang=ko); the other shows small underneath
  bilingual: true,
  includeHeavy: true,        // heavy repent items (see data/repent.js)
  idleResetSeconds: 90,      // gallery mode: back to start after inactivity
  // ?dev in the URL: press Enter on camera/touch to finish instantly (for testing)

  cameraParts: ['head-front', 'head-back'],   // head views for the basic tier (+ 'head-side')
  touchPartCount: 7,                           // regions on the premium sheet, drawn from a larger pool

  camera: {
    holdSeconds: 6,          // how long a face must stay in the oval
    graceMs: 600,            // brief loss of face before progress starts draining
    showVideo: true,         // live mirror feed (never recorded)
    showMesh: true,          // draw landmark "scan" over the face
    doneHoldMs: 1600,        // pause on "you have been seen" before auto-advancing
    ovalTolerance: 0.18,
     // how centred the face must be (0..1 of frame)
    // Vendored copies for offline gallery use: put files in /vendor/mediapipe and switch these.
    wasmBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
    moduleUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
    modelUrl: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  },

  touch: {
    holdSeconds: 12,         // total pressing time needed to finish the reading
    minPressure: 0.08,       // below this counts as "not touching"
    // Safari Force Touch reports webkitForce ≈ 1 at click, ≈ 2 at force-click, up to 3.
    forceRange: [1, 3],
    forceClickHaptic: true,  // a deep press triggers the trackpad's own "click"
    doneHoldMs: 1600,        // pause on "complete" before auto-advancing
    nudgeMs: 5000,           // no press yet after this long → plainer "press anywhere" message
    longSeconds: 18,         // first press → finish longer than this = 'long' cue (kept lifting off)
    waveform: { points: 240, speed: 1.4, maxAmp: 0.42 },
  },

  // Blendshape → cue thresholds (camera). Keys match data/spirits.js `signal`.
  faceCues: {
    smile: { from: ['mouthSmileLeft', 'mouthSmileRight'], over: 0.35 },
    frown: { from: ['browDownLeft', 'browDownRight'], over: 0.3 },
    browRaise: { from: ['browInnerUp'], over: 0.35 },
    squint: { from: ['eyeSquintLeft', 'eyeSquintRight'], over: 0.35 },
    eyeWide: { from: ['eyeWideLeft', 'eyeWideRight'], over: 0.3 },
    mouthOpen: { from: ['jawOpen'], over: 0.25 },
    eyeDart: { from: ['eyeLookOutLeft', 'eyeLookOutRight', 'eyeLookInLeft', 'eyeLookInRight'], over: 0.4 },
  },

  ritual: { lineMs: 1500, lineCount: 4 },
  receipt: { workingMs: 2600, returnSeconds: 20 },  // aftercare: "receiving" beat, then auto-return to intro  // each "discerning…" line; ritual auto-advances to result

  result: {
    spiritsCount: { camera: 4, touch: 6 },     // short list; the repent list is the focus
    repentCount: { camera: 8, touch: 14 },
    noteChance: 0.7,                           // chance each figure gets a handwritten note
    // percentage shown on bowls: always low, always "needs more"
    meterRange: [0.18, 0.55],
  },
};
