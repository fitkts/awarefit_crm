---
name: generate
description: Run full module generation + migration + test scaffold
trigger: /generate
---

Steps:
1. Use `module-scaffold` Skill to create the module
2. Use `prisma-migration` Skill if schema changed
3. Use `test-scaffold` Skill to create tests/[name].test.ts
4. Run `npm run build` — confirm zero errors
5. Produce summary Artifact: files created, routes registered, tests added

