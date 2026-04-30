import { DirectAggregate } from "@convex-dev/aggregate";
import { componentsGeneric, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const components = componentsGeneric();

const worldScores = new DirectAggregate<{
  Namespace: string;
  Key: number;
  Id: string;
}>(components.worldScores as any);

const MIN_PUBLIC_SAMPLE_COUNT = 5;

function calculateScore(args: {
  launches: number;
  retries: number;
  flightTime: number;
}) {
  return Math.round(
    Math.max(0, args.launches) * 100
    + Math.max(0, args.retries) * 45
    + Math.max(0, args.flightTime) * 2,
  );
}

async function getWorldPercentile(ctx: { runQuery: any }, worldId: string, score: number) {
  const totalCount = await worldScores.count(ctx, { namespace: worldId });
  const worseCount = await worldScores.count(ctx, {
    namespace: worldId,
    bounds: {
      lower: { key: score, inclusive: false },
    },
  });

  return {
    sampleCount: totalCount,
    percentile: totalCount >= MIN_PUBLIC_SAMPLE_COUNT
      ? Math.round((worseCount / totalCount) * 100)
      : null,
    minSampleCount: MIN_PUBLIC_SAMPLE_COUNT,
  };
}

export const submitWorldResult = mutationGeneric({
  args: {
    worldId: v.string(),
    clientRunId: v.string(),
    completedLevelCount: v.number(),
    levelsCleared: v.number(),
    launches: v.number(),
    retries: v.number(),
    relays: v.number(),
    flightTime: v.number(),
  },
  handler: async (ctx, args) => {
    const score = calculateScore(args);
    const submissionKey = `${args.clientRunId}:${args.worldId}:${args.completedLevelCount}`;
    const existing = await ctx.db
      .query("worldResults")
      .withIndex("by_submission_key", (q) => q.eq("submissionKey", submissionKey))
      .first();

    if (!existing) {
      const id = await ctx.db.insert("worldResults", {
        worldId: args.worldId,
        submissionKey,
        clientRunId: args.clientRunId,
        completedLevelCount: args.completedLevelCount,
        levelsCleared: Math.max(0, args.levelsCleared),
        launches: Math.max(0, args.launches),
        retries: Math.max(0, args.retries),
        relays: Math.max(0, args.relays),
        flightTime: Math.max(0, args.flightTime),
        score,
        createdAt: Date.now(),
      });
      await worldScores.insert(ctx, {
        namespace: args.worldId,
        key: score,
        id,
      });
    }

    return getWorldPercentile(ctx, args.worldId, score);
  },
});

export const getWorldPercentilePreview = queryGeneric({
  args: {
    worldId: v.string(),
    launches: v.number(),
    retries: v.number(),
    flightTime: v.number(),
  },
  handler: async (ctx, args) => {
    return getWorldPercentile(ctx, args.worldId, calculateScore(args));
  },
});
