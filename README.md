# Holiday Itineraries

Astro and Sanity site for planning and viewing holiday itineraries, including trip sections, maps, weather, food and drink shortlists, and booking actions.

## Commands

```powershell
npm.cmd run dev
npm.cmd run check
npm.cmd run build
npm.cmd run audit:content
```

Use npm for this project. `package-lock.json` is the tracked lockfile.

## Transport Hub Notes

- `transportHub` is a trip-level Sanity field for local transport guidance.
- Keep the Local Transport Intelligence skill unchanged; use it as the research contract.
- Convert its output into clean traveller-facing copy before writing to Sanity: no JSON, evidence IDs, source-audit wording, readiness language, or ingest/database notes.
- Use `SANITY_WRITE_TOKEN` for CMS writes.
- Follow the same write policy as attraction cards: raw perspective, draft-first when a draft exists, published only when explicitly needed.
- For routine validation, run `npm.cmd run check` and `npm.cmd run build`. Do not start a long-running dev server unless specifically needed.
