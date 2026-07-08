import {
  WORLD_FILE_PATH,
  buildWorldExport,
  createUnityLevels,
  writeJsonFile,
} from './unity-export-shared.js';

async function main() {
  const levels = createUnityLevels();
  const world = buildWorldExport(levels);

  if (world.levels.length !== 10) {
    throw new Error(`Expected 10 levels, got ${world.levels.length}`);
  }

  await writeJsonFile(WORLD_FILE_PATH, world);
  console.log(`Wrote ${WORLD_FILE_PATH} (${world.levels.length} levels)`);
}

main().catch((error) => {
  console.error(`Failed to export Unity levels: ${error.message}`);
  process.exit(1);
});
