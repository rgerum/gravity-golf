using GravityGolf.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

const double AbsTol = 1e-6;

var repoRoot = FindRepoRoot(AppContext.BaseDirectory);
var worldPath = Path.Combine(repoRoot, "unity/Assets/StreamingAssets/levels/world-1.json");
var fixtureDir = Path.Combine(repoRoot, "unity/tests/fixtures");
var fixtureFiles = Directory.GetFiles(fixtureDir, "level-*.json").OrderBy(path => path).ToList();
var reverseFixtureDir = Path.Combine(fixtureDir, "reverse");
var reverseFixtureFiles = Directory.Exists(reverseFixtureDir)
    ? Directory.GetFiles(reverseFixtureDir, "*.reverse.json").OrderBy(path => path).ToList()
    : new List<string>();

var failures = new List<string>();
var summaries = new List<LevelSummary>();
var worldJson = File.ReadAllText(worldPath);
RunNegativeLoaderTests(worldJson, failures);
var world = LevelLoader.LoadWorldFromJson(worldJson, worldPath);

foreach (var fixtureFile in fixtureFiles)
{
    var fixture = JsonConvert.DeserializeObject<FixtureFile>(File.ReadAllText(fixtureFile))
        ?? throw new InvalidDataException($"Could not parse {fixtureFile}");
    if (fixture.SchemaVersion != 1)
    {
        failures.Add($"{Path.GetFileName(fixtureFile)}: schemaVersion expected 1, got {fixture.SchemaVersion}");
        continue;
    }

    var levelSummary = new LevelSummary(fixture.LevelIndex, fixture.LevelId);
    foreach (var shot in fixture.Shots)
    {
        var result = RunShot(world.Levels[fixture.LevelIndex], shot.Input, fixture.Delta, fixture.MaxTime, null);
        CompareShot($"{fixture.LevelId}/{shot.ShotKind}", shot, result, levelSummary, failures);
        levelSummary.Shots += 1;
    }

    foreach (var sequence in fixture.Sequences)
    {
        SimulateShotOptions? chainOptions = null;
        for (var i = 0; i < sequence.Shots.Count; i += 1)
        {
            var expected = sequence.Shots[i];
            var result = RunShot(world.Levels[fixture.LevelIndex], expected.Input, fixture.Delta, fixture.MaxTime, chainOptions);
            CompareShot($"{fixture.LevelId}/{sequence.Label}/shot{i}", expected, result, levelSummary, failures);

            if (result.Outcome != "landed")
            {
                chainOptions = null;
                break;
            }

            chainOptions = new SimulateShotOptions
            {
                Delta = fixture.Delta,
                MaxTime = fixture.MaxTime,
                StartTime = result.FinalTime,
                CaptureFrames = true,
                AnchorPlanetIndex = result.AnchorPlanetIndex,
                AnchorNormal = result.AnchorNormal,
                StartPosition = result.FinalPosition,
                LandingCount = result.LandingCount,
                Heat = result.Heat,
            };
        }

        levelSummary.Sequences += 1;
    }

    summaries.Add(levelSummary);
}

var summariesByLevel = summaries.ToDictionary(summary => summary.LevelIndex);
foreach (var reverseFixtureFile in reverseFixtureFiles)
{
    var fixture = JsonConvert.DeserializeObject<ReverseFixtureFile>(File.ReadAllText(reverseFixtureFile))
        ?? throw new InvalidDataException($"Could not parse {reverseFixtureFile}");
    if (fixture.SchemaVersion != 1)
    {
        failures.Add($"{Path.GetFileName(reverseFixtureFile)}: schemaVersion expected 1, got {fixture.SchemaVersion}");
        continue;
    }

    if (!summariesByLevel.TryGetValue(fixture.LevelIndex, out var levelSummary))
    {
        levelSummary = new LevelSummary(fixture.LevelIndex, fixture.LevelId);
        summariesByLevel[fixture.LevelIndex] = levelSummary;
        summaries.Add(levelSummary);
    }

    foreach (var sequence in fixture.Sequences)
    {
        RunReverseSequence(world.Levels[fixture.LevelIndex], fixture, sequence, levelSummary, failures);
    }
}

