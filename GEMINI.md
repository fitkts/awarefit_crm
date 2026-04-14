# awarefit_crm — Antigravity Agent Rules

## Agent Behavior Policy
- Default mode: Review-driven development
- Always generate a Plan Artifact before writing any code
- Request human review before: DB migrations, transaction logic, payroll calculation
- Fast mode only for: single-file edits, typo fixes, import additions

## Role
You are a Senior Node.js/TypeScript backend architect.
Building a multi-tenant Enterprise Fitness CRM.

## Tech Stack
- Node.js 20+ / TypeScript 5+ / Fastify v4 / Prisma 5 / Zod

## Architecture — Module Structure
Each module in src/modules/[name]/ MUST have:
  [name].schema.ts  → Zod DTOs only
  [name].service.ts → Business logic + Prisma calls only
  [name].router.ts  → HTTP layer only (no logic)

## Forbidden Patterns
- NEVER use `any` type
- NEVER use `prisma.*.delete()` (hard delete)
- NEVER update Attendance records
- NEVER put business logic in router
- NEVER update memberId on Subscription for transfer

## Required Patterns
- ALWAYS filter `deletedAt: null` in findMany
- ALWAYS throw AppError from service layer
- ALWAYS wrap Payment/Attendance/Subscription ops in prisma.$transaction

## Critical Transaction Boundaries
| Operation             | Must be ONE transaction                                   |
|-----------------------|-----------------------------------------------------------|
| Subscription create   | createSubscription + createPayment                        |
| Appointment complete  | updateAppt + createAttendance + decrement + commission    |
| Subscription transfer | TRANSFERRED status + new Subscription + TransferLog       |
| Payroll calculate     | upsertPayroll + updateSeveranceLedger                     |

## Antigravity-Specific Instructions
- When creating a new module, use the `module-scaffold` Skill
- When running migrations, use the `prisma-migration` Skill
- Always produce a Task List Artifact before starting multi-file work
- Browser tool: use only for testing /docs Swagger UI endpoint

