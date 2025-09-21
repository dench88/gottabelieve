# Belief Flashcards — Local Dev (No-Admin Windows)

Next.js + Prisma + Neon Postgres, deployed on Vercel.  
Run locally **without admin rights** using a **portable Node** zip.

---

## TL;DR (daily use)

```powershell
# From the project root
. .\node-local.ps1     # loads portable Node/npm into THIS terminal
npm run dev            # open http://localhost:3000
```

If you run Prisma CLI (schema changes):
```powershell
Copy-Item .env.local .env -Force
npx prisma generate
npx prisma migrate dev --name update   # or: npx prisma db push
```

---

## 1) One-time setup

### 1.1 Portable Node (no admin)
1. Download **Windows x64 .zip (LTS)** from nodejs.org → save to **Downloads**.  
2. Unzip to: `C:\Users\<you>\Tools\` → e.g. `C:\Users\<you>\Tools\node-v20.xx.x-win-x64`.

### 1.2 Create `node-local.ps1` (repo root)
Wires Node/npm/npx into the current PowerShell session.

```powershell
Set-Content -Path .\node-local.ps1 -Value @'
$env:NODEJS = (Get-ChildItem "$env:USERPROFILE\Tools\node-v*-win-x64" -Directory | Sort-Object LastWriteTime -Desc | Select-Object -First 1).FullName
$env:Path   = "$env:NODEJS;$env:Path"
function npm { & "$env:NODEJS\node.exe" "$env:NODEJS\node_modules\npm\bin\npm-cli.js" $args }
function npx { & "$env:NODEJS\node.exe" "$env:NODEJS\node_modules\npm\bin\npx-cli.js" $args }
node -v
npm -v
'@
```

> If scripts are blocked:  
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### 1.3 Env vars (`.env.local`)
Create **`.env.local`** (NOT committed):

```env
# Runtime (pooled host + pgbouncer)
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"

# Migrations/CLI (non-pooled host)
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-2.aws.neon.tech/neondb?sslmode=require"

# If used:
# OPENAI_API_KEY="sk-..."
```

`prisma/schema.prisma` should reference both:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 1.4 Install deps & create tables (first run)

```powershell
. .\node-local.ps1
npm install

# Let Prisma CLI read same env:
Copy-Item .env.local .env -Force

# Create tables (pick ONE)
npx prisma migrate dev --name init   # recommended (creates migrations)
# or:
# npx prisma db push                 # quick sync, no migration files

npx prisma generate
```

(Seed one row so UI shows something)
```sql
-- In Neon SQL Editor:
INSERT INTO "Belief" ("title","content","status","importance")
VALUES ('Test belief','Hello world','active',3);
```

---

## 2) Daily workflow

```powershell
. .\node-local.ps1
npm run dev   # http://localhost:3000
```

Schema changed? Then also:
```powershell
Copy-Item .env.local .env -Force
npx prisma generate
npx prisma migrate dev --name update   # or: npx prisma db push
```

---

## 3) Vercel deployment notes

- **Never commit secrets.** In `.gitignore`:
  ```gitignore
  .env
  .env.*
  !.env.example
  ```
- Set Vercel **Environment Variables** (for **Preview** & **Production**):
  - `DATABASE_URL` → **pooled** (`-pooler`) + `?sslmode=require&pgbouncer=true&connection_limit=1`
  - `DIRECT_URL` → **non-pooled** (no `-pooler`) + `?sslmode=require`
  - `OPENAI_API_KEY` (if used)
- Run migrations during build:
  - Build Command:
    ```
    npx prisma migrate deploy && next build
    ```
- Commit the lockfile:
  - `package-lock.json` **must** be in Git for reproducible installs.

---

## 4) Prisma must run on Node (not Edge)

If using App Router API routes that touch Prisma, add:
```ts
export const runtime = 'nodejs'
```
(Pages Router API runs on Node by default.)

---

## 5) Troubleshooting

**“npm is not recognized”** → Run:
```powershell
. .\node-local.ps1
```

**P1001 (can’t reach DB)** → Fix URLs:
- `DATABASE_URL` uses **-pooler** + `sslmode=require&pgbouncer=true&connection_limit=1`
- `DIRECT_URL` uses **non-pooler** + `sslmode=require`

**P2021 (table not found)** → Create tables:
```powershell
npx prisma migrate dev --name init
# or: npx prisma db push
```

**API 500 (`/api/beliefs`)** → Check schema/URL:
```powershell
Copy-Item .env.local .env -Force
npx prisma migrate status
```

**Prisma Studio blocked**:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx prisma studio --port 5555 --browser none
# open http://localhost:5555
```

**“0 of 0 beliefs”**:
```sql
SELECT status, COUNT(*) FROM "Belief" GROUP BY status;  -- ensure 'active'
```

---

## 6) Optional: auto-load Node in PyCharm Terminal

Settings → Tools → **Terminal** → **Shell path**:
```
powershell.exe -NoExit -Command ". 'C:\Users\<you>\Documents\GitHub\gottabelieve\node-local.ps1'"
```
Now new terminals are ready to `npm run dev`.

---

## 7) Git hygiene

Typical commit after upgrades/schema work:
```powershell
git add package.json package-lock.json prisma/schema.prisma prisma/migrations .gitignore
git commit -m "chore: deps + prisma schema"
git push
```

Safe sync after a break:
```powershell
git fetch --all --prune
git status -sb
git branch -vv
```
