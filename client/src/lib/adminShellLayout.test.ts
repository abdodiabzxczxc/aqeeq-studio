import { describe, expect, it } from "vitest";
import { shouldReserveAdminLayout } from "./adminShellLayout";

describe("admin shell layout reservation", () => {
  it("keeps the manager layout space while the known admin session is still loading", () => {
    expect(shouldReserveAdminLayout({ isAdmin: false, isAuthLoading: true, cachedUser: { role: "admin" } })).toBe(true);
  });

  it("does not reserve the manager layout for visitors or after a signed-out result", () => {
    expect(shouldReserveAdminLayout({ isAdmin: false, isAuthLoading: true, cachedUser: null })).toBe(false);
    expect(shouldReserveAdminLayout({ isAdmin: false, isAuthLoading: false, cachedUser: { role: "admin" } })).toBe(false);
  });

  it("always reserves the manager layout for an authenticated admin", () => {
    expect(shouldReserveAdminLayout({ isAdmin: true, isAuthLoading: false, cachedUser: null })).toBe(true);
  });
});
