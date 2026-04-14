import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// Force environment variable overriding exclusively for the mock engine.
// This resolves realistically mapped inside /prisma directory natively.
process.env.DATABASE_URL = 'file:./test.db';

beforeAll(() => {
  // Pre-flight database synchronization mimicking pure production state cleanly
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: 'file:./test.db' } });
});

afterAll(async () => {
  // Safe cleanup routine releasing Node SQLite threads preventing lock limits
  await prisma.$disconnect();

  const dbPath = path.join(process.cwd(), 'prisma', 'test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
