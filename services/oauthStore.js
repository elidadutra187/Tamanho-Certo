const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { getPool, hasDatabase, initializeDatabase } = require("./database");

const DEFAULT_TOKEN_FILE = ".nuvemshop-oauth-token.json";

function tokenFilePath() {
  return path.resolve(process.env.OAUTH_TOKEN_FILE || DEFAULT_TOKEN_FILE);
}

function readStoredToken() {
  const filePath = tokenFilePath();
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function saveStoredToken(token) {
  if (hasDatabase()) {
    await initializeDatabase();
    await getPool().query(
      `
        insert into stores (store_id, access_token, scopes, installed_at, updated_at)
        values ($1, $2, $3, $4, now())
        on conflict (store_id)
        do update set
          access_token = excluded.access_token,
          scopes = excluded.scopes,
          installed_at = coalesce(stores.installed_at, excluded.installed_at),
          updated_at = now()
      `,
      [token.storeId, token.accessToken, token.scopes || null, token.installedAt || new Date().toISOString()]
    );
    return "database";
  }

  const filePath = tokenFilePath();
  await fsp.writeFile(filePath, JSON.stringify(token, null, 2), "utf8");
  return filePath;
}

async function readStoredTokenAsync(storeId = null) {
  if (hasDatabase()) {
    if (!storeId) return null;
    await initializeDatabase();
    const result = await getPool().query(
      "select store_id, access_token, scopes, installed_at, updated_at from stores where store_id = $1",
      [storeId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      storeId: row.store_id,
      accessToken: row.access_token,
      scopes: row.scopes,
      installedAt: row.installed_at,
      updatedAt: row.updated_at
    };
  }

  const token = readStoredToken();
  if (!token) return null;
  if (storeId && String(token.storeId) !== String(storeId)) return null;
  return token;
}

async function tokenStatusAsync(storeId = null) {
  const token = await readStoredTokenAsync(storeId);
  if (!token) {
    return {
      configured: false,
      source: hasDatabase() ? "database" : null,
      storeId: storeId || process.env.NUVEMSHOP_STORE_ID || null
    };
  }

  return {
    configured: Boolean(token.accessToken && token.storeId),
    source: hasDatabase() ? "database" : "oauth-file",
    storeId: token.storeId || null,
    installedAt: token.installedAt || null,
    updatedAt: token.updatedAt || null,
    scopes: token.scopes || null
  };
}

module.exports = {
  readStoredToken,
  readStoredTokenAsync,
  saveStoredToken,
  tokenStatusAsync
};
