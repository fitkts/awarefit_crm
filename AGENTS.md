# AGENTS.md — Cross-Tool Shared Rules

## Code Style
- Language: TypeScript strict mode
- Indent: 2 spaces, single quotes, semicolons required
- Max line: 100 chars
- Naming: camelCase / PascalCase / UPPER_SNAKE

## Universal Constraints
- No hard deletes — always soft delete with deletedAt
- No raw try/catch in HTTP handlers
- No `any` type
- Validate all external input with Zod before it enters the service layer

## Error Handling
- Service layer throws AppError(code, statusCode, message)
- Router never catches — delegate to global error handler

## Testing
- Integration tests: Vitest + Supertest
- Isolated test DB per test file
- Critical: test transaction rollback scenarios

## Git
- Commit format: type(scope): message  (Conventional Commits)
- Never commit: .env, *.db, node_modules

