# Holiday Itineraries

Astro and Sanity site for planning and viewing holiday itineraries, including trip sections, maps, weather, food and drink shortlists, and booking actions.

## Commands

```powershell
npm.cmd run dev
npm.cmd run check
npm.cmd run build
npm.cmd run audit:content
npm.cmd run validate:transport -- <payload.json>
npm.cmd run check:transport -- <trip-slug>
npm.cmd run load:transport -- <trip-slug> <payload.json>
```

Use npm for this project. `package-lock.json` is the tracked lockfile.

## Transport Brief Notes

- `transportBrief` is the canonical trip-level Sanity field for local transport guidance.
- `transportHub` is retired. Do not add new code, scripts, docs, or CMS payloads that depend on it.
- Use the Local Transport Intelligence skill as the research and output contract, including the compact `transportBrief` layer and richer report/support data.
- Keep compact card fields traveller-facing. Preserve evidence IDs, source freshness, service windows, and richer caveats in the structured fields used by the transport validator and full transport guide.
- Validate local payloads with `npm.cmd run validate:transport -- <payload.json>` before any CMS write.
- Use `npm.cmd run load:transport -- <trip-slug> <payload.json>` for transport CMS writes so validation and read-back checks happen together.
- Use `npm.cmd run check:transport -- <trip-slug>` to verify live Sanity transport data against the shared transport validator.
- Use `SANITY_WRITE_TOKEN` for CMS writes.
- Follow the same write policy as attraction cards: raw perspective, draft-first when a draft exists, published only when explicitly needed.
- For routine validation, run `npm.cmd run check` and `npm.cmd run build`. Do not start a long-running dev server unless specifically needed.
