import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerAuthRoutes(app: Express) {
  // Legacy callback fallback redirect
  app.get("/api/oauth/callback", (req: Request, res: Response) => {
    res.redirect(302, "/");
  });

  // REST login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      return;
    }

    try {
      const cleanUsername = String(username).trim();
      const cleanPassword = String(password);

      let user = await db.getUserByUsernameOrEmail(cleanUsername);

      // Check default admin fallback
      if (!user && cleanUsername === ENV.adminUsername && cleanPassword === ENV.adminPassword) {
        await db.ensureDefaultAdmin();
        user = await db.getUserByUsernameOrEmail(cleanUsername);
      }

      if (!user) {
        res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
        return;
      }

      // Verify password
      let isValidPassword = false;
      if (user.passwordHash) {
        isValidPassword = db.verifyPassword(cleanPassword, user.passwordHash);
      } else if (cleanUsername === ENV.adminUsername && cleanPassword === ENV.adminPassword) {
        isValidPassword = true;
        // Update user password hash
        const newHash = db.hashPassword(cleanPassword);
        await db.upsertUser({ openId: user.openId, passwordHash: newHash });
      }

      if (!isValidPassword) {
        res.status(401).json({ error: "كلمة المرور غير صحيحة" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.openId,
        role: user.role,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          openId: user.openId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: sessionToken,
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // REST logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // REST current user endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user });
    } catch {
      res.json({ user: null });
    }
  });
}

// Backward-compatible alias
export const registerOAuthRoutes = registerAuthRoutes;
