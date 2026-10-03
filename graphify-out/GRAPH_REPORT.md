# Graph Report - chef-angelo-guida  (2026-10-03)

## Corpus Check
- 7 files · ~16,298 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 50 nodes · 43 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab8ad1c4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chef Angelo Guida — Website Rebuild Plan
- site.spec.js
- Chef Angelo Guida - website
- package.json
- playwright.config.js
- Book page: Square booking flow — implementation plan

## God Nodes (most connected - your core abstractions)
1. `Chef Angelo Guida — Website Rebuild Plan` - 10 edges
2. `Chef Angelo Guida - website` - 8 edges
3. `Book page: Square booking flow — implementation plan` - 7 edges
4. `scripts` - 2 edges
5. `private` - 1 edges
6. `test` - 1 edges
7. `@playwright/test` - 1 edges
8. `{ defineConfig, devices }` - 1 edges
9. `{ test, expect }` - 1 edges
10. `fs` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "Chef Angelo Guida — Website Rebuild Plan"
Cohesion: 0.18
Nodes (10): Chef Angelo Guida — Website Rebuild Plan, Context, File structure, Forms (Netlify), Out of scope (for now), Pages and content, SEO, Square placeholders (+2 more)

### Community 1 - "site.spec.js"
Cohesion: 0.20
Nodes (7): fs, PAGES, path, QUOTE_PAGES, ROOT, { test, expect }, TOKENS

### Community 2 - "Chef Angelo Guida - website"
Cohesion: 0.22
Nodes (8): Chef Angelo Guida - website, Deploy to Netlify, Form emails and CSV export, Replace the placeholder tokens, Run locally, Square setup for book.html, Swap placeholder photos, Switch DNS from Wix

### Community 3 - "package.json"
Cohesion: 0.29
Nodes (6): devDependencies, @playwright/test, name, private, scripts, test

### Community 6 - "Book page: Square booking flow — implementation plan"
Cohesion: 0.25
Nodes (7): Book page: Square booking flow — implementation plan, Context, Global Constraints, Task 1: Per-date class tokens, Task 2: Restructure book.html, Task 3: Booking confirmed page, Task 4: Docs

## Knowledge Gaps
- **34 isolated node(s):** `name`, `private`, `test`, `@playwright/test`, `{ defineConfig, devices }` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `private`, `test` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._