---
name: module-scaffold
description: >
  Triggered when: user asks to create a new module, feature, domain,
  or resource from scratch.
  Keywords: new module, scaffold, create feature, add domain
---

# Module Scaffold Skill

## Files to Create (exact order)
1. src/modules/$NAME/$NAME.schema.ts
2. src/modules/$NAME/$NAME.service.ts
3. src/modules/$NAME/$NAME.router.ts

## Each File Template

### schema.ts
- Import: zod
- Export: CreateDto, UpdateDto, QueryDto (all as z.infer types)
- No logic, no imports from prisma

### service.ts
- Import: prisma (singleton), AppError, logger
- Class: [Name]Service
- Methods: findAll, findById, create, update, softDelete
- All methods async, all throw AppError on failure

### router.ts
- Import: fastifyPlugin, [Name]Service, DTOs
- Routes: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
- No try/catch — rely on global error handler

## After Scaffolding
- Register router in src/app.ts under /api/v1/$NAME
- Confirm `npm run build` passes

