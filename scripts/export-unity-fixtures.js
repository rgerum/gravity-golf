import {
  buildFixtureExport,
  createUnityLevels,
  formatOutcomeDistribution,
  getFrameCountStats,
  getFixturePath,
  summarizeFixture,
  writeJsonFile,
} from './unity-export-shared.js';

async function main() {
  const levels = createUnityLevels();

  for (const [levelIndex, level] of levels.entries()) {
    const fixture = buildFixtureExport(level, levelIndex);
    const filePath = getFixturePath(level, levelIndex);

    await writeJsonFile(filePath, fixture);

    const summary = summarizeFixture(fixture);
    const frameStats = getFrameCountStats(fixture);

    console.log(
      `Level ${summary.levelIndex} ${summary.levelId}: ${summary.shots} shots, `
      + `sources ${formatOutcomeDistribution(summary.sources)}, `
      + `outcomes ${formatOutcomeDistribution(summary.outcomes)}, `
      + `raw frames min/median/max ${frameStats.min}/${frameStats.median}/${frameStats.max}, `
      + `>100 ${frameStats.overThreshold}`,
    );
  }
}

main().catch((error) => {
  console.error(`Failed to export Unity fixtures: ${error.message}`);
  process.exit(1);
});
