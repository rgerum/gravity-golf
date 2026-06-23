// Procedural WebAudio engine for the space-golf game.
// Everything is synthesized at runtime with plain WebAudio nodes:
// no audio assets, no imports. Silent and no-op-safe until unlock()
// is called from a user gesture.
//
// Bus layout:
//   ctx.destination <- limiter <- masterGain <- { musicGain, sfxGain }
//   plus a shared ConvolverNode reverb fed by post-fader sends from
//   both buses, returning into masterGain.

// ---------------------------------------------------------------------------
// Context and bus graph
// ---------------------------------------------------------------------------

let ctx = null;
let masterGain = null;
let limiter = null;
let musicGain = null;
let sfxGain = null;

// Global trim keeping one-shot SFX subtle relative to music.
const SFX_TRIM = 0.66;
let convolver = null;
let musicFilter = null;
let musicMix = null;
let arpGain = null;
let percGain = null;
let sharedNoiseBuffer = null;

const levels = { master: 0.9, music: 0.5, sfx: 0.8 };

function unlock() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return;
    }
    ctx = new Ctor();
    setupGraph();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

function isUnlocked() {
  return !!ctx && ctx.state === 'running';
}

function setupGraph() {
  // Gentle limiter so stacked SFX never clip the output.
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.knee.value = 24;
  limiter.ratio.value = 4;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  limiter.connect(ctx.destination);

  masterGain = makeGain(levels.master, limiter);
  musicGain = makeGain(levels.music, masterGain);
  sfxGain = makeGain(levels.sfx * SFX_TRIM, masterGain);

  convolver = ctx.createConvolver();
  convolver.buffer = buildImpulseResponse(1.8, 3.5);
  convolver.connect(masterGain);

  // Post-fader reverb sends so wet level tracks the bus levels.
  makeSend(sfxGain, convolver, 0.12);
  makeSend(musicGain, convolver, 0.3);

  // Music chain: voices -> musicFilter -> musicMix -> musicGain.
  // musicFilter doubles as the 'drift' intensity control; musicMix is
  // the start/stop fade so the user music level is never touched.
  musicFilter = ctx.createBiquadFilter();
  musicFilter.type = 'lowpass';
  musicFilter.frequency.value = 2200;
  musicFilter.Q.value = 0.4;
  musicMix = makeGain(1, musicGain);
  musicFilter.connect(musicMix);

  arpGain = makeGain(0.0001, musicFilter);
  percGain = makeGain(0.0001, musicFilter);

  sharedNoiseBuffer = buildNoiseBuffer(2);
}

function setLevels(partial = {}) {
  if (partial.master !== undefined) {
    levels.master = clamp01(partial.master);
  }
  if (partial.music !== undefined) {
    levels.music = clamp01(partial.music);
  }
  if (partial.sfx !== undefined) {
    levels.sfx = clamp01(partial.sfx);
  }
  if (!ctx) {
    return;
  }
  rampParam(masterGain.gain, levels.master, 0.03);
  rampParam(musicGain.gain, levels.music, 0.03);
  rampParam(sfxGain.gain, levels.sfx * SFX_TRIM, 0.03);
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function now() {
  return ctx.currentTime;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function makeGain(value, dest) {
  const node = ctx.createGain();
  node.gain.value = value;
  if (dest) {
    node.connect(dest);
  }
  return node;
}

function makeSend(from, to, amount) {
  const send = makeGain(amount, to);
  from.connect(send);
  return send;
}

function makeOsc(type, freq) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  return osc;
}

function makeFilter(type, freq, q) {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  return filter;
}

function buildNoiseBuffer(seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function noiseSource(loop = false) {
  const src = ctx.createBufferSource();
  src.buffer = sharedNoiseBuffer;
  src.loop = loop;
  return src;
}

// Decaying stereo noise burst used as the reverb impulse response.
function buildImpulseResponse(seconds, decayPower) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decayPower);
    }
  }
  return buffer;
}

function rampParam(param, value, seconds) {
  const t = now();
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(value, t + seconds);
}

