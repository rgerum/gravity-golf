import {
  UNITY_WORLD_INDICES,
  buildFixtureExport,
  buildReverseFixtureExport,
  createUnityLevels,
  formatOutcomeDistribution,
  globalLevelIndex,
  getFrameCountStats,
  getFixturePath,
  getReverseFixturePath,
  summarizeFixture,
  writeJsonFile,
} from './unity-export-shared.js';

async function main() {
  for (const worldIndex of UNITY_WORLD_INDICES) {
    const levels = createUnityLevels(worldIndex);

    for (const [levelInWorld, level] of levels.entries()) {
      const levelIndex = globalLevelIndex(worldIndex, levelInWorld);
      const fixture = buildFixtureExport(level, levelIndex);
      const filePath = getFixturePath(level, levelIndex);
      const reverseFixture = buildReverseFixtureExport(level, levelIndex);
      const reverseFilePath = getReverseFixturePath(level, levelIndex);

      await writeJsonFile(filePath, fixture);
      await writeJsonFile(reverseFilePath, reverseFixture);

      const summary = summarizeFixture(fixture);
      const frameStats = getFrameCountStats(fixture);
      const asteroidCrashes = fixture.shots.filter((shot) => shot.outcome === 'crash' && shot.reason === 'asteroid').length;

      console.log(
        `Level ${summary.levelIndex} ${summary.levelId}: ${summary.shots} shots, `
        + `sources ${formatOutcomeDistribution(summary.sources)}, `
        + `outcomes ${formatOutcomeDistribution(summary.outcomes)}, `
        + `raw frames min/median/max ${frameStats.min}/${frameStats.median}/${frameStats.max}, `
        + `>100 ${frameStats.overThreshold}, `
        + `reverse ${reverseFixture.sequences.length}x${reverseFixture.steps}, `
        + `asteroid-crash ${asteroidCrashes}`,
      );
    }
  }
}

main().catch((error) => {
  console.error(`Failed to export Unity fixtures: ${error.message}`);
  process.exit(1);
});
