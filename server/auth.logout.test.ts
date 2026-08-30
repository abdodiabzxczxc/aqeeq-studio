import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { hashPassword, verifyPassword } from "./db";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type SetCookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user: AuthenticatedUser | null = null): {
  ctx: TrpcContext;
  clearedCookies: CookieCall[];
  setCookies: SetCookieCall[];
} {
  const clearedCookies: CookieCall[] = [];
  const setCookies: SetCookieCall[] = [];

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies, setCookies };
}

describe("نظام المصادقة وتشفير كلمات المرور (Standalone Auth)", () => {
  it("يقوم بتشفير كلمة المرور والتحقق منها بدقة", () => {
    const password = "mySecurePassword123";
    const hashed = hashPassword(password);

    expect(hashed).toContain(":");
    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword("wrongPassword", hashed)).toBe(false);
  });

  it("auth.logout: يقوم بمسح ملف تعريف الارتباط للجلسة بنجاح", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "sample-user",
      email: "sample@example.com",
      name: "Sample User",
      passwordHash: null,
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const { ctx, clearedCookies } = createAuthContext(user);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });

  it("auth.login: ينجح في تسجيل الدخول بحساب المدير الافتراضي", async () => {
    const { ctx, setCookies } = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      username: "admin",
      password: "aqeeq2026",
    });

    expect(result.user).toBeDefined();
    expect(result.user.role).toBe("admin");
    expect(result.token).toBeDefined();
    expect(setCookies.length).toBeGreaterThan(0);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("auth.login: يرفض تسجيل الدخول عند إدخال كلمة مرور خاطئة", async () => {
    const { ctx } = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        username: "admin",
        password: "incorrect-password",
      })
    ).rejects.toThrow("غير صحيحة");
  });
});
