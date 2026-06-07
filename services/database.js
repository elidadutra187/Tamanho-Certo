const pg = require("pg");
const { sampleGuides } = require("../data/sampleGuides");

const { Pool } = pg;
let pool = null;
let initialized = false;

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!hasDatabase()) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

async function initializeDatabase() {
  const client = getPool();
  if (!client || initialized) return;

  await client.query(`
    create table if not exists stores (
      store_id text primary key,
      access_token text not null,
      scopes text,
      installed_at timestamptz,
      updated_at timestamptz not null default now()
    )
  `);

  await client.query(`
    create table if not exists size_guides (
      id text primary key,
      store_id text,
      name text not null,
      category text not null,
      product_types jsonb not null,
      fit_options jsonb not null,
      questions jsonb not null,
      measurements jsonb not null,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await client.query(`
    create table if not exists recommendation_events (
      id bigserial primary key,
      store_id text,
      guide_id text,
      product_id text,
      product_name text,
      recommended_size text,
      confidence integer,
      answers jsonb,
      created_at timestamptz not null default now()
    )
  `);

  for (const guide of sampleGuides) {
    await client.query(
      `
        insert into size_guides
          (id, store_id, name, category, product_types, fit_options, questions, measurements)
        values ($1, null, $2, $3, $4, $5, $6, $7)
        on conflict (id)
        do nothing
      `,
      [
        guide.id,
        guide.name,
        guide.category,
        JSON.stringify(guide.productTypes),
        JSON.stringify(guide.fitOptions),
        JSON.stringify(guide.questions),
        JSON.stringify(guide.measurements)
      ]
    );
  }

  initialized = true;
}

module.exports = {
  getPool,
  hasDatabase,
  initializeDatabase
};
