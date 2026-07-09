import {
  buildFixtureExport,
  buildReverseFixtureExport,
  createUnityLevels,
  formatOutcomeDistribution,
  getFrameCountStats,
  getFixturePath,
  getReverseFixturePath,
  summarizeFixture,
  writeJsonFile,
} from './unity-export-shared.js';

async function main() {
  const levels = createUnityLevels();

  for (const [levelIndex, level] of levels.entries()) {
    const fixture = buildFixtureExport(level, levelIndex);
    const filePath = getFixturePath(level, levelIndex);
    const reverseFixture = buildReverseFixtureExport(level, levelIndex);
    const reverseFilePath = getReverseFixturePath(level, levelIndex);

    await writeJsonFile(filePath, fixture);
    await writeJsonFile(reverseFilePath, reverseFixture);

    const summary = summarizeFixture(fixture);
    const frameStats = getFrameCountStats(fixture);

    console.log(
      `Level ${summary.levelIndex} ${summary.levelId}: ${summary.shots} shots, `
      + `sources ${formatOutcomeDistribution(summary.sources)}, `
      + `outcomes ${formatOutcomeDistribution(summary.outcomes)}, `
      + `raw frames min/median/max ${frameStats.min}/${frameStats.median}/${frameStats.max}, `
      + `>100 ${frameStats.overThreshold}, `
      + `reverse ${reverseFixture.sequences.length}x${reverseFixture.steps}`,
    );
  }
}

main().catch((error) => {
  console.error(`Failed to export Unity fixtures: ${error.message}`);
  process.exit(1);
});
