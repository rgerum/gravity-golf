using System;
using System.Collections.Generic;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Runtime-only synth SFX. Clips are generated once into float buffers so the Unity
    /// port stays asset-free like the web build's WebAudio palette.
    /// </summary>
    public sealed class AudioManager : MonoBehaviour
    {
        private const int SampleRate = 44100;
        private const float TwoPi = Mathf.PI * 2f;

        private readonly Dictionary<string, AudioClip> _clips = new Dictionary<string, AudioClip>();
        private AudioSource _sourceA;
        private AudioSource _sourceB;
        private float _masterVolume = 0.85f;
        private bool _initialized;
        private int _sourceFlip;
        private uint _noiseState = 0x1234abcd;

        public bool Enabled { get; set; } = true;

        public float MasterVolume
        {
            get => _masterVolume;
            set => _masterVolume = Mathf.Clamp01(value);
        }

        private void Awake()
        {
            Initialize();
        }

        public void Initialize()
        {
            if (_initialized)
            {
                return;
            }

            EnsureListener();
            _sourceA = CreateSource("SfxSourceA");
            _sourceB = CreateSource("SfxSourceB");
            BuildLibrary();
            _initialized = true;
        }

        public void PlayLaunch() => Play("launch", 0.8f);

        public void PlayLand() => Play("land", 0.72f);

        public void PlayCrash(string reason)
        {
            Play(reason == "sun" ? "crash-sun" : "crash-planet", 0.78f);
        }

        public void PlayGoal() => Play("goal", 0.82f);

        public void PlayMedal(string medal)
        {
            var key = (medal ?? string.Empty).ToLowerInvariant() switch
            {
                "ace" => "medal-ace",
                "gold" => "medal-gold",
                "silver" => "medal-silver",
                _ => "medal-bronze",
            };
            Play(key, 0.78f);
        }

        public void PlayRewind() => Play("rewind", 0.68f);

        public void PlayUi() => Play("ui", 0.55f);

        private void Play(string key, float gain)
        {
            if (!Enabled)
            {
                return;
            }

            Initialize();
            if (!_clips.TryGetValue(key, out var clip) || clip == null)
            {
                return;
            }

            var source = (_sourceFlip++ & 1) == 0 ? _sourceA : _sourceB;
            if (source != null)
            {
                source.PlayOneShot(clip, Mathf.Clamp01(gain) * _masterVolume);
            }
        }

        private AudioSource CreateSource(string sourceName)
        {
            var sourceGo = new GameObject(sourceName);
            sourceGo.transform.SetParent(transform, false);
            var source = sourceGo.AddComponent<AudioSource>();
            source.playOnAwake = false;
            source.loop = false;
            source.spatialBlend = 0f;
            source.volume = 1f;
            return source;
        }

        private void EnsureListener()
        {
            if (FindFirstObjectByType<AudioListener>() != null)
            {
                return;
            }

            var mainCamera = Camera.main;
            if (mainCamera != null)
            {
                if (mainCamera.GetComponent<AudioListener>() == null)
                {
                    mainCamera.gameObject.AddComponent<AudioListener>();
                }
                return;
            }

            if (GetComponent<AudioListener>() == null)
            {
                gameObject.AddComponent<AudioListener>();
            }
        }

        private void BuildLibrary()
        {
            _clips["launch"] = BuildClip("Launch", 0.44f, data =>
            {
                AddNoiseSweep(data, 0f, 0.32f, 360f, 2600f, 0.18f, 0.08f, 0.36f, WaveBand.Band);
                AddSweep(data, Wave.Triangle, 0f, 0.38f, 160f, 920f, 0.26f, 0.01f, 0.28f);
                AddSweep(data, Wave.Sine, 0f, 0.16f, 92f, 48f, 0.16f, 0.004f, 0.16f);
            });

            _clips["land"] = BuildClip("Land", 0.42f, data =>
            {
                AddSweep(data, Wave.Sine, 0f, 0.24f, 135f, 58f, 0.28f, 0.004f, 0.20f);
                AddNoiseSweep(data, 0f, 0.36f, 850f, 420f, 0.09f, 0.012f, 0.30f, WaveBand.Low);
                AddTone(data, Wave.Triangle, 0.035f, 0.08f, 980f, 0.035f, 0.002f, 0.04f);
            });

            _clips["crash-planet"] = BuildClip("CrashPlanet", 0.64f, data =>
            {
                AddNoiseSweep(data, 0f, 0.34f, 2600f, 220f, 0.32f, 0.003f, 0.30f, WaveBand.Low);
                AddSweep(data, Wave.Sine, 0f, 0.56f, 78f, 34f, 0.42f, 0.006f, 0.48f);
                AddTone(data, Wave.Square, 0.015f, 0.12f, 118f, 0.08f, 0.002f, 0.10f);
            });

            _clips["crash-sun"] = BuildClip("CrashSun", 1.18f, data =>
            {
                AddSweep(data, Wave.Sine, 0f, 1.05f, 55f, 22f, 0.48f, 0.01f, 1.0f);
                AddSweep(data, Wave.Triangle, 0.02f, 0.70f, 95f, 30f, 0.20f, 0.01f, 0.62f);
                AddNoiseSweep(data, 0.02f, 1.04f, 2800f, 650f, 0.18f, 0.02f, 0.92f, WaveBand.Band);
            });

            _clips["goal"] = BuildClip("Goal", 1.35f, data =>
            {
                var root = MidiToFreq(81);
                var offsets = new[] { 0, 3, 5, 7, 12 };
                for (var i = 0; i < offsets.Length; i += 1)
                {
                    var t = i * 0.085f;
                    var freq = root * Mathf.Pow(2f, offsets[i] / 12f);
                    AddBell(data, t, 0.86f, freq, 0.15f);
                }

                AddChord(data, 0f, 1.2f, new[] { MidiToFreq(69), MidiToFreq(76) }, 0.055f);
            });

            _clips["medal-bronze"] = BuildMedalClip("MedalBronze", 0, Wave.Triangle);
            _clips["medal-silver"] = BuildMedalClip("MedalSilver", 1, Wave.Triangle);
            _clips["medal-gold"] = BuildMedalClip("MedalGold", 2, Wave.Square);
            _clips["medal-ace"] = BuildMedalClip("MedalAce", 3, Wave.Square);

            _clips["rewind"] = BuildClip("Rewind", 0.48f, data =>
            {
                AddSweep(data, Wave.Triangle, 0f, 0.42f, 920f, 290f, 0.17f, 0.012f, 0.34f);
                AddSweep(data, Wave.Sine, 0.06f, 0.34f, 280f, 1040f, 0.08f, 0.02f, 0.28f);
                AddNoiseSweep(data, 0f, 0.42f, 1500f, 520f, 0.09f, 0.01f, 0.35f, WaveBand.Band);
            });

            _clips["ui"] = BuildClip("Ui", 0.105f, data =>
            {
                AddTone(data, Wave.Sine, 0f, 0.075f, 1900f, 0.14f, 0.002f, 0.046f);
                AddTone(data, Wave.Triangle, 0.012f, 0.062f, 950f, 0.035f, 0.002f, 0.042f);
            });
        }

        private AudioClip BuildMedalClip(string name, int tier, Wave wave)
        {
            var duration = 0.58f + tier * 0.09f;
            return BuildClip(name, duration, data =>
            {
                var root = MidiToFreq(81);
                var offsets = new[] { 0, 5, 7, 12, 17, 19 };
                var noteCount = 3 + tier;
                for (var i = 0; i < noteCount; i += 1)
                {
                    var t = i * 0.10f;
                    var noteDuration = i == noteCount - 1 ? 0.40f + tier * 0.05f : 0.16f;
                    var freq = root * Mathf.Pow(2f, offsets[i] / 12f);
                    AddTone(data, wave, t, noteDuration, freq, 0.13f + tier * 0.025f, 0.006f, noteDuration);
                    if (tier == 3)
                    {
                        AddTone(data, Wave.Sine, t, noteDuration, freq * 2f, 0.055f, 0.006f, noteDuration);
                    }
                }
            });
        }

        private AudioClip BuildClip(string clipName, float duration, Action<float[]> builder)
        {
            var sampleCount = Mathf.CeilToInt(duration * SampleRate);
            var data = new float[sampleCount];
            builder(data);
            Normalize(data, 0.92f);

            var clip = AudioClip.Create(clipName, sampleCount, 1, SampleRate, false);
            clip.SetData(data, 0);
            return clip;
        }

        private void AddBell(float[] data, float start, float duration, float frequency, float gain)
        {
            AddTone(data, Wave.Sine, start, duration, frequency, gain, 0.01f, duration * 0.95f);
            AddTone(data, Wave.Sine, start, duration, frequency * 2.01f, gain * 0.28f, 0.012f, duration * 0.85f);
        }

        private void AddChord(float[] data, float start, float duration, float[] frequencies, float gain)
        {
            for (var i = 0; i < frequencies.Length; i += 1)
            {
                AddTone(data, Wave.Triangle, start, duration, frequencies[i] * 0.997f, gain, 0.30f, duration * 0.75f);
                AddTone(data, Wave.Triangle, start, duration, frequencies[i] * 1.004f, gain, 0.30f, duration * 0.75f);
            }
        }

        private void AddTone(
            float[] data,
            Wave wave,
            float start,
            float duration,
            float frequency,
            float gain,
            float attack,
            float decay)
        {
            AddSweep(data, wave, start, duration, frequency, frequency, gain, attack, decay);
        }

        private void AddSweep(
            float[] data,
            Wave wave,
            float start,
            float duration,
            float startFrequency,
            float endFrequency,
            float gain,
            float attack,
            float decay)
        {
            var startSample = Mathf.Max(0, Mathf.FloorToInt(start * SampleRate));
            var count = Mathf.Min(data.Length - startSample, Mathf.CeilToInt(duration * SampleRate));
            var phase = 0f;
            for (var i = 0; i < count; i += 1)
            {
                var t = i / (float)SampleRate;
                var u = count <= 1 ? 1f : i / (float)(count - 1);
                var freq = Mathf.Lerp(startFrequency, endFrequency, Smooth01(u));
                phase += TwoPi * freq / SampleRate;
                data[startSample + i] += Osc(wave, phase) * Envelope(t, duration, attack, decay) * gain;
            }
        }

        private void AddNoiseSweep(
            float[] data,
            float start,
            float duration,
            float startCutoff,
            float endCutoff,
            float gain,
            float attack,
            float decay,
            WaveBand band)
        {
            var startSample = Mathf.Max(0, Mathf.FloorToInt(start * SampleRate));
            var count = Mathf.Min(data.Length - startSample, Mathf.CeilToInt(duration * SampleRate));
            var low = 0f;
            var bandState = 0f;
            for (var i = 0; i < count; i += 1)
            {
                var t = i / (float)SampleRate;
                var u = count <= 1 ? 1f : i / (float)(count - 1);
                var cutoff = Mathf.Lerp(startCutoff, endCutoff, Smooth01(u));
                var alpha = Mathf.Clamp01(cutoff / SampleRate);
                var noise = NextNoise();
                low += (noise - low) * alpha;
                bandState += (low - bandState) * Mathf.Clamp01(alpha * 4f);
                var shaped = band == WaveBand.Low ? low : low - bandState;
                data[startSample + i] += shaped * Envelope(t, duration, attack, decay) * gain;
            }
        }

        private float NextNoise()
        {
            _noiseState = _noiseState * 1664525u + 1013904223u;
            return ((_noiseState >> 8) / 8388607.5f) - 1f;
        }

        private static float Osc(Wave wave, float phase)
        {
            var s = Mathf.Sin(phase);
            switch (wave)
            {
                case Wave.Triangle:
                    return (2f / Mathf.PI) * Mathf.Asin(s);
                case Wave.Square:
                    return s >= 0f ? 1f : -1f;
                default:
                    return s;
            }
        }

        private static float Envelope(float t, float duration, float attack, float decay)
        {
            var attackGain = attack <= 0f ? 1f : Mathf.Clamp01(t / attack);
            var remaining = Mathf.Max(0f, duration - t);
            var decayGain = decay <= 0f ? 1f : Mathf.Clamp01(remaining / decay);
            return Smooth01(Mathf.Min(attackGain, decayGain));
        }

        private static float Smooth01(float value)
        {
            var x = Mathf.Clamp01(value);
            return x * x * (3f - 2f * x);
        }

        private static void Normalize(float[] data, float ceiling)
        {
            var max = 0f;
            for (var i = 0; i < data.Length; i += 1)
            {
                max = Mathf.Max(max, Mathf.Abs(data[i]));
            }

            if (max <= ceiling || max <= 0.0001f)
            {
                return;
            }

            var scale = ceiling / max;
            for (var i = 0; i < data.Length; i += 1)
            {
                data[i] *= scale;
            }
        }

        private static float MidiToFreq(int midi)
        {
            return 440f * Mathf.Pow(2f, (midi - 69) / 12f);
        }

        private enum Wave
        {
            Sine,
            Triangle,
            Square,
        }

        private enum WaveBand
        {
            Low,
            Band,
        }
    }
}