PrintSummary(summaries);

if (failures.Count > 0)
{
    Console.Error.WriteLine();
    Console.Error.WriteLine($"FAILURES ({failures.Count})");
    foreach (var failure in failures.Take(80))
    {
        Console.Error.WriteLine(failure);
    }

    if (failures.Count > 80)
    {
        Console.Error.WriteLine($"... {failures.Count - 80} more");
    }

    Environment.Exit(1);
}

Console.WriteLine();
Console.WriteLine("ALL fixtures passed.");

static void RunNegativeLoaderTests(string worldJson, List<string> failures)
{
    var cases = new (string Label, string Field, Action<JObject> Mutate)[]
    {
        ("missing planet landable", "landable", root => ((JObject)root["levels"]![0]!["planets"]![0]!).Remove("landable")),
        ("missing planet radius", "radius", root => ((JObject)root["levels"]![0]!["planets"]![0]!).Remove("radius")),
        ("missing level startAngleDeg", "startAngleDeg", root => ((JObject)root["levels"]![0]!).Remove("startAngleDeg")),
        ("missing level goalCenter", "goalCenter", root => ((JObject)root["levels"]![0]!).Remove("goalCenter")),
        ("empty launchPresets", "launchPresets", root => ((JObject)root["levels"]![0]!)["launchPresets"] = new JArray()),
    };

    foreach (var testCase in cases)
    {
        var root = JObject.Parse(worldJson);
        testCase.Mutate(root);
        try
        {
            LevelLoader.LoadWorldFromJson(root.ToString(Formatting.None), testCase.Label);
            failures.Add($"negative loader test {testCase.Label}: expected exception");
        }
        catch (InvalidDataException ex)
        {
            if (!ex.Message.Contains(testCase.Field, StringComparison.Ordinal) ||
                !ex.Message.Contains("open-lane", StringComparison.Ordinal))
            {
                failures.Add($"negative loader test {testCase.Label}: message did not name field and level id: {ex.Message}");
            }
        }
    }
}

static SimulateShotResult RunShot(LevelRuntime sourceLevel, FixtureInput input, double delta, double maxTime, SimulateShotOptions? chainOptions)
{
    var level = sourceLevel.Clone();
    var options = chainOptions ?? new SimulateShotOptions();
    options.Delta = delta;
    options.MaxTime = maxTime;
    options.CaptureFrames = true;

    return Sim.SimulateShot(level, new ShotInput
    {
        Angle = input.AngleDeg * Math.PI / 180,
        DragPower = input.Power,
        WaitTime = input.WaitTime,
    }, options);
}

static void CompareShot(string label, FixtureShot expected, SimulateShotResult actual, LevelSummary summary, List<string> failures)
{
    if (actual.Outcome != expected.Outcome)
    {
        failures.Add($"{label}: outcome expected {expected.Outcome}, got {actual.Outcome}");
    }

    if (actual.Reason != expected.Reason)
    {
        failures.Add($"{label}: reason expected {expected.Reason}, got {actual.Reason}");
    }

    if (actual.LandingCount != expected.LandingCount)
    {
        failures.Add($"{label}: landingCount expected {expected.LandingCount}, got {actual.LandingCount}");
    }

    if (actual.Steps != expected.Steps)
    {
        failures.Add($"{label}: steps expected {expected.Steps}, got {actual.Steps}");
    }

    if (actual.Frames is null)
    {
        failures.Add($"{label}: actual frames missing");
        return;
    }

    foreach (var frame in expected.SampledFrames)
    {
        if (frame.Index < 0 || frame.Index >= actual.Frames.Count)
        {
            failures.Add($"{label}: sampled frame {frame.Index} missing; actual frame count {actual.Frames.Count}");
            continue;
        }

        var actualFrame = actual.Frames[frame.Index];
        var px = Math.Abs(actualFrame.Position.X - frame.Position.X);
        var py = Math.Abs(actualFrame.Position.Y - frame.Position.Y);
        var vx = Math.Abs(actualFrame.Velocity.X - frame.Velocity.X);
        var vy = Math.Abs(actualFrame.Velocity.Y - frame.Velocity.Y);
        summary.MaxPositionDelta = Math.Max(summary.MaxPositionDelta, Math.Max(px, py));
        summary.MaxVelocityDelta = Math.Max(summary.MaxVelocityDelta, Math.Max(vx, vy));

        if (px > AbsTol || py > AbsTol || vx > AbsTol || vy > AbsTol)
        {
            failures.Add($"{label}: frame {frame.Index} delta pos=({px:G17},{py:G17}) vel=({vx:G17},{vy:G17})");
        }
    }
}