// Linear attack, exponential-style decay; never touches true zero so the
// exponential ramp is valid.
function envelope(param, t, attack, peak, decay) {
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

// Piecewise exponential glide for frequency-like params.
// points: array of [secondsFromT, value].
function pitchCurve(param, t, startValue, points) {
  param.setValueAtTime(startValue, t);
  for (const [dt, value] of points) {
    param.exponentialRampToValueAtTime(value, t + dt);
  }
}

function stopSafe(...nodes) {
  for (const node of nodes) {
    try {
      node.stop();
    } catch (err) {
      // Already stopped or never started; nothing to do.
    }
  }
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ---------------------------------------------------------------------------
// One-shot voice management
// ---------------------------------------------------------------------------

const maxOneShotVoices = 12;
const oneShotVoices = [];

function finalizeVoice(voice) {
  if (voice.finalized) {
    return;
  }
  voice.finalized = true;
  voice.out.disconnect();
  const idx = oneShotVoices.indexOf(voice);
  if (idx !== -1) {
    oneShotVoices.splice(idx, 1);
  }
}

function spawnVoice() {
  const voice = {
    out: makeGain(1, sfxGain),
    endTime: 0,
    anchorNode: null,
    finalized: false,
    // Starts/stops a source and keeps the longest-lived one as the anchor
    // whose onended tears the whole voice down.
    source(node, t0, t1) {
      node.start(t0);
      node.stop(t1);
      if (t1 >= voice.endTime) {
        if (voice.anchorNode) {
          voice.anchorNode.onended = null;
        }
        voice.endTime = t1;
        voice.anchorNode = node;
        node.onended = () => finalizeVoice(voice);
      }
      return node;
    },
  };
  oneShotVoices.push(voice);
  if (oneShotVoices.length > maxOneShotVoices) {
    // Steal the oldest voice with a fast fade; its sources still stop on
    // their own schedule, they are just inaudible.
    const oldest = oneShotVoices.shift();
    rampParam(oldest.out.gain, 0.0001, 0.02);
    setTimeout(() => finalizeVoice(oldest), 50);
  }
  return voice;
}

// ---------------------------------------------------------------------------
// One-shot SFX
// ---------------------------------------------------------------------------

const sfxBuilders = {
  launch(params) {
    const power = clamp01(params.power ?? 0.7);
    const t = now();
    const voice = spawnVoice();

    const noise = noiseSource();
    const thumpFilter = makeFilter('bandpass', 400 + 2600 * power, 0.8);
    const thumpGain = makeGain(0.0001, voice.out);
    noise.connect(thumpFilter).connect(thumpGain);
    envelope(thumpGain.gain, t, 0.006, 0.45 + 0.4 * power, 0.22);
    voice.source(noise, t, t + 0.3);

    const chirp = makeOsc('triangle', 160);
    pitchCurve(chirp.frequency, t, 160, [[0.18, 420 + 900 * power]]);
    const chirpGain = makeGain(0.0001, voice.out);
    chirp.connect(chirpGain);
    envelope(chirpGain.gain, t, 0.01, 0.16 + 0.18 * power, 0.3);
    voice.source(chirp, t, t + 0.35);
  },

  land(params) {
    const speed = clamp01(params.speed ?? 0.5);
    const t = now();
    const voice = spawnVoice();

    const thud = makeOsc('sine', 130);
    pitchCurve(thud.frequency, t, 130, [[0.09, 55]]);
    const thudGain = makeGain(0.0001, voice.out);
    thud.connect(thudGain);
    envelope(thudGain.gain, t, 0.004, 0.22 + 0.3 * speed, 0.18);
    voice.source(thud, t, t + 0.25);

    const dust = noiseSource();
    const dustFilter = makeFilter('lowpass', 900 + 600 * speed, 0.7);
    const dustGain = makeGain(0.0001, voice.out);
    dust.connect(dustFilter).connect(dustGain);
    envelope(dustGain.gain, t, 0.01, 0.05 + 0.12 * speed, 0.35);
    voice.source(dust, t, t + 0.45);
  },

  goal() {
    const t = now();
    const voice = spawnVoice();
    const rootMidi = (music.playing ? music.rootMidi : 57) + 24;
    const offsets = [0, 3, 5, 7, 12]; // minor pentatonic climb

    offsets.forEach((semi, i) => {
      const t0 = t + i * 0.09;
      const freq = midiToFreq(rootMidi + semi);
      const bellGain = makeGain(0.0001, voice.out);
      bellGain.gain.setValueAtTime(0.0001, t0);
      bellGain.gain.linearRampToValueAtTime(0.11, t0 + 0.012);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      const partialA = makeOsc('sine', freq);
      const partialB = makeOsc('sine', freq * 2.01);
      const partialBGain = makeGain(0.3, bellGain);
      partialA.connect(bellGain);
      partialB.connect(partialBGain);
      voice.source(partialA, t0, t0 + 1);
      voice.source(partialB, t0, t0 + 1);
    });

    // Airy pad swell underneath.
    const padFilter = makeFilter('lowpass', 1400, 0.5);
    const padGain = makeGain(0.0001, voice.out);
    padFilter.connect(padGain);
    padGain.gain.setValueAtTime(0.0001, t);
    padGain.gain.linearRampToValueAtTime(0.07, t + 0.35);
    padGain.gain.linearRampToValueAtTime(0.0001, t + 1.7);
    for (const semi of [0, 7]) {
      for (const detune of [-6, 6]) {
        const osc = makeOsc('sawtooth', midiToFreq(rootMidi - 12 + semi));
        osc.detune.value = detune;
        osc.connect(padFilter);
        voice.source(osc, t, t + 1.8);
      }
    }
  },

  medal(params) {
    const tier = params.tier || 'bronze';
    const tierIndex = Math.max(0, ['bronze', 'silver', 'gold', 'ace'].indexOf(tier));
    const noteCount = 3 + tierIndex;
    const brightness = [1400, 2200, 3400, 4800][tierIndex];
    const offsets = [0, 5, 7, 12, 17, 19]; // open fourths/fifths fanfare
    const t = now();
    const voice = spawnVoice();
    const rootMidi = (music.playing ? music.rootMidi : 57) + 24;

    const toneFilter = makeFilter('lowpass', brightness, 0.7);
    toneFilter.connect(voice.out);
    for (let i = 0; i < noteCount; i++) {
      const t0 = t + i * 0.11;
      const last = i === noteCount - 1;
      const dur = last ? 0.5 : 0.16;
      const freq = midiToFreq(rootMidi + offsets[i]);
      const g = makeGain(0.0001, toneFilter);
      envelope(g.gain, t0, 0.008, 0.1 + 0.02 * tierIndex, dur);
      const osc = makeOsc(tierIndex >= 2 ? 'square' : 'triangle', freq);
      osc.connect(g);
      voice.source(osc, t0, t0 + dur + 0.1);
      if (tier === 'ace') {
        const shimmer = makeOsc('sine', freq * 2);
        const sg = makeGain(0.0001, toneFilter);
        envelope(sg.gain, t0, 0.008, 0.05, dur);
        shimmer.connect(sg);
        voice.source(shimmer, t0, t0 + dur + 0.1);
      }
    }
  },

  'crash-planet'() {
    const t = now();
    const voice = spawnVoice();

    const crunch = noiseSource();
    const crunchFilter = makeFilter('lowpass', 2800, 0.8);
    pitchCurve(crunchFilter.frequency, t, 2800, [[0.25, 200]]);
    const crunchGain = makeGain(0.0001, voice.out);
    crunch.connect(crunchFilter).connect(crunchGain);
    envelope(crunchGain.gain, t, 0.005, 0.55, 0.28);
    voice.source(crunch, t, t + 0.35);

    const boom = makeOsc('sine', 75);
    pitchCurve(boom.frequency, t, 75, [[0.3, 32]]);
    const boomGain = makeGain(0.0001, voice.out);
    boom.connect(boomGain);
    envelope(boomGain.gain, t, 0.008, 0.5, 0.45);
    voice.source(boom, t, t + 0.55);
  },

  'crash-sun'() {
    const t = now();
    const voice = spawnVoice();

    const boom = makeOsc('sine', 55);
    pitchCurve(boom.frequency, t, 55, [[0.6, 22]]);
    const boomGain = makeGain(0.0001, voice.out);
    boom.connect(boomGain);
    envelope(boomGain.gain, t, 0.01, 0.7, 1.2);
    voice.source(boom, t, t + 1.4);

    const body = makeOsc('triangle', 95);
    pitchCurve(body.frequency, t, 95, [[0.4, 30]]);
    const bodyGain = makeGain(0.0001, voice.out);
    body.connect(bodyGain);
    envelope(bodyGain.gain, t, 0.01, 0.3, 0.6);
    voice.source(body, t, t + 0.8);

    const sizzle = noiseSource(true);
    const sizzleFilter = makeFilter('bandpass', 2600, 0.6);
    pitchCurve(sizzleFilter.frequency, t, 2600, [[2.2, 700]]);
    const sizzleGain = makeGain(0.0001, voice.out);
    sizzle.connect(sizzleFilter).connect(sizzleGain);
    envelope(sizzleGain.gain, t, 0.02, 0.32, 2.2);
    voice.source(sizzle, t, t + 2.4);
  },

  'crash-turret'() {
    const t = now();
    const voice = spawnVoice();

    const zap = makeOsc('sawtooth', 1400);
    pitchCurve(zap.frequency, t, 1400, [[0.09, 180]]);
    const zapGain = makeGain(0.0001, voice.out);
    zap.connect(zapGain);
    envelope(zapGain.gain, t, 0.003, 0.3, 0.12);
    voice.source(zap, t, t + 0.18);

    const thud = makeOsc('sine', 110);
    pitchCurve(thud.frequency, t + 0.04, 110, [[0.12, 45]]);
    const thudGain = makeGain(0.0001, voice.out);
    thud.connect(thudGain);
    envelope(thudGain.gain, t + 0.04, 0.005, 0.35, 0.22);
    voice.source(thud, t + 0.04, t + 0.35);
  },

  'crash-meteor'() {
    const t = now();
    const voice = spawnVoice();

    const crack = noiseSource();
    const crackFilter = makeFilter('highpass', 2200, 0.7);
    const crackGain = makeGain(0.0001, voice.out);
    crack.connect(crackFilter).connect(crackGain);
    envelope(crackGain.gain, t, 0.002, 0.55, 0.07);
    voice.source(crack, t, t + 0.12);

    const knock = makeOsc('sine', 220);
    pitchCurve(knock.frequency, t, 220, [[0.08, 90]]);
    const knockGain = makeGain(0.0001, voice.out);
    knock.connect(knockGain);
    envelope(knockGain.gain, t, 0.003, 0.3, 0.15);
    voice.source(knock, t, t + 0.2);
  },

  'crash-pulsar'() {
    const t = now();
    const voice = spawnVoice();

    // Sawtooth amplitude-modulated by a square LFO reads as electric buzz.
    const buzz = makeOsc('sawtooth', 130);
    const buzzFilter = makeFilter('bandpass', 950, 1.2);
    const amGain = makeGain(0.5);
    const lfo = makeOsc('square', 55);
    const lfoDepth = makeGain(0.5);
    lfo.connect(lfoDepth).connect(amGain.gain);
    const buzzGain = makeGain(0.0001, voice.out);
    buzz.connect(buzzFilter).connect(amGain).connect(buzzGain);
    envelope(buzzGain.gain, t, 0.004, 0.4, 0.28);
    voice.source(buzz, t, t + 0.35);
    voice.source(lfo, t, t + 0.35);

    const spark = noiseSource();
    const sparkFilter = makeFilter('highpass', 3000, 0.7);
    const sparkGain = makeGain(0.0001, voice.out);
    spark.connect(sparkFilter).connect(sparkGain);
    envelope(sparkGain.gain, t, 0.002, 0.2, 0.1);
    voice.source(spark, t, t + 0.15);
  },

  portal() {
    const t = now();
    const voice = spawnVoice();

    for (const detune of [0, 9]) {
      const osc = makeOsc('sine', 280);
      osc.detune.value = detune;
      pitchCurve(osc.frequency, t, 280, [[0.18, 880], [0.5, 240]]);
      // Fast vibrato makes the glide sound watery.
      const vibrato = makeOsc('sine', 7);
      const vibratoDepth = makeGain(24);
      vibrato.connect(vibratoDepth).connect(osc.frequency);
      const g = makeGain(0.0001, voice.out);
      osc.connect(g);
      envelope(g.gain, t, 0.06, 0.13, 0.5);
      voice.source(osc, t, t + 0.6);
      voice.source(vibrato, t, t + 0.6);
    }

    const swoosh = noiseSource();
    const swooshFilter = makeFilter('bandpass', 500, 3);
    pitchCurve(swooshFilter.frequency, t, 500, [[0.18, 1800], [0.5, 400]]);
    const swooshGain = makeGain(0.0001, voice.out);
    swoosh.connect(swooshFilter).connect(swooshGain);
    envelope(swooshGain.gain, t, 0.05, 0.18, 0.45);
    voice.source(swoosh, t, t + 0.6);
  },

  undo() {
    const t = now();
    const voice = spawnVoice();

    const whir = makeOsc('triangle', 900);
    pitchCurve(whir.frequency, t, 900, [[0.16, 280], [0.34, 1150]]);
    const whirGain = makeGain(0.0001, voice.out);
    whir.connect(whirGain);
    envelope(whirGain.gain, t, 0.01, 0.13, 0.36);
    voice.source(whir, t, t + 0.42);

    const tape = noiseSource();
    const tapeFilter = makeFilter('bandpass', 1400, 4);
    pitchCurve(tapeFilter.frequency, t, 1400, [[0.16, 500], [0.34, 1700]]);
    const tapeGain = makeGain(0.0001, voice.out);
    tape.connect(tapeFilter).connect(tapeGain);
    envelope(tapeGain.gain, t, 0.01, 0.08, 0.36);
    voice.source(tape, t, t + 0.42);
  },

  click() {
    const t = now();
    const voice = spawnVoice();
    const tick = makeOsc('sine', 1900);
    const g = makeGain(0.0001, voice.out);
    tick.connect(g);
    envelope(g.gain, t, 0.002, 0.11, 0.045);
    voice.source(tick, t, t + 0.08);
  },

  warn() {
    const t = now();
    const voice = spawnVoice();
    const notes = [[0, 880, 0.12], [0.16, 659.25, 0.18]];
    for (const [offset, freq, dur] of notes) {
      const osc = makeOsc('triangle', freq);
      const g = makeGain(0.0001, voice.out);
      osc.connect(g);
      envelope(g.gain, t + offset, 0.012, 0.12, dur);
      voice.source(osc, t + offset, t + offset + dur + 0.06);
    }
  },

  nearmiss(params) {
    const speed = clamp01(params.speed ?? 0.5);
    const t = now();
    const voice = spawnVoice();

    const whoosh = noiseSource();
    const whooshFilter = makeFilter('bandpass', 500, 1.2);
    // Pitch rises to the pass-by point, then falls: cheap doppler.
    pitchCurve(whooshFilter.frequency, t, 500, [
      [0.12, 900 + 2200 * speed],
      [0.45, 380],
    ]);
    const g = makeGain(0.0001, voice.out);
    whoosh.connect(whooshFilter).connect(g);
    envelope(g.gain, t, 0.1, 0.1 + 0.22 * speed, 0.38);
    voice.source(whoosh, t, t + 0.55);
  },

  slowmo() {
    const t = now();
    const voice = spawnVoice();

    const sweep = makeOsc('sine', 220);
    pitchCurve(sweep.frequency, t, 220, [[0.6, 55]]);
    const sweepGain = makeGain(0.0001, voice.out);
    sweep.connect(sweepGain);
    envelope(sweepGain.gain, t, 0.05, 0.12, 0.55);
    voice.source(sweep, t, t + 0.7);

    const air = noiseSource();
    const airFilter = makeFilter('lowpass', 1200, 0.6);
    pitchCurve(airFilter.frequency, t, 1200, [[0.6, 180]]);
    const airGain = makeGain(0.0001, voice.out);
    air.connect(airFilter).connect(airGain);
    envelope(airGain.gain, t, 0.05, 0.06, 0.55);
    voice.source(air, t, t + 0.7);
  },
};

function play(name, params = {}) {
  if (!ctx) {
    return;
  }
  const builder = sfxBuilders[name];
  if (builder) {
    builder(params || {});
  }
}

// ---------------------------------------------------------------------------
// Loops
// ---------------------------------------------------------------------------

const activeLoops = new Map();

function spawnLavaPop(t, dest) {
  const osc = makeOsc('sine', 180 + Math.random() * 260);
  osc.frequency.setValueAtTime(osc.frequency.value, t);
  osc.frequency.exponentialRampToValueAtTime(osc.frequency.value * 0.55, t + 0.07);
  const g = makeGain(0.0001, dest);
  envelope(g.gain, t, 0.006, 0.04 + Math.random() * 0.05, 0.07);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.12);
  osc.onended = () => g.disconnect();
}

const loopBuilders = {
  drag(out) {
    const noise = noiseSource(true);
    // High-Q bandpass on noise gives the creak; detuned sine pair gives body.
    const creakFilter = makeFilter('bandpass', 300, 8);
    const creakGain = makeGain(0.1, out);
    noise.connect(creakFilter).connect(creakGain);
    const bodyA = makeOsc('sine', 65);
    const bodyB = makeOsc('sine', 65.8);
    const bodyGain = makeGain(0.05, out);
    bodyA.connect(bodyGain);
    bodyB.connect(bodyGain);
    noise.start();
    bodyA.start();
    bodyB.start();
    return {
      update(params) {
        if (params.power === undefined) {
          return;
        }
        const p = clamp01(params.power);
        const baseFreq = 60 + 90 * p;
        rampParam(creakFilter.frequency, 250 + 1400 * p, 0.05);
        rampParam(bodyA.frequency, baseFreq, 0.05);
        rampParam(bodyB.frequency, baseFreq * 1.012, 0.05);
        rampParam(creakGain.gain, 0.08 + 0.12 * p, 0.05);
        rampParam(bodyGain.gain, 0.04 + 0.06 * p, 0.05);
      },
      dispose() {
        stopSafe(noise, bodyA, bodyB);
      },
    };
  },

  flight(out) {
    const wind = noiseSource(true);
    const windFilter = makeFilter('bandpass', 500, 0.7);
    const windGain = makeGain(0.0001, out);
    wind.connect(windFilter).connect(windGain);

    const rumble = noiseSource(true);
    const rumbleFilter = makeFilter('lowpass', 80, 0.8);
    const rumbleGain = makeGain(0.0001, out);
    rumble.connect(rumbleFilter).connect(rumbleGain);

    const sub = makeOsc('sine', 36);
    const subGain = makeGain(0.0001, out);
    sub.connect(subGain);

    wind.start();
    rumble.start();
    sub.start();
    return {
      update(params) {
        if (params.speed !== undefined) {
          const s = clamp01(params.speed);
          rampParam(windFilter.frequency, 280 + 2700 * s, 0.08);
          rampParam(windGain.gain, 0.3 * s * s, 0.08);
        }
        if (params.gravity !== undefined) {
          const g = clamp01(params.gravity);
          rampParam(rumbleFilter.frequency, 60 + 70 * g, 0.12);
          rampParam(rumbleGain.gain, 0.35 * g, 0.12);
          rampParam(subGain.gain, 0.1 * g, 0.12);
        }
      },
      dispose() {
        stopSafe(wind, rumble, sub);
      },
    };
  },

  lava(out) {
    const bed = noiseSource(true);
    const bedFilter = makeFilter('lowpass', 380, 0.7);
    const bedGain = makeGain(0.1, out);
    bed.connect(bedFilter).connect(bedGain);
    bed.start();
    // Lookahead pop scheduler so throttled tabs keep bubbling smoothly.
    let popTime = now() + 0.05;
    const timer = setInterval(() => {
      const horizon = now() + 0.35;
      while (popTime < horizon) {
        if (Math.random() < 0.75) {
          spawnLavaPop(popTime, out);
        }
        popTime += 0.06 + Math.random() * 0.22;
      }
    }, 120);
    return {
      update() {},
      dispose() {
        clearInterval(timer);
        stopSafe(bed);
      },
    };
  },

  ice(out) {
    const sources = [];
    for (const freq of [1567.98, 1975.53, 2349.32]) {
      const osc = makeOsc('sine', freq * (1 + (Math.random() - 0.5) * 0.004));
      const g = makeGain(0.008, out);
      osc.connect(g);
      // Very slow LFO per partial so the shimmer breathes.
      const lfo = makeOsc('sine', 0.07 + Math.random() * 0.12);
      const lfoDepth = makeGain(0.006);
      lfo.connect(lfoDepth).connect(g.gain);
      osc.start();
      lfo.start();
      sources.push(osc, lfo);
    }
    return {
      update() {},
      dispose() {
        stopSafe(...sources);
      },
    };
  },

  rewind(out) {
    const whir = makeOsc('triangle', 850);
    const wobble = makeOsc('sine', 6);
    const wobbleDepth = makeGain(140);
    wobble.connect(wobbleDepth).connect(whir.frequency);
    const whirGain = makeGain(0.05, out);
    whir.connect(whirGain);

    const hiss = noiseSource(true);
    const hissFilter = makeFilter('bandpass', 1600, 2.5);
    const hissGain = makeGain(0.07, out);
    hiss.connect(hissFilter).connect(hissGain);

    whir.start();
    wobble.start();
    hiss.start();
    return {
      update() {},
      dispose() {
        stopSafe(whir, wobble, hiss);
      },
    };
  },
};

function startLoop(name, params = {}) {
  if (!ctx) {
    return;
  }
  const existing = activeLoops.get(name);
  if (existing) {
    existing.update(params || {});
    return;
  }
  const builder = loopBuilders[name];
  if (!builder) {
    return;
  }
  const out = makeGain(0.0001, sfxGain);
  const loop = builder(out);
  loop.out = out;
  activeLoops.set(name, loop);
  loop.update(params || {});
  rampParam(out.gain, 1, 0.04);
}

function setLoopParams(name, params) {
  if (!ctx) {
    return;
  }
  const loop = activeLoops.get(name);
  if (loop) {
    loop.update(params || {});
  }
}

function stopLoop(name) {
  if (!ctx) {
    return;
  }
  const loop = activeLoops.get(name);
  if (!loop) {
    return;
  }
  activeLoops.delete(name);
  rampParam(loop.out.gain, 0.0001, 0.15);
  setTimeout(() => {
    loop.dispose();
    loop.out.disconnect();
  }, 250);
}

function stopAllLoops() {
  if (!ctx) {
    return;
  }
  for (const name of [...activeLoops.keys()]) {
    stopLoop(name);
  }
}

// ---------------------------------------------------------------------------
// Generative music
// ---------------------------------------------------------------------------

const dorianScale = [0, 2, 3, 5, 7, 9, 10];
// Dorian degrees that form a minor pentatonic; used for melodic picks so
// bells and arps stay consonant over any chord in the walk.
const melodyDegrees = [0, 2, 3, 4, 6];

const schedulerIntervalMs = 100;
const lookaheadSec = 0.3;
const stepsPerChord = 16; // eighth-note steps -> chord every two bars

const music = {
  playing: false,
  mood: 'drift',
  intensity: 0.6,
  rootMidi: 45,
  pendingRoot: null,
  progression: [0, 5, 3, 4],
  chordIndex: 0,
  step: 0,
  stepsToChord: 1,
  nextStepTime: 0,
  timer: null,
  stopTimer: null,
  live: [],
};

function moodBpm() {
  return music.mood === 'pulse' ? 88 : 56;
}

function degreeToMidi(degree, octaveShift = 0) {
  const len = dorianScale.length;
  const octave = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return music.rootMidi + dorianScale[idx] + 12 * (octave + octaveShift);
}

function currentChordMidis() {
  const degree = music.progression[music.chordIndex];
  return [degreeToMidi(degree), degreeToMidi(degree + 2), degreeToMidi(degree + 4)];
}

// Nudge one non-tonic slot of the progression so it slowly evolves.
function evolveProgression() {
  const slot = 1 + Math.floor(Math.random() * (music.progression.length - 1));
  const step = [-2, -1, 1, 2][Math.floor(Math.random() * 4)];
  let degree = music.progression[slot] + step;
  degree = ((degree % 7) + 7) % 7;
  music.progression[slot] = degree;
}

function registerMusicSource(src, t0, t1, cleanup) {
  src.start(t0);
  src.stop(t1);
  const entry = { src, cleanup };
  music.live.push(entry);
  src.onended = () => {
    const idx = music.live.indexOf(entry);
    if (idx !== -1) {
      music.live.splice(idx, 1);
    }
    if (cleanup) {
      cleanup();
    }
  };
}

function spawnPad(t, midis, dur) {
  const attack = music.mood === 'pulse' ? 0.8 : 2.0;
  const release = 2.8;
  const end = t + dur + release;
  const lowpass = makeFilter('lowpass', 1200, 0.4);
  const padOut = makeGain(0.0001, musicFilter);
  lowpass.connect(padOut);
  const oscMix = makeGain(0.3, lowpass);

  const g = padOut.gain;
  g.setValueAtTime(0.0001, t);
  g.linearRampToValueAtTime(0.045, t + attack);
  g.setValueAtTime(0.045, t + dur);
  g.linearRampToValueAtTime(0.0001, end);

  let first = true;
  for (const midi of midis) {
    for (const detune of [-6, 6]) {
      const osc = makeOsc('sawtooth', midiToFreq(midi));
      osc.detune.value = detune;
      osc.connect(oscMix);
      const cleanup = first
        ? () => {
            padOut.disconnect();
            lowpass.disconnect();
            oscMix.disconnect();
          }
        : null;
      registerMusicSource(osc, t, end + 0.05, cleanup);
      first = false;
    }
  }
}

function spawnBell(t, midi, level) {
  const freq = midiToFreq(midi);
  const g = makeGain(0.0001, musicFilter);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(level, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  const partialA = makeOsc('sine', freq);
  const partialB = makeOsc('sine', freq * 2.01);
  const partialBGain = makeGain(0.35, g);
  partialA.connect(g);
  partialB.connect(partialBGain);
  registerMusicSource(partialA, t, t + 1.7, () => g.disconnect());
  registerMusicSource(partialB, t, t + 1.7, null);
}

function spawnArpNote(t) {
  const chord = currentChordMidis();
  let midi = chord[Math.floor(Math.random() * chord.length)] + 12;
  if (Math.random() < 0.2) {
    midi += 12;
  }
  const osc = makeOsc('triangle', midiToFreq(midi));
  const pluckFilter = makeFilter('lowpass', 2400, 1);
  const g = makeGain(0.0001, arpGain);
  osc.connect(pluckFilter).connect(g);
  envelope(g.gain, t, 0.005, 0.09, 0.22);
  registerMusicSource(osc, t, t + 0.3, () => {
    g.disconnect();
    pluckFilter.disconnect();
  });
}

function spawnKick(t) {
  const osc = makeOsc('sine', 105);
  pitchCurve(osc.frequency, t, 105, [[0.1, 38]]);
  const g = makeGain(0.0001, percGain);
  osc.connect(g);
  envelope(g.gain, t, 0.003, 0.4, 0.16);
  registerMusicSource(osc, t, t + 0.25, () => g.disconnect());
}

function scheduleStep(t) {
  music.stepsToChord -= 1;
  if (music.stepsToChord <= 0) {
    music.stepsToChord = stepsPerChord;
    music.chordIndex = (music.chordIndex + 1) % music.progression.length;
    if (music.chordIndex === 0 && Math.random() < 0.6) {
      evolveProgression();
    }
    if (music.pendingRoot !== null) {
      music.rootMidi = music.pendingRoot;
      music.pendingRoot = null;
    }
    const chordDur = stepsPerChord * (30 / moodBpm());
    spawnPad(t, currentChordMidis(), chordDur);
  }

  if (music.mood === 'drift') {
    // Sparse bells on downbeats only.
    if (music.step % 2 === 0 && Math.random() < 0.1) {
      const degree = melodyDegrees[Math.floor(Math.random() * melodyDegrees.length)];
      spawnBell(t, degreeToMidi(degree) + 24, 0.05);
    }
  } else {
    if (Math.random() < 0.72) {
      spawnArpNote(t);
    }
    if (music.step % 4 === 0) {
      spawnKick(t);
    }
    if (music.step % 16 === 8 && Math.random() < 0.4) {
      spawnBell(t, degreeToMidi(0) + 24, 0.04);
    }
  }
  music.step += 1;
}

function schedulerTick() {
  const horizon = now() + lookaheadSec;
  while (music.nextStepTime < horizon) {
    scheduleStep(music.nextStepTime);
    music.nextStepTime += 30 / moodBpm(); // eighth-note step
  }
}

function applyIntensity() {
  if (!ctx) {
    return;
  }
  const v = music.intensity;
  const t = now();
  const tc = 0.2;
  if (music.mood === 'drift') {
    musicFilter.frequency.setTargetAtTime(700 + 4500 * v, t, tc);
    arpGain.gain.setTargetAtTime(0.0001, t, tc);
    percGain.gain.setTargetAtTime(0.0001, t, tc);
  } else {
    musicFilter.frequency.setTargetAtTime(2200 + 3000 * v, t, tc);
    arpGain.gain.setTargetAtTime(0.05 + 0.95 * v, t, tc);
    percGain.gain.setTargetAtTime(v, t, tc);
  }
}

function rootForWorld(worldIndex) {
  // Cycle of fourths keeps adjacent worlds harmonically related.
  let root = 45 + ((Math.max(0, Math.floor(worldIndex)) * 5) % 12);
  if (root > 51) {
    root -= 12;
  }
  return root;
}

function startMusic(worldIndex = 0) {
  if (!ctx) {
    return;
  }
  const root = rootForWorld(worldIndex);
  if (music.playing) {
    // Already running: glide to the new key at the next (hastened) chord
    // boundary so overlapping pad releases mask the transition.
    music.pendingRoot = root;
    music.stepsToChord = Math.min(music.stepsToChord, 2);
    return;
  }
  if (music.stopTimer) {
    clearTimeout(music.stopTimer);
    music.stopTimer = null;
    for (const entry of music.live.slice()) {
      stopSafe(entry.src);
    }
    music.live.length = 0;
  }
  music.playing = true;
  music.rootMidi = root;
  music.pendingRoot = null;
  music.progression = [0, 5, 3, 4];
  music.chordIndex = music.progression.length - 1;
  music.step = 0;
  music.stepsToChord = 1;
  music.nextStepTime = now() + 0.05;
  rampParam(musicMix.gain, 1, 0.1);
  applyIntensity();
  music.timer = setInterval(schedulerTick, schedulerIntervalMs);
  schedulerTick();
}

function stopMusic() {
  if (!ctx || !music.playing) {
    return;
  }
  music.playing = false;
  if (music.timer) {
    clearInterval(music.timer);
    music.timer = null;
  }
  rampParam(musicMix.gain, 0.0001, 0.5);
  music.stopTimer = setTimeout(() => {
    music.stopTimer = null;
    for (const entry of music.live.slice()) {
      stopSafe(entry.src);
    }
    music.live.length = 0;
  }, 700);
}

function setMusicMood(mood) {
  if (mood !== 'drift' && mood !== 'pulse') {
    return;
  }
  music.mood = mood;
  applyIntensity();
}

function setMusicIntensity(value) {
  music.intensity = clamp01(value);
  applyIntensity();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const audio = {
  unlock,
  isUnlocked,
  setLevels,
  setMusicMood,
  startMusic,
  stopMusic,
  setMusicIntensity,
  play,
  startLoop,
  setLoopParams,
  stopLoop,
  stopAllLoops,
};
