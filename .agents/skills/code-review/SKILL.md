---
name: code-review
description: >
  Triggered when: user asks to review, check, audit, or validate code.
  Keywords: review, check rules, audit, does this follow, is this correct
---

# Code Review Skill

## Checklist (report ALL findings as Artifact)

### 🔴 Critical (rule violation — must fix before merge)
- [ ] Business logic found in router
- [ ] Transaction boundary missing (Payment/Attendance/Subscription)
- [ ] Attendance record being updated
- [ ] Hard delete used (`prisma.*.delete`)
- [ ] `any` type used
- [ ] memberId mutated during transfer

### 🟡 Warning (best practice)
- [ ] `deletedAt: null` filter missing in findMany
- [ ] AppError not thrown (plain Error used)
- [ ] z.infer not used for DTO types

### 🟢 OK
- List compliant areas

## Output Format
Produce a Review Artifact with sections: Critical / Warning / OK
Do NOT auto-fix. Report only unless user says "fix all warnings".

