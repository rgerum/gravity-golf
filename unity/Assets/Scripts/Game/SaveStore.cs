using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using UnityEngine;

namespace GravityGolf.Game
{
    /// <summary>
    /// Local player progression + settings, persisted as JSON in
    /// Application.persistentDataPath/save.json. Loaded lazily on first access and written
    /// after each change. Keyed by the stable level id so it survives level reordering.
    /// </summary>
    public sealed class SaveStore
    {
        private const string FileName = "save.json";
        private static readonly string[] MedalRank = { "bronze", "silver", "gold", "ace" };

        private static SaveStore _instance;

        public static SaveStore Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = Load();
                }

                return _instance;
            }
        }

        [JsonProperty("levels")]
        public Dictionary<string, LevelProgress> Levels { get; set; } = new Dictionary<string, LevelProgress>();

        [JsonProperty("settings")]
        public SettingsData Settings { get; set; } = new SettingsData();

        [JsonProperty("currentParStreak")]
        public int CurrentParStreak { get; set; }

        [JsonProperty("bestParStreak")]
        public int BestParStreak { get; set; }

        public LevelProgress GetLevel(string id)
        {
            if (!string.IsNullOrEmpty(id) && Levels.TryGetValue(id, out var progress) && progress != null)
            {
                return progress;
            }

            return new LevelProgress();
        }

        public bool IsCompleted(string id) => GetLevel(id).Completed;

        /// <summary>
        /// Records a level completion. Returns true if this was a new personal best
        /// (first completion or fewer strokes than before). Updates the medal to the best
        /// achieved, advances the par streak, and persists.
        /// </summary>
        public bool RecordResult(string id, int strokes, string medal, bool atOrUnderPar)
        {
            if (string.IsNullOrEmpty(id))
            {
                return false;
            }

            if (!Levels.TryGetValue(id, out var progress) || progress == null)
            {
                progress = new LevelProgress();
                Levels[id] = progress;
            }

            var newBest = !progress.Completed || strokes < progress.BestStrokes;
            if (newBest)
            {
                progress.BestStrokes = strokes;
            }

            if (BetterMedal(medal, progress.BestMedal))
            {
                progress.BestMedal = medal;
            }

            progress.Completed = true;

            if (atOrUnderPar)
            {
                CurrentParStreak += 1;
                if (CurrentParStreak > BestParStreak)
                {
                    BestParStreak = CurrentParStreak;
                }
            }
            else
            {
                CurrentParStreak = 0;
            }

            Save();
            return newBest;
        }

        public void SetSound(bool on)
        {
            Settings.Sound = on;
            Save();
        }

        public void SetHaptics(bool on)
        {
            Settings.Haptics = on;
            Save();
        }

        public void SetReducedMotion(bool on)
        {
            Settings.ReducedMotion = on;
            Save();
        }

        // Higher medal rank wins; unknown/empty ranks below bronze.
        private static bool BetterMedal(string candidate, string current)
        {
            return Rank(candidate) > Rank(current);
        }

        private static int Rank(string medal)
        {
            if (string.IsNullOrEmpty(medal))
            {
                return -1;
            }

            var lower = medal.ToLowerInvariant();
            for (var i = 0; i < MedalRank.Length; i += 1)
            {
                if (MedalRank[i] == lower)
                {
                    return i;
                }
            }

            return -1;
        }

        private static string Path => System.IO.Path.Combine(Application.persistentDataPath, FileName);

        private static SaveStore Load()
        {
            try
            {
                if (File.Exists(Path))
                {
                    var json = File.ReadAllText(Path);
                    var loaded = JsonConvert.DeserializeObject<SaveStore>(json);
                    if (loaded != null)
                    {
                        loaded.Levels ??= new Dictionary<string, LevelProgress>();
                        loaded.Settings ??= new SettingsData();
                        return loaded;
                    }
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[SaveStore] Load failed, starting fresh: {e.Message}");
            }

            return new SaveStore();
        }

        private void Save()
        {
            try
            {
                var json = JsonConvert.SerializeObject(this, Formatting.Indented);
                File.WriteAllText(Path, json);
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[SaveStore] Save failed: {e.Message}");
            }
        }

        public sealed class LevelProgress
        {
            [JsonProperty("completed")]
            public bool Completed { get; set; }

            [JsonProperty("bestStrokes")]
            public int BestStrokes { get; set; }

            [JsonProperty("bestMedal")]
            public string BestMedal { get; set; } = "";
        }

        public sealed class SettingsData
        {
            [JsonProperty("sound")]
            public bool Sound { get; set; } = true;

            [JsonProperty("haptics")]
            public bool Haptics { get; set; } = true;

            [JsonProperty("reducedMotion")]
            public bool ReducedMotion { get; set; }
        }
    }
}
