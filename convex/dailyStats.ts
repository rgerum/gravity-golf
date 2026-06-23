import { DirectAggregate } from "@convex-dev/aggregate";
import { componentsGeneric, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const components = componentsGeneric();

const dailyScores = new DirectAggregate<{
  Namespace: string;
  Key: number;
  Id: string;
}>(components.dailyScores as any);

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

async function getDailyStandingsForScore(ctx: { runQuery: any }, dateKey: string, score: number) {
  const totalCount = await dailyScores.count(ctx, { namespace: dateKey });
  const worseCount = await dailyScores.count(ctx, {
    namespace: dateKey,
    bounds: {
      lower: { key: score, inclusive: false },
    },
  });
  const betterCount = await dailyScores.count(ctx, {
    namespace: dateKey,
    bounds: {
      upper: { key: score, inclusive: false },
    },
  });

  return {
    sampleCount: totalCount,
    percentile: totalCount >= MIN_PUBLIC_SAMPLE_COUNT
      ? Math.round((worseCount / totalCount) * 100)
      : null,
    rank: totalCount >= MIN_PUBLIC_SAMPLE_COUNT
      ? betterCount + 1
      : null,
    minSampleCount: MIN_PUBLIC_SAMPLE_COUNT,
  };
}

export const submitDailyResult = mutationGeneric({
  args: {
    dateKey: v.string(),
    clientRunId: v.string(),
    launches: v.number(),
    retries: v.number(),
    relays: v.number(),
    flightTime: v.number(),
  },
  handler: async (ctx, args) => {
    const score = calculateScore(args);
    const submissionKey = `${args.clientRunId}:${args.dateKey}`;
    const existing = await ctx.db
      .query("dailyResults")
      .withIndex("by_submission_key", (q) => q.eq("submissionKey", submissionKey))
      .first();

    if (!existing) {
      const id = await ctx.db.insert("dailyResults", {
        dateKey: args.dateKey,
        submissionKey,
        clientRunId: args.clientRunId,
        launches: Math.max(0, args.launches),
        retries: Math.max(0, args.retries),
        relays: Math.max(0, args.relays),
        flightTime: Math.max(0, args.flightTime),
        score,
        createdAt: Date.now(),
      });
      await dailyScores.insert(ctx, {
        namespace: args.dateKey,
        key: score,
        id,
      });
    }

    return getDailyStandingsForScore(ctx, args.dateKey, score);
  },
});

export const getDailyStandings = queryGeneric({
  args: {
    dateKey: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    return getDailyStandingsForScore(ctx, args.dateKey, args.score);
  },
});
