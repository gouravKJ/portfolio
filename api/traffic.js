import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_COUNTER_FILE = path.join(__dirname, "..", ".traffic-counter.json");

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.TRAFFIC_REDIS_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.TRAFFIC_REDIS_TOKEN;

const TOTAL_KEY = process.env.TRAFFIC_TOTAL_KEY || "portfolio_views";
const UNIQUE_KEY = process.env.TRAFFIC_UNIQUE_KEY || "portfolio_unique_views";
const ACTIVE_KEY = process.env.TRAFFIC_ACTIVE_KEY || "portfolio_active_visitors";
const VISITOR_PREFIX = process.env.TRAFFIC_VISITOR_PREFIX || "portfolio_visitor:";
const ACTIVE_WINDOW_MS = Number(process.env.TRAFFIC_ACTIVE_WINDOW_MS || 5 * 60 * 1000);

function getHeader(req, name) {
  const value = req.headers?.[name.toLowerCase()] || req.headers?.[name];
  return Array.isArray(value) ? value[0] : value || "";
}

function getClientIp(req) {
  const forwarded =
    getHeader(req, "x-vercel-forwarded-for") ||
    getHeader(req, "x-forwarded-for") ||
    getHeader(req, "cf-connecting-ip") ||
    getHeader(req, "x-real-ip");

  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "127.0.0.1";
}

function getVisitorId(req) {
  const salt = process.env.TRAFFIC_VISITOR_SALT || REDIS_TOKEN || "traffic-salt";
  const ip = getClientIp(req);
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

let localData = { total: 100, visitors: {}, active: {} };
try {
  if (fs.existsSync(LOCAL_COUNTER_FILE)) {
    localData = JSON.parse(fs.readFileSync(LOCAL_COUNTER_FILE, "utf8"));
  }
} catch (e) {}

function saveLocalData() {
  try {
    fs.writeFileSync(LOCAL_COUNTER_FILE, JSON.stringify(localData, null, 2));
  } catch (e) {}
}

function getLocalSnapshot(visitorId, isTrack = false) {
  const now = Date.now();
  const oldestActive = now - ACTIVE_WINDOW_MS;

  if (!localData.visitors) localData.visitors = {};
  if (!localData.active) localData.active = {};

  if (isTrack) {
    localData.total = (localData.total || 0) + 1;
    localData.visitors[visitorId] = now;
  }

  localData.active[visitorId] = now;

  Object.keys(localData.active).forEach((vId) => {
    if (localData.active[vId] < oldestActive) {
      delete localData.active[vId];
    }
  });

  saveLocalData();

  return {
    total: localData.total || 0,
    unique: Object.keys(localData.visitors).length,
    active: Math.max(1, Object.keys(localData.active).length),
    updatedAt: new Date(now).toISOString(),
  };
}

async function redis(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error("Missing Redis credentials");
  }

  const commandPath = [command, ...args].map((part) => encodeURIComponent(String(part))).join("/");
  const response = await fetch(`${REDIS_URL}/${commandPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `Redis error ${response.status}`);
  }

  return data.result;
}

async function touchActiveVisitor(visitorId, now) {
  const oldestActive = now - ACTIVE_WINDOW_MS;
  await redis("ZADD", ACTIVE_KEY, now, visitorId);
  await redis("ZREMRANGEBYSCORE", ACTIVE_KEY, 0, oldestActive);
  return Number(await redis("ZCARD", ACTIVE_KEY)) || 0;
}

async function getTrafficSnapshot(visitorId) {
  const now = Date.now();
  const [total, unique, active] = await Promise.all([
    redis("GET", TOTAL_KEY),
    redis("GET", UNIQUE_KEY),
    touchActiveVisitor(visitorId, now),
  ]);

  return {
    total: Number(total) || 0,
    unique: Number(unique) || 0,
    active,
    updatedAt: new Date(now).toISOString(),
  };
}

async function trackPageview(visitorId) {
  const now = Date.now();
  const visitorKey = `${VISITOR_PREFIX}${visitorId}`;

  const [total, uniqueMarker] = await Promise.all([
    redis("INCR", TOTAL_KEY),
    redis("SET", visitorKey, 1, "NX"),
  ]);

  const [unique, active] = await Promise.all([
    uniqueMarker === "OK" ? redis("INCR", UNIQUE_KEY) : redis("GET", UNIQUE_KEY),
    touchActiveVisitor(visitorId, now),
  ]);

  return {
    total: Number(total) || 0,
    unique: Number(unique) || 0,
    active,
    updatedAt: new Date(now).toISOString(),
  };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.end(JSON.stringify(payload));
}

export default async function trafficHandler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.statusCode = 204;
    res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
    res.end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const visitorId = getVisitorId(req);

  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const snapshot = req.method === "POST"
        ? await trackPageview(visitorId)
        : await getTrafficSnapshot(visitorId);
      sendJson(res, 200, snapshot);
      return;
    } catch (error) {}
  }

  const snapshot = getLocalSnapshot(visitorId, req.method === "POST");
  sendJson(res, 200, snapshot);
}
