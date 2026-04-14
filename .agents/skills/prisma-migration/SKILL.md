---
name: prisma-migration
description: >
  Triggered when: user asks to create migration, modify schema,
  add table, alter column, or run `prisma migrate`.
  Keywords: migration, schema change, add model, prisma
---

# Prisma Migration Skill

## Execution Steps (always in this order)
1. `npx prisma format`         — schema 포맷 정리
2. Review schema diff with user — Plan Artifact로 변경사항 요약 제시
3. Await human approval
4. `npx prisma migrate dev --name <descriptive_name>`
5. `npx prisma generate`
6. `npm run build`             — TS 에러 0개 확인

## Naming Convention
- Format: `add_[table]`, `alter_[table]_[column]`, `drop_[table]`
- Example: `add_notification_table`, `alter_member_add_referral_code`

## Post-Migration Checklist
- [ ] New model has corresponding Zod schema
- [ ] New model registered in seed.ts
- [ ] Index strategy reviewed (filterable fields indexed)
- [ ] deletedAt added if soft-delete needed

