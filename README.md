# gravity-golf

## Community Stats

The world-complete screen can submit anonymous world results to Convex and show a
"Better than X% of players" percentile. Set `VITE_CONVEX_URL` for the frontend
and deploy the Convex backend before shipping this feature:

```sh
pnpm convex:dev
pnpm convex:deploy
```

Without `VITE_CONVEX_URL`, the game skips online stats and the local world stats
continue to render immediately.
