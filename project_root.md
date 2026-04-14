프로젝트루트/
├── GEMINI.md                    ← 최우선 규칙 (Antigravity 전용)
├── AGENTS.md                    ← 크로스툴 공통 규칙 (Claude Code도 읽음)
└── .agents/
    ├── skills/                  ← 워크스페이스 스코프 Skills
    │   ├── prisma-migration/
    │   │   ├── SKILL.md
    │   │   ├── scripts/
    │   │   └── references/
    │   ├── module-scaffold/
    │   │   └── SKILL.md
    │   └── code-review/
    │       └── SKILL.md
    └── workflows/               ← /슬래시 커맨드 역할

~/.gemini/antigravity/skills/    ← 글로벌 스코프 (모든 프로젝트 공통)
    └── typescript-strict/
        └── SKILL.md

