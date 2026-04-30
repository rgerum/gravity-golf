import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  worldResults: defineTable({
    worldId: v.string(),
    submissionKey: v.string(),
    clientRunId: v.string(),
    completedLevelCount: v.number(),
    levelsCleared: v.number(),
    launches: v.number(),
    retries: v.number(),
    relays: v.number(),
    flightTime: v.number(),
    score: v.number(),
    createdAt: v.number(),
  })
    .index("by_submission_key", ["submissionKey"])
    .index("by_world", ["worldId"]),
});
