import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export type SessionPayload = {
  openId: string;
  name: string;
  role?: string;
};

export type AuthenticatedUser = User;

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a signed JWT session token
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string; role?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        name: options.name || "",
        role: options.role || "admin",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      name: payload.name,
      role: payload.role || "admin",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; name: string; role?: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, name, role } = payload as Record<string, unknown>;

      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing required openId");
        return null;
      }

      return {
        openId: String(openId),
        name: String(name || ""),
        role: typeof role === "string" ? role : undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    // 1. Prefer HTTP-only session cookie
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);

    // 2. Fallback to Authorization Bearer header
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7).trim();
      }
    }

    const session = await this.verifySession(sessionToken);

    if (!session) {
      throw ForbiddenError("Invalid session");
    }

    const sessionUserId = session.openId;
    let user = await db.getUserByUsernameOrEmail(sessionUserId);

    if (!user) {
      // Fallback for configured default admin
      if (sessionUserId === ENV.adminUsername) {
        user = {
          id: 1,
          openId: ENV.adminUsername,
          name: ENV.adminName,
          email: ENV.adminEmail,
          passwordHash: null,
          loginMethod: "password",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
      } else {
        throw ForbiddenError("User not found");
      }
    }

    return user;
  }
}

export const sdk = new SDKServer();
