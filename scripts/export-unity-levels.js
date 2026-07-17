import {
  UNITY_WORLD_INDICES,
  buildWorldExport,
  createUnityLevels,
  worldFilePath,
  writeJsonFile,
} from './unity-export-shared.js';

async function main() {
  for (const worldIndex of UNITY_WORLD_INDICES) {
    const levels = createUnityLevels(worldIndex);
    const world = buildWorldExport(levels, worldIndex);
    const filePath = worldFilePath(worldIndex);

    if (world.levels.length !== 10) {
      throw new Error(`Expected 10 levels, got ${world.levels.length}`);
    }

    await writeJsonFile(filePath, world);
    console.log(`Wrote ${filePath} (${world.levels.length} levels)`);
  }
}

main().catch((error) => {
  console.error(`Failed to export Unity levels: ${error.message}`);
  process.exit(1);
});
