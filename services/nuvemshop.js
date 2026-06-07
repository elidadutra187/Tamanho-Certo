const { logger } = require("../utils/logger");
const { readStoredToken, readStoredTokenAsync } = require("./oauthStore");

const DEFAULT_API_VERSION = "2025-03";
const OAUTH_TOKEN_URL = "https://www.nuvemshop.com.br/apps/authorize/token";
const DEFAULT_REQUEST_INTERVAL_MS = 900;
let requestQueue = Promise.resolve();
let lastRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseResponseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function throttleRequest(intervalMs) {
  const previous = requestQueue;
  let release;
  requestQueue = new Promise((resolve) => {
    release = resolve;
  });

  await previous;

  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < intervalMs) {
    await sleep(intervalMs - elapsed);
  }

  lastRequestAt = Date.now();
  release();
}

class NuvemshopClient {
  constructor(config) {
    this.storeId = config.storeId;
    this.accessToken = config.accessToken;
    this.userAgent = config.userAgent;
    this.apiVersion = config.apiVersion || DEFAULT_API_VERSION;
    this.baseUrl = `https://api.nuvemshop.com.br/${this.apiVersion}/${this.storeId}`;
    this.requestDelay = Number(config.requestDelay || DEFAULT_REQUEST_INTERVAL_MS);
  }

  static fromEnv() {
    const storedToken = readStoredToken();
    const storeId = process.env.NUVEMSHOP_STORE_ID || storedToken?.storeId;
    const accessToken = process.env.NUVEMSHOP_ACCESS_TOKEN || storedToken?.accessToken;
    const missing = [];
    if (!storeId) missing.push("NUVEMSHOP_STORE_ID or OAuth token");
    if (!accessToken) missing.push("NUVEMSHOP_ACCESS_TOKEN or OAuth token");
    if (!process.env.NUVEMSHOP_USER_AGENT) missing.push("NUVEMSHOP_USER_AGENT");

    if (missing.length) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }

    return new NuvemshopClient({
      storeId,
      accessToken,
      userAgent: process.env.NUVEMSHOP_USER_AGENT,
      apiVersion: process.env.NUVEMSHOP_API_VERSION || DEFAULT_API_VERSION,
      requestDelay: process.env.NUVEMSHOP_REQUEST_DELAY_MS
    });
  }

  static async fromStore(storeId = null) {
    if (process.env.NUVEMSHOP_STORE_ID && process.env.NUVEMSHOP_ACCESS_TOKEN) {
      return NuvemshopClient.fromEnv();
    }

    const storedToken = await readStoredTokenAsync(storeId);
    const missing = [];
    if (!storedToken?.storeId) missing.push("OAuth store_id");
    if (!storedToken?.accessToken) missing.push("OAuth access_token");
    if (!process.env.NUVEMSHOP_USER_AGENT) missing.push("NUVEMSHOP_USER_AGENT");

    if (missing.length) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }

    return new NuvemshopClient({
      storeId: storedToken.storeId,
      accessToken: storedToken.accessToken,
      userAgent: process.env.NUVEMSHOP_USER_AGENT,
      apiVersion: process.env.NUVEMSHOP_API_VERSION || DEFAULT_API_VERSION,
      requestDelay: process.env.NUVEMSHOP_REQUEST_DELAY_MS
    });
  }

  static async exchangeAuthorizationCode(code) {
    const clientId = process.env.NUVEMSHOP_CLIENT_ID;
    const clientSecret = process.env.NUVEMSHOP_CLIENT_SECRET;

    const missing = [];
    if (!clientId) missing.push("NUVEMSHOP_CLIENT_ID");
    if (!clientSecret) missing.push("NUVEMSHOP_CLIENT_SECRET");
    if (!code) missing.push("code");

    if (missing.length) {
      throw new Error(`Missing OAuth values: ${missing.join(", ")}`);
    }

    const response = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code
      })
    });

    const data = parseResponseBody(await response.text());

    if (!response.ok) {
      const detail = typeof data === "string" ? data : JSON.stringify(data);
      throw new Error(`OAuth token exchange failed ${response.status}: ${detail}`);
    }

    if (!data?.access_token || !data?.user_id) {
      throw new Error("OAuth token response did not include access_token and user_id.");
    }

    return {
      accessToken: data.access_token,
      storeId: String(data.user_id),
      scopes: data.scope || null,
      raw: data
    };
  }

  async request(endpoint, options = {}, attempt = 1) {
    await throttleRequest(this.requestDelay);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authentication: `bearer ${this.accessToken}`,
        "User-Agent": this.userAgent,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const data = parseResponseBody(await response.text());

    if ((response.status === 429 || response.status >= 500) && attempt <= 5) {
      const waitMs = Math.min(2000 * 2 ** (attempt - 1), 30000);
      logger.warn(`Nuvemshop API retornou ${response.status}. Tentativa ${attempt}/5 em ${waitMs}ms.`);
      await sleep(waitMs);
      return this.request(endpoint, options, attempt + 1);
    }

    if (!response.ok) {
      const detail = typeof data === "string" ? data : JSON.stringify(data);
      throw new Error(`Nuvemshop API ${response.status}: ${detail}`);
    }

    return data;
  }

  listProducts({ page = 1, perPage = 30, q = "" } = {}) {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (q) params.set("q", q);
    return this.request(`/products?${params.toString()}`);
  }

  getProduct(productId) {
    return this.request(`/products/${encodeURIComponent(productId)}`);
  }

  async testConnection() {
    try {
      await this.request("/products?per_page=1");
      return {
        connected: true,
        storeId: this.storeId,
        apiVersion: this.apiVersion,
        message: "Conexao com a API Nuvemshop funcionando."
      };
    } catch (error) {
      return {
        connected: false,
        storeId: this.storeId,
        apiVersion: this.apiVersion,
        message: error.message
      };
    }
  }
}

module.exports = NuvemshopClient;
