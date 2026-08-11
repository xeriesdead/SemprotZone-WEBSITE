import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-admin_session"
    : "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminSession = {
  sub: "admin";
  exp: number;
};

function getAuthConfig() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET) {
    return null;
  }
  return { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET };
}

export function isAdminAuthConfigured() {
  return getAuthConfig() !== null;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function readCookie(request: Request) {
  const header = request.headers.cookie;
  if (!header) return null;

  const cookie = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return cookie?.slice(SESSION_COOKIE_NAME.length + 1) || null;
}

function verifySession(request: Request): AdminSession | null {
  const config = getAuthConfig();
  const rawCookie = readCookie(request);
  if (!config || !rawCookie) return null;

  const separator = rawCookie.lastIndexOf(".");
  if (separator <= 0) return null;

  const encodedPayload = rawCookie.slice(0, separator);
  const providedSignature = rawCookie.slice(separator + 1);
  const expectedSignature = sign(encodedPayload, config.SESSION_SECRET);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSession;
    if (session.sub !== "admin" || !Number.isFinite(session.exp)) return null;
    if (session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function setSessionCookie(response: Response) {
  const config = getAuthConfig();
  if (!config) return;

  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    } satisfies AdminSession),
  ).toString("base64url");
  const signature = sign(payload, config.SESSION_SECRET);
  const secure = process.env.NODE_ENV === "production";

  response.setHeader(
    "Set-Cookie",
    [
      `${SESSION_COOKIE_NAME}=${payload}.${signature}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${SESSION_TTL_SECONDS}`,
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
}

export function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production";
  response.setHeader(
    "Set-Cookie",
    [
      `${SESSION_COOKIE_NAME}=`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0",
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
}

export const requireAdmin: RequestHandler = (
  request,
  response,
  next: NextFunction,
) => {
  if (!isAdminAuthConfigured()) {
    response.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }
  if (!verifySession(request)) {
    response.status(401).json({ error: "Admin login required" });
    return;
  }
  next();
};

export function handleAdminLogin(request: Request, response: Response) {
  const config = getAuthConfig();
  if (!config) {
    response.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }

  const { username, password } = request.body as {
    username?: unknown;
    password?: unknown;
  };
  const suppliedUsername = typeof username === "string" ? username : "";
  const suppliedPassword = typeof password === "string" ? password : "";
  const usernameMatches =
    suppliedUsername.length === config.ADMIN_USERNAME.length &&
    timingSafeEqual(
      Buffer.from(suppliedUsername),
      Buffer.from(config.ADMIN_USERNAME),
    );
  const passwordMatches =
    suppliedPassword.length === config.ADMIN_PASSWORD.length &&
    timingSafeEqual(
      Buffer.from(suppliedPassword),
      Buffer.from(config.ADMIN_PASSWORD),
    );

  if (!usernameMatches || !passwordMatches) {
    response.status(401).json({ error: "Username atau password salah" });
    return;
  }

  setSessionCookie(response);
  response.json({ authenticated: true });
}

export function isAdminAuthenticated(request: Request) {
  return verifySession(request) !== null;
}