static void RunReverseSequence(LevelRuntime sourceLevel, ReverseFixtureFile fixture, ReverseSequence sequence, LevelSummary summary, List<string> failures)
{
    var level = sourceLevel.Clone();
    Orbits.SetLevelTime(level, sequence.StartFrame.Time);
    var ball = new BallState
    {
        Position = sequence.StartFrame.Position,
        Velocity = sequence.StartFrame.Velocity,
        Time = sequence.StartFrame.Time,
        LandingCount = 0,
        LaunchGracePlanetIndex = null,
        AnchorPlanetIndex = null,
        AnchorNormal = null,
        AnchorSinceTime = 0,
        PortalCooldown = 0,
        Heat = 0,
    };

    foreach (var expectedFrame in sequence.Frames)
    {
        var result = Sim.ReverseStepBall(level, ball, fixture.Delta, sequence.LaunchPlanetIndex);
        if (result.Type != "flying")
        {
            failures.Add($"{fixture.LevelId}/{sequence.ShotKind}: reverse step {expectedFrame.Step} expected flying, got {result.Type}");
        }

        var px = Math.Abs(ball.Position.X - expectedFrame.Position.X);
        var py = Math.Abs(ball.Position.Y - expectedFrame.Position.Y);
        var vx = Math.Abs(ball.Velocity.X - expectedFrame.Velocity.X);
        var vy = Math.Abs(ball.Velocity.Y - expectedFrame.Velocity.Y);
        var timeDelta = Math.Abs(ball.Time - expectedFrame.Time);
        summary.ReverseMaxPositionDelta = Math.Max(summary.ReverseMaxPositionDelta, Math.Max(px, py));
        summary.ReverseMaxVelocityDelta = Math.Max(summary.ReverseMaxVelocityDelta, Math.Max(vx, vy));

        if (timeDelta > AbsTol || px > AbsTol || py > AbsTol || vx > AbsTol || vy > AbsTol)
        {
            failures.Add($"{fixture.LevelId}/{sequence.ShotKind}: reverse step {expectedFrame.Step} delta time={timeDelta:G17} pos=({px:G17},{py:G17}) vel=({vx:G17},{vy:G17})");
        }
    }

    summary.ReverseSequences += 1;
    summary.ReverseFrames += sequence.Frames.Count;
}

static void PrintSummary(IEnumerable<LevelSummary> summaries)
{
    Console.WriteLine("Level | Shots | Seq | RevSeq | RevFrames | Fwd Max |dPos| | Fwd Max |dVel| | Rev Max |dPos| | Rev Max |dVel|");
    Console.WriteLine("----- | ----- | --- | ------ | --------- | -------------- | -------------- | -------------- | --------------");
    foreach (var s in summaries.OrderBy(summary => summary.LevelIndex))
    {
        Console.WriteLine($"{s.LevelIndex:00} {s.LevelId,-15} {s.Shots,5} {s.Sequences,3} {s.ReverseSequences,6} {s.ReverseFrames,9} {s.MaxPositionDelta,16:G6} {s.MaxVelocityDelta,16:G6} {s.ReverseMaxPositionDelta,16:G6} {s.ReverseMaxVelocityDelta,16:G6}");
    }
}

