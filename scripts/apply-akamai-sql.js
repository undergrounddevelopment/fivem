const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const dotenv = require('dotenv')

// Load env from local files for convenience (does not overwrite existing process.env)
dotenv.config({ path: path.join(process.cwd(), '.env.local') })
dotenv.config({ path: path.join(process.cwd(), '.env') })

function getEnv(name) {
  return process.env[name] || ''
}

function shouldUseSsl(conn) {
  return /sslmode=require/i.test(conn) || conn.includes('akamaidb.net')
}

function getDbTargetInfo(conn) {
  try {
    const url = new URL(conn)
    return {
      host: url.hostname,
      port: url.port || '5432',
      db: url.pathname ? url.pathname.replace(/^\//, '') : '',
    }
  } catch {
    return null
  }
}

function splitSqlStatements(sql) {
  // Minimal SQL splitter supporting:
  // - single quotes
  // - dollar-quoted strings ($$...$$ or $tag$...$tag$)
  // - line comments (-- ...)
  // - block comments (/* ... */)
  const out = []
  let cur = ''
  let i = 0

  let inSingle = false
  let inLineComment = false
  let inBlockComment = false
  let dollarTag = null // string like $$ or $tag$

  const peek = (n = 0) => sql[i + n]

  while (i < sql.length) {
    const ch = sql[i]
    const next = peek(1)

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        cur += ch
      }
      i++
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i += 2
      } else {
        i++
      }
      continue
    }

    // start comments (only when not inside string)
    if (!inSingle && !dollarTag) {
      if (ch === '-' && next === '-') {
        inLineComment = true
        i += 2
        continue
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true
        i += 2
        continue
      }
    }

    // dollar-quote start/end (only when not inside single quote)
    if (!inSingle) {
      if (!dollarTag && ch === '$') {
        // try parse $tag$
        let j = i + 1
        while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++
        if (sql[j] === '$') {
          dollarTag = sql.slice(i, j + 1) // includes both $
          cur += dollarTag
          i = j + 1
          continue
        }
      } else if (dollarTag && ch === '$') {
        // check closing tag
        if (sql.startsWith(dollarTag, i)) {
          cur += dollarTag
          i += dollarTag.length
          dollarTag = null
          continue
        }
      }
    }

    // single quote toggle
    if (!dollarTag && ch === "'") {
      cur += ch
      if (inSingle) {
        // handle escaped ''
        if (next === "'") {
          cur += next
          i += 2
          continue
        }
        inSingle = false
      } else {
        inSingle = true
      }
      i++
      continue
    }

    // statement delimiter
    if (!inSingle && !dollarTag && ch === ';') {
      const trimmed = cur.trim()
      if (trimmed) out.push(trimmed)
      cur = ''
      i++
      continue
    }

    cur += ch
    i++
  }

  const trimmed = cur.trim()
  if (trimmed) out.push(trimmed)
  return out
}

async function run() {
  const dbUrl =
    getEnv('DATABASE_URL') ||
    getEnv('POSTGRES_URL') ||
    getEnv('SUPABASE_DB_URL') ||
    getEnv('PG_CONNECTION_STRING')

  if (!dbUrl) {
    console.error('[AKAMAI] DATABASE_URL is required (or POSTGRES_URL as fallback).')
    console.error('[AKAMAI] Set it in .env.local or your shell env, e.g.:')
    console.error('         DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require')
    process.exit(1)
  }

  const target = getDbTargetInfo(dbUrl)
  if (target) {
    console.log(`[AKAMAI] Target database: ${target.host}:${target.port}/${target.db || '(unknown)'}`)
  }

  // Safety guard: refuse to run unless it looks like Akamai, unless FORCE_DB_APPLY=1
  const force = getEnv('FORCE_DB_APPLY') === '1'
  const host = (target?.host || '').toLowerCase()
  const port = target?.port || ''
  const looksLikeAkamai = host.endsWith('akamaidb.net') || host.includes('.akamaidb.net') || port === '27775'

  if (!force && !looksLikeAkamai) {
    console.error('[AKAMAI] Refusing to apply SQL: connection does not look like Akamai.')
    console.error('[AKAMAI] If you are SURE this is the correct DB, set FORCE_DB_APPLY=1 and re-run.')
    process.exit(1)
  }

  const filesArg = getEnv('AKAMAI_SQL_FILES')
  const defaultFiles = [
    path.join(process.cwd(), 'database-schema-complete-v7.sql'),
    path.join(process.cwd(), 'scripts', 'AKAMAI-ADDONS.sql'),
    path.join(process.cwd(), 'scripts', 'CREATE-XP-BADGE-SYSTEM.sql'),
  ]

  const files = filesArg
    ? filesArg.split(',').map((s) => s.trim()).filter(Boolean).map((p) => path.isAbsolute(p) ? p : path.join(process.cwd(), p))
    : defaultFiles

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: shouldUseSsl(dbUrl) ? { rejectUnauthorized: false } : undefined,
    max: 1,
  })

  try {
    for (const filePath of files) {
      if (!fs.existsSync(filePath)) {
        console.error(`[AKAMAI] Missing SQL file: ${filePath}`)
        process.exit(1)
      }

      const sql = fs.readFileSync(filePath, 'utf8')
      const statements = splitSqlStatements(sql)

      console.log(`\n[AKAMAI] Applying: ${path.relative(process.cwd(), filePath)} (${statements.length} statements)`)

      const client = await pool.connect()
      try {
        for (let idx = 0; idx < statements.length; idx++) {
          const stmt = statements[idx]
          try {
            await client.query(stmt)
          } catch (e) {
            console.error(`\n[AKAMAI] Failed at ${path.relative(process.cwd(), filePath)} statement #${idx + 1}`)
            console.error(stmt.slice(0, 4000))
            throw e
          }
        }
      } finally {
        client.release()
      }

      console.log(`[AKAMAI] OK: ${path.relative(process.cwd(), filePath)}`)
    }

    console.log('\n[AKAMAI] All SQL applied successfully ✅')
  } finally {
    await pool.end().catch(() => {})
  }
}

run().catch((e) => {
  console.error('\n[AKAMAI] SQL apply failed ❌')
  console.error(e)
  process.exit(1)
})
