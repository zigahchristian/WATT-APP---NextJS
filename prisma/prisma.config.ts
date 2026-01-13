import { config as dotenvConfig } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, env } from 'prisma/config'

// Ensure we load the project's root .env when commands are executed
// from the `prisma/` directory (Prisma CLI often runs with CWD=prisma).
const rootEnvPath = resolve(process.cwd(), '..', '.env')
if (existsSync(rootEnvPath)) {
  dotenvConfig({ path: rootEnvPath })
} else {
  // fallback to default behavior (load .env from CWD if present)
  dotenvConfig()
}

// Detect schema path so Prisma works whether commands run from project root
// or from the `prisma/` directory.
const schemaAtProjectRoot = resolve(process.cwd(), 'prisma', 'schema.prisma')
const schemaAtCwd = resolve(process.cwd(), 'schema.prisma')
let schemaPath = 'prisma/schema.prisma'
if (existsSync(schemaAtProjectRoot)) {
  schemaPath = 'prisma/schema.prisma'
} else if (existsSync(schemaAtCwd)) {
  schemaPath = 'schema.prisma'
}

export default defineConfig({
  schema: schemaPath,

  migrations: {
    seed: 'npx tsx ./seed.ts',
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