static string FindRepoRoot(string start)
{
    var dir = new DirectoryInfo(start);
    while (dir is not null)
    {
        if (File.Exists(Path.Combine(dir.FullName, "package.json")) && Directory.Exists(Path.Combine(dir.FullName, "unity")))
        {
            return dir.FullName;
        }
        dir = dir.Parent;
    }

    throw new DirectoryNotFoundException("Could not locate repo root");
}

sealed record LevelSummary(int LevelIndex, string LevelId)
{
    public int Shots { get; set; }
    public int Sequences { get; set; }
    public int ReverseSequences { get; set; }
    public int ReverseFrames { get; set; }
    public double MaxPositionDelta { get; set; }
    public double MaxVelocityDelta { get; set; }
    public double ReverseMaxPositionDelta { get; set; }
    public double ReverseMaxVelocityDelta { get; set; }
}

sealed class FixtureFile
{
    [JsonProperty("schemaVersion")]
    public int SchemaVersion { get; set; }

    [JsonProperty("levelIndex")]
    public int LevelIndex { get; set; }

    [JsonProperty("levelId")]
    public string LevelId { get; set; } = "";

    [JsonProperty("delta")]
    public double Delta { get; set; }

    [JsonProperty("maxTime")]
    public double MaxTime { get; set; }

    [JsonProperty("shots")]
    public List<FixtureShot> Shots { get; set; } = [];

    [JsonProperty("sequences")]
    public List<FixtureSequence> Sequences { get; set; } = [];
}

sealed class FixtureSequence
{
    [JsonProperty("label")]
    public string Label { get; set; } = "";

    [JsonProperty("shots")]
    public List<FixtureShot> Shots { get; set; } = [];
}

sealed class FixtureShot
{
    [JsonProperty("source")]
    public string Source { get; set; } = "";

    [JsonProperty("shotKind")]
    public string ShotKind { get; set; } = "";

    [JsonProperty("input")]
    public FixtureInput Input { get; set; } = new();

    [JsonProperty("outcome")]
    public string Outcome { get; set; } = "";

    [JsonProperty("reason")]
    public string Reason { get; set; } = "";

    [JsonProperty("steps")]
    public int Steps { get; set; }

    [JsonProperty("landingCount")]
    public int LandingCount { get; set; }

    [JsonProperty("sampledFrames")]
    public List<FixtureFrame> SampledFrames { get; set; } = [];

    [JsonProperty("frames")]
    private List<FixtureFrame>? SequenceFrames
    {
        set
        {
            if (value is not null)
            {
                SampledFrames = value;
            }
        }
    }
}

sealed class FixtureInput
{
    [JsonProperty("angleDeg")]
    public double AngleDeg { get; set; }

    [JsonProperty("power")]
    public double Power { get; set; }

    [JsonProperty("waitTime")]
    public double WaitTime { get; set; }
}

sealed class FixtureFrame
{
    [JsonProperty("index")]
    public int Index { get; set; }

    [JsonProperty("step")]
    public int Step { get; set; }

    [JsonProperty("time")]
    public double Time { get; set; }

    [JsonProperty("position")]
    public Vec2 Position { get; set; }

    [JsonProperty("velocity")]
    public Vec2 Velocity { get; set; }
}

sealed class ReverseFixtureFile
{
    [JsonProperty("schemaVersion")]
    public int SchemaVersion { get; set; }

    [JsonProperty("levelIndex")]
    public int LevelIndex { get; set; }

    [JsonProperty("levelId")]
    public string LevelId { get; set; } = "";

    [JsonProperty("delta")]
    public double Delta { get; set; }

    [JsonProperty("steps")]
    public int Steps { get; set; }

    [JsonProperty("sequences")]
    public List<ReverseSequence> Sequences { get; set; } = [];
}

sealed class ReverseSequence
{
    [JsonProperty("source")]
    public string Source { get; set; } = "";

    [JsonProperty("shotKind")]
    public string ShotKind { get; set; } = "";

    [JsonProperty("launchPlanetIndex")]
    public int? LaunchPlanetIndex { get; set; }

    [JsonProperty("startFrame")]
    public FixtureFrame StartFrame { get; set; } = new();

    [JsonProperty("frames")]
    public List<FixtureFrame> Frames { get; set; } = [];
}
