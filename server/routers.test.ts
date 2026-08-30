import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "logos/test.png", url: "/manus-storage/logos/test.png" }),
  storageGetSignedUrl: vi.fn().mockResolvedValue("https://signed.example/logo.png"),
}));

vi.mock("./db", () => ({
  createAttendee: vi.fn(),
  updateAttendee: vi.fn(),
  deleteAttendee: vi.fn(),
  listAttendees: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getStats: vi.fn().mockResolvedValue({ total: 10, attended: 5, paid: 8, unpaid: 2 }),
  processQrScan: vi.fn(),
  getScanLogs: vi.fn().mockResolvedValue([]),
  getAllAttendeesForExport: vi.fn().mockResolvedValue([]),
  listNotifications: vi.fn().mockResolvedValue([]),
  getAllSettings: vi.fn().mockResolvedValue({ ceremony_logo: "/manus-storage/ceremony.png" }),
  setSetting: vi.fn().mockResolvedValue(undefined),
  ensurePlatformContentDefaults: vi.fn().mockResolvedValue(undefined),
  listPlatformContent: vi.fn().mockResolvedValue([{ id: 1, key: "home_badge", section: "الصفحة الرئيسية", label: "الشعار", value: "منصة واحدة", valueType: "text", isPublic: true }]),
  updatePlatformContent: vi.fn().mockResolvedValue({ id: 1, key: "home_badge", value: "نص جديد" }),
  updatePlatformContentWithHistory: vi.fn().mockResolvedValue({ id: 1, key: "home_badge", value: "نص جديد" }),
  resetPlatformContent: vi.fn().mockResolvedValue({ id: 1, key: "home_badge", value: "منصة واحدة" }),
  resetPlatformContentWithHistory: vi.fn().mockResolvedValue({ id: 1, key: "home_badge", value: "منصة واحدة" }),
  listPlatformContentHistory: vi.fn().mockResolvedValue([]),
  undoPlatformContentHistory: vi.fn().mockResolvedValue({ id: 1, key: "home_badge", value: "منصة واحدة" }),
  getPlatformContentByKey: vi.fn(),
  getCeremonyById: vi.fn().mockResolvedValue({ id: 42, title: "فعالية اختبار", capacity: 100, brandColor: "#c9a84c" }),
  updateCeremony: vi.fn(),
  getEventMaisonSettings: vi.fn().mockResolvedValue({ ceremonyId: 42, editionCode: "AQ–042", sealLabel: "دار العقيق", premiereTitle: "إصدار اختبار", launchPhase: "sealed", curtainState: "closed" }),
  upsertEventMaisonSettings: vi.fn().mockResolvedValue({ ceremonyId: 42, editionCode: "AQ–042", launchPhase: "live", curtainState: "opening" }),
  listMaisonVault: vi.fn().mockResolvedValue([]),
  getGuestCardByQrCode: vi.fn(),
  listEventTasks: vi.fn().mockResolvedValue([]),
  createEventTask: vi.fn().mockResolvedValue({ id: 91, ceremonyId: 42, title: "اختبار الإضاءة", status: "todo" }),
  updateEventTask: vi.fn().mockResolvedValue({ id: 91, ceremonyId: 42, title: "اختبار الإضاءة", status: "done" }),
  listSchoolNewsIssues: vi.fn().mockResolvedValue([]),
  getJournalStudioDefaults: vi.fn().mockResolvedValue({ readingMode: "spread", headerLogoUrl: null, backgroundAudioUrl: null, watermarkUrl: null, watermarkScale: 42, watermarkOpacity: 12, watermarkPosition: "center", watermarkTint: "#d6b96a" }),
  setJournalStudioDefaults: vi.fn().mockImplementation(async (defaults) => defaults),
  listAqeeqAlbums: vi.fn().mockResolvedValue([]),
  getAqeeqAlbumBySlug: vi.fn(),
  createAqeeqAlbum: vi.fn().mockResolvedValue({ id: 81, slug: "album-20260825-test", title: "ألبوم فعالية اختبار" }),
  updateAqeeqAlbum: vi.fn(),
  replaceAqeeqAlbumMedia: vi.fn().mockResolvedValue([]),
  updateAqeeqAlbumMedia: vi.fn(),
  addAqeeqAlbumMedia: vi.fn().mockResolvedValue([]),
  addAqeeqAlbumSocialMedia: vi.fn().mockResolvedValue({ media: { id: 22, sourceType: "youtube" }, added: true }),
  reorderAqeeqAlbumMedia: vi.fn().mockResolvedValue([]),
  deleteAqeeqAlbumMedia: vi.fn().mockResolvedValue({ success: true }),
  publishAqeeqAlbum: vi.fn().mockResolvedValue({ id: 81, status: "published" }),
  unpublishAqeeqAlbum: vi.fn().mockResolvedValue({ id: 81, status: "draft" }),
  deleteAqeeqAlbum: vi.fn().mockResolvedValue({ success: true }),
  listAqeeqShowcases: vi.fn().mockResolvedValue([]),
  getAqeeqShowcaseBySlug: vi.fn(),
  createAqeeqShowcase: vi.fn().mockResolvedValue({ id: 91, slug: "news-offers", title: "الأخبار والعروض" }),
  updateAqeeqShowcase: vi.fn(),
  syncAqeeqShowcasePosts: vi.fn().mockResolvedValue({ addedCount: 0, posts: [] }),
  addAqeeqShowcasePosts: vi.fn().mockResolvedValue([]),
  addAqeeqShowcaseMediaGroup: vi.fn().mockResolvedValue({ id: 23, media: [] }),
  addAqeeqShowcaseXPost: vi.fn().mockResolvedValue({ post: { id: 19, sourceType: "x" }, added: true }),
  addAqeeqShowcaseSocialPost: vi.fn().mockResolvedValue({ post: { id: 20, sourceType: "instagram" }, added: true }),
  updateAqeeqShowcasePost: vi.fn(),
  reorderAqeeqShowcasePosts: vi.fn().mockResolvedValue([]),
  deleteAqeeqShowcasePost: vi.fn().mockResolvedValue({ success: true }),
  publishAqeeqShowcase: vi.fn().mockResolvedValue({ id: 91, status: "published" }),
  unpublishAqeeqShowcase: vi.fn().mockResolvedValue({ id: 91, status: "draft" }),
  deleteAqeeqShowcase: vi.fn().mockResolvedValue({ success: true }),
  getSchoolNewsIssueBySlug: vi.fn(),
  createSchoolNewsIssue: vi.fn().mockResolvedValue({ id: 61, slug: "issue-20260816", title: "النشرة الأسبوعية" }),
  updateSchoolNewsIssue: vi.fn(),
  setSchoolNewsCover: vi.fn().mockResolvedValue({ id: 61, slug: "issue-20260816", coverUrl: "/manus-storage/cover.jpg" }),
  addSchoolNewsPages: vi.fn().mockResolvedValue([]),
  deleteSchoolNewsPage: vi.fn().mockResolvedValue({ success: true }),
  reorderSchoolNewsPages: vi.fn().mockResolvedValue([]),
  publishSchoolNewsIssue: vi.fn().mockResolvedValue({ id: 61, status: "published" }),
  getSchoolNewsMonthlyBook: vi.fn().mockResolvedValue({ monthKey: "2026-08", issues: [], pages: [] }),
  listInvitationPresets: vi.fn().mockResolvedValue([]),
  createInvitationPreset: vi.fn().mockResolvedValue({ id: 17, ceremonyId: 42, name: "نسختي الملكية" }),
  deleteInvitationPreset: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn(),
  logAudit: vi.fn(),
  listVisualElementOverrides: vi.fn().mockResolvedValue([]),
  upsertVisualElementOverride: vi.fn().mockResolvedValue({ id: 1, pagePath: "/", elementId: "home-title" }),
  deleteVisualElementOverride: vi.fn().mockResolvedValue({ success: true }),
  publishVisualElementOverride: vi.fn().mockResolvedValue({ id: 1, status: "published" }),
  listVisualElementOverrideHistory: vi.fn().mockResolvedValue([]),
  restoreVisualElementOverrideHistory: vi.fn().mockResolvedValue({ id: 1, status: "draft" }),
  listMediaAssets: vi.fn().mockResolvedValue([]),
  createMediaAsset: vi.fn().mockResolvedValue({ id: 1, url: "/manus-storage/site-media/test.png", kind: "image", fileName: "test.png" }),
  deleteMediaAsset: vi.fn().mockResolvedValue({ success: true }),
  listPageSections: vi.fn().mockResolvedValue([]),
  upsertPageSection: vi.fn().mockResolvedValue({ id: 1, sectionId: "section-hero-test", status: "draft" }),
  publishPageSection: vi.fn().mockResolvedValue({ id: 1, sectionId: "section-hero-test", status: "published" }),
  deletePageSection: vi.fn().mockResolvedValue({ success: true }),
  reorderPageSections: vi.fn().mockResolvedValue([]),
  listPageSectionHistory: vi.fn().mockResolvedValue([]),
  restorePageSectionHistory: vi.fn().mockResolvedValue({ id: 1, sectionId: "section-hero-test", status: "draft" }),
  listVisualFreeformElements: vi.fn().mockResolvedValue([]),
  upsertVisualFreeformElement: vi.fn().mockResolvedValue({ id: 1, elementId: "free-text-test", status: "draft" }),
  publishVisualFreeformElement: vi.fn().mockResolvedValue({ id: 1, elementId: "free-text-test", status: "published" }),
  deleteVisualFreeformElement: vi.fn().mockResolvedValue({ success: true }),
  listCustomPages: vi.fn().mockResolvedValue([]),
  getCustomPageBySlug: vi.fn(),
  createCustomPage: vi.fn().mockResolvedValue({ id: 1, slug: "about-event", status: "draft" }),
  updateCustomPage: vi.fn().mockResolvedValue({ id: 1, slug: "about-event", status: "published" }),
  deleteCustomPage: vi.fn().mockResolvedValue({ success: true }),
  listCustomPageHistory: vi.fn().mockResolvedValue([]),
  restoreCustomPageHistory: vi.fn().mockResolvedValue({ id: 1, slug: "about-event", status: "draft" }),
}));

vi.mock("./googleDriveAlbum", () => ({
  readGoogleDriveAlbum: vi.fn().mockResolvedValue([]),
}));

function createAdminCtx(): TrpcContext {
  const clearedCookies: any[] = [];
  return {
    user: {
      id: 1,
      openId: "admin-openid",
      email: "admin@alaqeeq.sa",
      name: "مدير النظام",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: (n: string, o: any) => clearedCookies.push({ n, o }) } as any,
  };
}

function createReceptionistCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "recep-openid",
      email: "recep@alaqeeq.sa",
      name: "موظف الاستقبال",
      loginMethod: "manus",
      role: "receptionist",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 3,
      openId: "user-openid",
      email: "user@test.com",
      name: "مستخدم عادي",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

describe("auth", () => {
  it("returns current user from auth.me", async () => {
    const ctx = createAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user?.role).toBe("admin");
  });

  it("clears session cookie on logout", async () => {
    const clearedCookies: any[] = [];
    const ctx: TrpcContext = {
      ...createAdminCtx(),
      res: { clearCookie: (n: string, o: any) => clearedCookies.push({ n, o }) } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies[0]?.n).toBe(COOKIE_NAME);
  });
});

describe("attendees.stats", () => {
  it("returns stats without authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.attendees.stats();
    expect(stats.total).toBe(10);
    expect(stats.attended).toBe(5);
  });
});

describe("attendees — role-based access", () => {
  it("admin can list attendees", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.attendees.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("receptionist cannot create attendee (FORBIDDEN)", async () => {
    const caller = appRouter.createCaller(createReceptionistCtx());
    await expect(
      caller.attendees.create({
        fullName: "محمد أحمد",
        idNumber: "1234567890",
        ticketType: "student",
        paymentStatus: "paid",
      })
    ).rejects.toThrow();
  });

  it("regular user cannot create attendee (FORBIDDEN)", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.attendees.create({
        fullName: "علي محمد",
        idNumber: "0987654321",
        ticketType: "guest",
        paymentStatus: "unpaid",
      })
    ).rejects.toThrow();
  });

  it("exports only the requested event when a ceremony is selected", async () => {
    const { getAllAttendeesForExport } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.attendees.export({ ceremonyId: 42 });
    expect(vi.mocked(getAllAttendeesForExport)).toHaveBeenCalledWith(42);
  });
});

describe("settings — role-based access", () => {
  it("public users can read logo settings", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: vi.fn() } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.getPublicLogos();
    expect(result.ceremony_logo).toBe("/manus-storage/ceremony.png");
  });

  it("regular users cannot read admin settings", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.settings.getAll()).rejects.toThrow();
  });

  it("regular users cannot update logo settings", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.settings.update({
        key: "school_logo",
        value: "/manus-storage/new-school.png",
      })
    ).rejects.toThrow();
  });

  it("admin can save a logo URL", async () => {
    const { setSetting } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.settings.update({
      key: "ceremony_logo",
      value: "/manus-storage/new-ceremony.png",
    });
    expect(result.success).toBe(true);
    expect(vi.mocked(setSetting)).toHaveBeenCalledWith(
      "ceremony_logo",
      "/manus-storage/new-ceremony.png"
    );
  });

  it("admin upload stores image bytes and returns the S3 path", async () => {
    const { setSetting } = await import("./db");
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.settings.update({
      key: "school_logo",
      value: "data:image/png;base64,aGVsbG8=",
    });
    expect(result).toEqual({ success: true, url: "/manus-storage/logos/test.png" });
    expect(vi.mocked(storagePut)).toHaveBeenCalled();
    expect(vi.mocked(setSetting)).toHaveBeenCalledWith(
      "school_logo",
      "/manus-storage/logos/test.png"
    );
  });
});

describe("notifications — event isolation", () => {
  it("loads notifications for the requested event only", async () => {
    const { listNotifications } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.notifications.list({ ceremonyId: 42, limit: 25 });
    expect(vi.mocked(listNotifications)).toHaveBeenCalledWith(25, 42);
  });
});

describe("invitation presets", () => {
  it("يحفظ قالب دعوة معدل للفعالية من خلال المدير فقط", async () => {
    const { createInvitationPreset } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.invitationPresets.create({ ceremonyId: 42, name: "نسختي الملكية", sourceTemplateId: "royal", config: JSON.stringify({ templateId: "royal", title: "دعوة" }) });
    expect(vi.mocked(createInvitationPreset)).toHaveBeenCalledWith(expect.objectContaining({ ceremonyId: 42, name: "نسختي الملكية", sourceTemplateId: "royal", createdBy: 1 }));
  });

  it("يعزل مكتبة القوالب حسب الفعالية", async () => {
    const { listInvitationPresets } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.invitationPresets.list({ ceremonyId: 42 });
    expect(vi.mocked(listInvitationPresets)).toHaveBeenCalledWith(42);
  });

  it("يمنع المستخدم العادي من إدارة القوالب الخاصة", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.invitationPresets.delete({ id: 17, ceremonyId: 42 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("scan — role-based access", () => {
  it("receptionist can process QR scan", async () => {
    const { processQrScan } = await import("./db");
    vi.mocked(processQrScan).mockResolvedValueOnce({ result: "success", attendee: { fullName: "أحمد محمد" } as any });

    const caller = appRouter.createCaller(createReceptionistCtx());
    const result = await caller.scan.process({ qrCode: "AQ-TESTCODE123" });
    expect(result.result).toBe("success");
  });

  it("admin can process QR scan", async () => {
    const { processQrScan } = await import("./db");
    vi.mocked(processQrScan).mockResolvedValueOnce({ result: "not_found", attendee: null });

    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.scan.process({ qrCode: "AQ-NOTFOUND123" });
    expect(result.result).toBe("not_found");
  });

  it("passes the selected event into the QR validation flow", async () => {
    const { processQrScan } = await import("./db");
    vi.mocked(processQrScan).mockResolvedValueOnce({ result: "success", attendee: { fullName: "سارة أحمد" } as any });
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.scan.process({ qrCode: "AQ-EVENT-123", ceremonyId: 42 });
    expect(vi.mocked(processQrScan)).toHaveBeenCalledWith("AQ-EVENT-123", 1, undefined, 42, undefined);
  });

  it("passes the selected gate into the QR validation flow", async () => {
    const { processQrScan } = await import("./db");
    vi.mocked(processQrScan).mockResolvedValueOnce({ result: "success", attendee: { fullName: "سارة أحمد" } as any });
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.scan.process({ qrCode: "AQ-GATE-123", ceremonyId: 42, gate: "البوابة الرئيسية" });
    expect(vi.mocked(processQrScan)).toHaveBeenCalledWith("AQ-GATE-123", 1, undefined, 42, "البوابة الرئيسية");
  });

  it("passes the selected event into scan log retrieval", async () => {
    const { getScanLogs } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.scan.logs({ ceremonyId: 42, limit: 25 });
    expect(vi.mocked(getScanLogs)).toHaveBeenCalledWith(25, 42);
  });

  it("regular user cannot process QR scan (FORBIDDEN)", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.scan.process({ qrCode: "AQ-TESTCODE123" })
    ).rejects.toThrow();
  });

  it("only admin can view scan logs", async () => {
    const caller = appRouter.createCaller(createReceptionistCtx());
    await expect(caller.scan.logs({})).rejects.toThrow();
  });
});

describe("event readiness tasks", () => {
  it("allows the admin to list and create readiness tasks within the selected event", async () => {
    const { listEventTasks, createEventTask } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.eventTasks.list({ ceremonyId: 42 });
    expect(vi.mocked(listEventTasks)).toHaveBeenCalledWith(42);
    await caller.eventTasks.create({ ceremonyId: 42, title: "اختبار الإضاءة", ownerLabel: "فريق القاعة", dueLabel: "قبل الافتتاح" });
    expect(vi.mocked(createEventTask)).toHaveBeenCalledWith(expect.objectContaining({ ceremonyId: 42, title: "اختبار الإضاءة", ownerLabel: "فريق القاعة", createdBy: 1 }));
  });

  it("routes a readiness status update through the protected task helper", async () => {
    const { updateEventTask } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.eventTasks.update({ id: 91, status: "done" });
    expect(vi.mocked(updateEventTask)).toHaveBeenCalledWith(91, { status: "done" });
  });

  it("blocks regular users from changing operational readiness tasks", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.eventTasks.create({ ceremonyId: 42, title: "محاولة غير مصرح بها" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("public live guest card", () => {
  it("returns the guest card payload through the public QR code route", async () => {
    const { getGuestCardByQrCode } = await import("./db");
    vi.mocked(getGuestCardByQrCode).mockResolvedValueOnce({ qrCode: "AQ-LIVE-01", fullName: "سارة أحمد", ceremonyTitle: "فعالية اختبار" } as any);
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { clearCookie: vi.fn() } as any });
    const card = await caller.attendees.guestCard({ qrCode: "AQ-LIVE-01" });
    expect(card?.fullName).toBe("سارة أحمد");
    expect(vi.mocked(getGuestCardByQrCode)).toHaveBeenCalledWith("AQ-LIVE-01");
  });
});

describe("school news journal", () => {
  it("يعرض فقط الأعداد المنشورة للزوار", async () => {
    const { listSchoolNewsIssues } = await import("./db");
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { clearCookie: vi.fn() } as any });
    await caller.schoolNews.publicList();
    expect(vi.mocked(listSchoolNewsIssues)).toHaveBeenCalledWith("published");
  });

  it("ينشئ المدير عدداً أسبوعياً باسم ورابط وتاريخ صالحين", async () => {
    const { createSchoolNewsIssue } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.schoolNews.create({ title: "نشرة العقيق الأسبوعية", slug: "issue-20260816", issueDate: "2026-08-16", seasonLabel: "موسم العقيق 2026" });
    expect(vi.mocked(createSchoolNewsIssue)).toHaveBeenCalledWith(expect.objectContaining({ title: "نشرة العقيق الأسبوعية", slug: "issue-20260816", createdBy: 1 }));
  });

  it("يحفظ المدير آخر هوية للمجلة كافتراضيات للأعداد الجديدة", async () => {
    const { setJournalStudioDefaults } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    const defaults = { readingMode: "spread" as const, headerLogoUrl: "/manus-storage/logo.png", backgroundAudioUrl: "/manus-storage/theme.mp3", watermarkUrl: "/manus-storage/watermark.png", watermarkScale: 52, watermarkOpacity: 18, watermarkPosition: "bottom-left" as const, watermarkTint: "#d6b96a" };
    await caller.schoolNews.saveStudioDefaults(defaults);
    expect(vi.mocked(setJournalStudioDefaults)).toHaveBeenCalledWith(defaults);
  });

  it("يجلب كتيب الشهر كتركيب تلقائي للأعداد المنشورة", async () => {
    const { getSchoolNewsMonthlyBook } = await import("./db");
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { clearCookie: vi.fn() } as any });
    await caller.schoolNews.monthlyBook({ monthKey: "2026-08" });
    expect(vi.mocked(getSchoolNewsMonthlyBook)).toHaveBeenCalledWith("2026-08");
  });

  it("يثبت المدير غلاف العدد كصفحة أولى", async () => {
    const { setSchoolNewsCover } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.schoolNews.setCover({ issueId: 61, imageUrl: "/manus-storage/cover.jpg", imageStorageKey: "site-media/cover.jpg" });
    expect(vi.mocked(setSchoolNewsCover)).toHaveBeenCalledWith(61, { imageUrl: "/manus-storage/cover.jpg", imageStorageKey: "site-media/cover.jpg" });
  });

  it("يحفظ ترتيب صفحات العدد ثم ينشره من تدفق المدير", async () => {
    const { reorderSchoolNewsPages, publishSchoolNewsIssue } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.schoolNews.reorderPages({ issueId: 61, pageIds: [8, 3, 1] });
    await caller.schoolNews.publish({ id: 61 });
    expect(vi.mocked(reorderSchoolNewsPages)).toHaveBeenCalledWith(61, [8, 3, 1]);
    expect(vi.mocked(publishSchoolNewsIssue)).toHaveBeenCalledWith(61);
  });

  it("يمنع المستخدم العادي من رفع أو نشر أعداد الأخبار", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.schoolNews.create({ title: "عدد غير مصرح", slug: "blocked-issue", issueDate: "2026-08-16" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.schoolNews.publish({ id: 61 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("aqeeq albums", () => {
  it("يعرض فقط الألبومات المنشورة للزوار", async () => {
    const { listAqeeqAlbums } = await import("./db");
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { clearCookie: vi.fn() } as any });
    await caller.aqeeqAlbums.publicList();
    expect(vi.mocked(listAqeeqAlbums)).toHaveBeenCalledWith("published");
  });

  it("ينشئ المدير ألبوماً جديداً برابط Drive صالح", async () => {
    const { createAqeeqAlbum } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.create({ title: "ألبوم فعالية العقيق", slug: "album-20260825-test", albumDate: "2026-08-25", driveFolderUrl: "https://drive.google.com/drive/folders/AQEEQ_2026" });
    expect(vi.mocked(createAqeeqAlbum)).toHaveBeenCalledWith(expect.objectContaining({ title: "ألبوم فعالية العقيق", slug: "album-20260825-test", createdBy: 1 }));
  });

  it("ينشئ المدير ألبوماً فارغاً ليضيف محتواه مباشرة لاحقاً", async () => {
    const { createAqeeqAlbum } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.create({ title: "ألبوم رفع مباشر", slug: "album-direct-20260825", albumDate: "2026-08-25", driveFolderUrl: null });
    expect(vi.mocked(createAqeeqAlbum)).toHaveBeenCalledWith(expect.objectContaining({ title: "ألبوم رفع مباشر", driveFolderUrl: null, createdBy: 1 }));
  });

  it("يقبل مسار التخزين المحلي للعلامة المائية أو القيمة الفارغة الصحيحة", async () => {
    const { updateAqeeqAlbum } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.update({ id: 81, watermarkUrl: "/manus-storage/site-media/watermark.png" });
    await caller.aqeeqAlbums.update({ id: 81, watermarkUrl: null });
    expect(vi.mocked(updateAqeeqAlbum)).toHaveBeenCalledWith(81, { watermarkUrl: "/manus-storage/site-media/watermark.png" });
    expect(vi.mocked(updateAqeeqAlbum)).toHaveBeenCalledWith(81, { watermarkUrl: null });
  });

  it("يضيف المدير صوراً مرفوعة ويرتبها داخل الألبوم", async () => {
    const { addAqeeqAlbumMedia, reorderAqeeqAlbumMedia } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.addMedia({ albumId: 81, media: [{ mediaUrl: "/manus-storage/album/photo.jpg", thumbnailUrl: "/manus-storage/album/photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", mediaType: "image", caption: "صورة مرفوعة" }] });
    await caller.aqeeqAlbums.reorderMedia({ albumId: 81, mediaIds: [9, 4, 7] });
    expect(vi.mocked(addAqeeqAlbumMedia)).toHaveBeenCalledWith(81, expect.arrayContaining([expect.objectContaining({ fileName: "photo.jpg", mediaType: "image" })]));
    expect(vi.mocked(reorderAqeeqAlbumMedia)).toHaveBeenCalledWith(81, [9, 4, 7]);
  });

  it("يضيف المدير رابط X أو Instagram أو YouTube إلى الألبوم", async () => {
    const { addAqeeqAlbumSocialMedia } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.addSocialMedia({ albumId: 81, source: "youtube", postUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE", caption: "فيديو النشاط" });
    expect(vi.mocked(addAqeeqAlbumSocialMedia)).toHaveBeenCalledWith(81, expect.objectContaining({ source: "youtube" }));
    await expect(caller.aqeeqAlbums.addSocialMedia({ albumId: 81, source: "x", postUrl: "رابط غير صحيح", caption: null })).rejects.toThrow();
  });

  it("يحفظ ترتيب وسائط الألبوم ثم ينشره من تدفق المدير", async () => {
    const { reorderAqeeqAlbumMedia, publishAqeeqAlbum } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqAlbums.reorderMedia({ albumId: 81, mediaIds: [7, 4, 9] });
    await caller.aqeeqAlbums.publish({ id: 81 });
    expect(vi.mocked(reorderAqeeqAlbumMedia)).toHaveBeenCalledWith(81, [7, 4, 9]);
    expect(vi.mocked(publishAqeeqAlbum)).toHaveBeenCalledWith(81);
  });

  it("يمنع المستخدم العادي من إنشاء ألبوم أو استيراد ملفات Drive", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.aqeeqAlbums.create({ title: "ألبوم غير مصرح", slug: "blocked-album", albumDate: "2026-08-25", driveFolderUrl: "https://drive.google.com/drive/folders/AQEEQ_2026" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.aqeeqAlbums.importFromDrive({ albumId: 81, driveFolderUrl: "https://drive.google.com/drive/folders/AQEEQ_2026" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("aqeeq showcases", () => {
  it("يعرض للزوار صفحات الأخبار والعروض المنشورة فقط", async () => {
    const { listAqeeqShowcases } = await import("./db");
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} } as any, res: { clearCookie: vi.fn() } as any });
    await caller.aqeeqShowcases.publicList();
    expect(vi.mocked(listAqeeqShowcases)).toHaveBeenCalledWith("published");
  });

  it("ينشئ المدير صفحة أخبار وعروض ويعتمد وصف المنشور بعد مراجعته", async () => {
    const { createAqeeqShowcase, updateAqeeqShowcasePost } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqShowcases.create({ title: "الأخبار والعروض", slug: "news-offers", driveFolderUrl: "https://drive.google.com/drive/folders/AQEEQ_2026" });
    await caller.aqeeqShowcases.updatePost({ id: 13, title: "تكريم جديد", description: "لقطة من احتفال العقيق.", isNew: false });
    expect(vi.mocked(createAqeeqShowcase)).toHaveBeenCalledWith(expect.objectContaining({ title: "الأخبار والعروض", slug: "news-offers", createdBy: 1 }));
    expect(vi.mocked(updateAqeeqShowcasePost)).toHaveBeenCalledWith(13, { title: "تكريم جديد", description: "لقطة من احتفال العقيق.", isNew: false });
  });

  it("يضيف المدير رابط منشور X مع منع الرابط غير الصالح", async () => {
    const { addAqeeqShowcaseXPost } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqShowcases.addXPost({ showcaseId: 91, xPostUrl: "https://x.com/AqeeqSchools/status/1888888888888888888", title: "خبر جديد", description: "منشور من X" });
    expect(vi.mocked(addAqeeqShowcaseXPost)).toHaveBeenCalledWith(91, expect.objectContaining({ xPostUrl: "https://x.com/AqeeqSchools/status/1888888888888888888" }));
    await expect(caller.aqeeqShowcases.addXPost({ showcaseId: 91, xPostUrl: "https://x.com/AqeeqSchools" })).rejects.toThrow();
  });

  it("يضيف المدير روابط Instagram وYouTube كمنشورات خارجية", async () => {
    const { addAqeeqShowcaseSocialPost } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqShowcases.addSocialPost({ showcaseId: 91, source: "instagram", postUrl: "https://www.instagram.com/p/DQv12_abc/", title: null, description: null });
    expect(vi.mocked(addAqeeqShowcaseSocialPost)).toHaveBeenCalledWith(91, expect.objectContaining({ source: "instagram" }));
    await expect(caller.aqeeqShowcases.addSocialPost({ showcaseId: 91, source: "youtube", postUrl: "not-a-url", title: null, description: null })).rejects.toThrow();
  });

  it("يحفظ المدير عدة صور وفيديوهات داخل خبر واحد", async () => {
    const { addAqeeqShowcaseMediaGroup } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.aqeeqShowcases.addMediaGroup({ showcaseId: 91, title: "يوم الأنشطة", description: "مجموعة صور وفيديو", media: [{ mediaUrl: "/manus-storage/feed/photo.jpg", thumbnailUrl: "/manus-storage/feed/photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", mediaType: "image" }, { mediaUrl: "/manus-storage/feed/video.mp4", thumbnailUrl: null, fileName: "video.mp4", mimeType: "video/mp4", mediaType: "video" }] });
    expect(vi.mocked(addAqeeqShowcaseMediaGroup)).toHaveBeenCalledWith(91, expect.objectContaining({ media: expect.arrayContaining([expect.objectContaining({ mediaType: "image" }), expect.objectContaining({ mediaType: "video" })]) }));
  });

  it("يمنع المستخدم العادي من مزامنة أو نشر الأخبار والعروض", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.aqeeqShowcases.syncFromDrive({ showcaseId: 91, driveFolderUrl: "https://drive.google.com/drive/folders/AQEEQ_2026" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.aqeeqShowcases.publish({ id: 91 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("control center and director AI", () => {
  it("allows only the admin to read editable platform content", async () => {
    const admin = appRouter.createCaller(createAdminCtx());
    const content = await admin.controlCenter.content.list();
    expect(content[0]?.key).toBe("home_badge");

    const regularUser = appRouter.createCaller(createUserCtx());
    await expect(regularUser.controlCenter.content.list()).rejects.toThrow();
  });

  it("records a manual content update through the admin-only history path", async () => {
    const { updatePlatformContentWithHistory } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.controlCenter.content.update({ key: "home_badge", value: "نص يدوي جديد" });
    expect(vi.mocked(updatePlatformContentWithHistory)).toHaveBeenCalledWith("home_badge", "نص يدوي جديد", 1);
  });

  it("does not allow a non-admin user to read or undo the content history", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.controlCenter.content.history({ limit: 10 })).rejects.toThrow();
    await expect(caller.controlCenter.content.undo({ id: 11 })).rejects.toThrow();
  });

  it("routes a manual history rollback through the dedicated undo helper", async () => {
    const { undoPlatformContentHistory } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.controlCenter.content.undo({ id: 11 });
    expect(vi.mocked(undoPlatformContentHistory)).toHaveBeenCalledWith(11, 1);
  });

});

describe("visual editor", () => {
  it("saves a selected visual element only for the admin", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/", elementId: "home-title", elementTag: "text", contentText: "عنوان جديد", textColor: "#ffffff", fontSize: "56px" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/", elementId: "home-title", contentText: "عنوان جديد", updatedBy: 1 }));
  });

  it("accepts Event OS homepage layer identifiers when saving from visual mode", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/", elementId: "events-hero-season-image", elementTag: "image", mediaUrl: "/manus-storage/site-media/events-hero.png" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/", elementId: "events-hero-season-image", elementTag: "image", updatedBy: 1 }));
  });

  it("stores Photoshop-style layer geometry for an original page element", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/", elementId: "home-title", elementTag: "text", layerX: 84, layerY: -36, layerWidth: 520, layerHeight: 128, layerZIndex: 12, isHidden: false });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/", elementId: "home-title", layerX: 84, layerY: -36, layerWidth: 520, layerHeight: 128, layerZIndex: 12, isHidden: false, updatedBy: 1 }));
  });

  it("accepts and saves a visual change from the event lobby", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/", elementId: "lobby-heading", elementTag: "text", contentText: "أهلاً بك في فعالياتي" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/", elementId: "lobby-heading", contentText: "أهلاً بك في فعالياتي", updatedBy: 1 }));
  });

  it("does not allow a regular user to change a visual element", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.visualEditor.save({ pagePath: "/", elementId: "home-title", elementTag: "text", contentText: "محاولة غير مصرح بها" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("publishes a visual draft only through the admin route", async () => {
    const { publishVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.publish({ pagePath: "/", elementId: "home-title" });
    expect(vi.mocked(publishVisualElementOverride)).toHaveBeenCalledWith("/", "home-title", 1);
  });

  it("returns published visual overrides through the public route only", async () => {
    const { listVisualElementOverrides } = await import("./db");
    const caller = appRouter.createCaller(createUserCtx());
    await caller.visualEditor.publicList({ pagePath: "/" });
    expect(vi.mocked(listVisualElementOverrides)).toHaveBeenCalledWith("/", "published");
  });

  it("accepts an admin visual change on a dashboard route", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/dashboard", elementId: "dashboard-overview-title", elementTag: "text", contentText: "لوحة فعالياتي" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/dashboard", elementId: "dashboard-overview-title", updatedBy: 1 }));
  });

  it("accepts visual editor routes for command, scanner, and event workspace pages", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    const targets = [
      { pagePath: "/control", elementId: "control-hero-title" },
      { pagePath: "/scan", elementId: "scan-gate-title" },
      { pagePath: "/workspace/7", elementId: "workspace-event-title" },
    ];
    for (const target of targets) await caller.visualEditor.save({ ...target, elementTag: "text", contentText: "نص اختباري" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/control", elementId: "control-hero-title" }));
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/scan", elementId: "scan-gate-title" }));
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/workspace/7", elementId: "workspace-event-title" }));
  });

  it("accepts original editable elements for new stage, memories, and journal reader pages", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    const targets = [
      { pagePath: "/event/7/stage", elementId: "stage-scene-title", elementTag: "text" as const },
      { pagePath: "/event/7/memories", elementId: "memory-title", elementTag: "text" as const },
      { pagePath: "/journal/issue/week-one", elementId: "news-reader-shell", elementTag: "section" as const },
      { pagePath: "/journal/month/2026-08", elementId: "news-monthly-shell", elementTag: "section" as const },
    ];
    for (const target of targets) await caller.visualEditor.save({ ...target, contentText: "تعديل فعلي" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/event/7/stage", elementId: "stage-scene-title" }));
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/event/7/memories", elementId: "memory-title" }));
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/journal/issue/week-one", elementId: "news-reader-shell" }));
  });

  it("allows only the admin to upload a media asset", async () => {
    const { createMediaAsset } = await import("./db");
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.media.upload({ fileName: "cover.png", mimeType: "image/png", base64: "data:image/png;base64,aGVsbG8=" });
    expect(vi.mocked(storagePut)).toHaveBeenCalled();
    expect(vi.mocked(createMediaAsset)).toHaveBeenCalledWith(expect.objectContaining({ fileName: "cover.png", kind: "image", uploadedBy: 1 }));
    const regular = appRouter.createCaller(createUserCtx());
    await expect(regular.visualEditor.media.upload({ fileName: "cover.png", mimeType: "image/png", base64: "data:image/png;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("stores an approved MP3 as an audio asset for the journal soundtrack", async () => {
    const { createMediaAsset } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.media.upload({ fileName: "journal-theme.mp3", mimeType: "audio/mpeg", base64: "data:audio/mpeg;base64,aGVsbG8=" });
    expect(vi.mocked(createMediaAsset)).toHaveBeenCalledWith(expect.objectContaining({ fileName: "journal-theme.mp3", kind: "audio", mimeType: "audio/mpeg", uploadedBy: 1 }));
  });

  it("saves and publishes a configurable page section only for the admin", async () => {
    const { upsertPageSection, publishPageSection } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.sections.save({ pagePath: "/", sectionId: "section-hero-test", sectionType: "hero", orderIndex: 0, config: { anchorId: "home-hero-after", title: "قسم جديد", titleHref: "/page/about-event", subtitle: "وصف القسم", bodyHref: "https://example.com/details", imageHref: "/page/gallery" } });
    expect(vi.mocked(upsertPageSection)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/", sectionId: "section-hero-test", updatedBy: 1, config: expect.stringContaining("home-hero-after") }));
    expect(vi.mocked(upsertPageSection)).toHaveBeenCalledWith(expect.objectContaining({ config: expect.stringContaining("about-event") }));
    await caller.visualEditor.sections.save({ pagePath: "/", sectionId: "section-custom-image", sectionType: "custom", orderIndex: 1, config: { builderElement: "image", title: "صورة جديدة", imageUrl: "/manus-storage/site-media/new-image.png" } });
    expect(vi.mocked(upsertPageSection)).toHaveBeenCalledWith(expect.objectContaining({ sectionId: "section-custom-image", config: expect.stringContaining("builderElement") }));
    await caller.visualEditor.sections.save({ pagePath: "/", sectionId: "section-custom-icon", sectionType: "custom", orderIndex: 2, config: { builderElement: "icon", iconName: "calendar", title: "موعد الفعالية" } });
    expect(vi.mocked(upsertPageSection)).toHaveBeenCalledWith(expect.objectContaining({ sectionId: "section-custom-icon", config: expect.stringContaining("calendar") }));
    await caller.visualEditor.sections.publish({ pagePath: "/", sectionId: "section-hero-test" });
    expect(vi.mocked(publishPageSection)).toHaveBeenCalledWith("/", "section-hero-test", 1);
    const regular = appRouter.createCaller(createUserCtx());
    await expect(regular.visualEditor.sections.save({ pagePath: "/", sectionId: "section-hero-other", sectionType: "hero", orderIndex: 0, config: { title: "غير مصرح" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("serves published sections publicly and creates custom pages through the admin route", async () => {
    const { listPageSections, createCustomPage } = await import("./db");
    const publicCaller = appRouter.createCaller(createUserCtx());
    await publicCaller.visualEditor.sections.publicList({ pagePath: "/page/about-event" });
    expect(vi.mocked(listPageSections)).toHaveBeenCalledWith("/page/about-event", "published");
    const admin = appRouter.createCaller(createAdminCtx());
    await admin.visualEditor.pages.create({ slug: "about-event", title: "عن الفعالية", navLabel: "عن الفعالية" });
    expect(vi.mocked(createCustomPage)).toHaveBeenCalledWith(expect.objectContaining({ slug: "about-event", createdBy: 1, status: "draft" }));
  });

  it("saves native image and logo properties through the visual editor", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.save({ pagePath: "/", elementId: "home-hero-logo", elementTag: "image", mediaUrl: "/manus-storage/site-media/hero-logo.png", altText: "شعار الفعالية", linkUrl: "/page/about-event", alignment: "center" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ elementTag: "image", mediaUrl: "/manus-storage/site-media/hero-logo.png", altText: "شعار الفعالية", linkUrl: "/page/about-event", alignment: "center" }));
  });

  it("saves and publishes a positioned freeform element only for the admin", async () => {
    const { upsertVisualFreeformElement, publishVisualFreeformElement } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.freeform.save({ pagePath: "/", elementId: "free-text-test", elementType: "text", preset: "display", content: { text: "عنوان يُسحب إلى الصفحة", textAlign: "center" }, positionX: 520, positionY: 360, width: 720, height: 150, zIndex: 3 });
    expect(vi.mocked(upsertVisualFreeformElement)).toHaveBeenCalledWith(expect.objectContaining({ elementId: "free-text-test", positionX: 520, updatedBy: 1 }));
    await caller.visualEditor.freeform.save({ pagePath: "/", elementId: "free-image-resized", elementType: "image", preset: "cover", content: { mediaUrl: "/manus-storage/site-media/cover.png", altText: "صورة غلاف", linkUrl: "/page/about-event", objectFit: "cover" }, positionX: 780, positionY: 612, width: 460, height: 260, zIndex: 4 });
    expect(vi.mocked(upsertVisualFreeformElement)).toHaveBeenCalledWith(expect.objectContaining({ elementId: "free-image-resized", positionX: 780, positionY: 612, width: 460, height: 260, content: expect.stringContaining("about-event") }));
    await caller.visualEditor.freeform.publish({ pagePath: "/", elementId: "free-text-test" });
    expect(vi.mocked(publishVisualFreeformElement)).toHaveBeenCalledWith("/", "free-text-test", 1);
    const regular = appRouter.createCaller(createUserCtx());
    await expect(regular.visualEditor.freeform.save({ pagePath: "/", elementId: "free-text-other", elementType: "text", preset: "paragraph", content: { text: "غير مسموح" }, positionX: 400, positionY: 400, width: 300, height: 80, zIndex: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the admin to inspect and restore section and page history", async () => {
    const { listPageSectionHistory, restorePageSectionHistory, listCustomPageHistory, restoreCustomPageHistory } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    await caller.visualEditor.sections.history({ pagePath: "/", sectionId: "section-hero-test" });
    expect(vi.mocked(listPageSectionHistory)).toHaveBeenCalledWith("/", "section-hero-test", 25);
    await caller.visualEditor.sections.restore({ id: 21 });
    expect(vi.mocked(restorePageSectionHistory)).toHaveBeenCalledWith(21, 1);
    await caller.visualEditor.pages.history({ pageId: 9 });
    expect(vi.mocked(listCustomPageHistory)).toHaveBeenCalledWith(9, 25);
    await caller.visualEditor.pages.restore({ id: 31 });
    expect(vi.mocked(restoreCustomPageHistory)).toHaveBeenCalledWith(31, 1);
  });

  it("accepts editable Maison Alaqeeq pages and their native elements", async () => {
    const { upsertVisualElementOverride } = await import("./db");
    const caller = appRouter.createCaller(createAdminCtx());
    const targets = [
      { pagePath: "/maison", elementId: "maison-vault-title", elementTag: "text" as const },
      { pagePath: "/event/7/premiere", elementId: "maison-premiere-title", elementTag: "text" as const },
      { pagePath: "/event/7/honor", elementId: "maison-honor-title", elementTag: "text" as const },
      { pagePath: "/event/7/portrait", elementId: "maison-portrait-quote", elementTag: "text" as const },
    ];
    for (const target of targets) await caller.visualEditor.save({ ...target, contentText: "تعديل دار العقيق" });
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/event/7/premiere", elementId: "maison-premiere-title" }));
    expect(vi.mocked(upsertVisualElementOverride)).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/maison", elementId: "maison-vault-title" }));
  });
});

describe("Maison Alaqeeq", () => {
  it("serves the public identity and vault without requiring an admin session", async () => {
    const { getEventMaisonSettings, listMaisonVault } = await import("./db");
    const caller = appRouter.createCaller(createUserCtx());
    await caller.ceremonies.maison.public({ ceremonyId: 42 });
    await caller.ceremonies.maison.vault();
    expect(vi.mocked(getEventMaisonSettings)).toHaveBeenCalledWith(42);
    expect(vi.mocked(listMaisonVault)).toHaveBeenCalled();
  });

  it("allows only the admin to launch the event or operate the curtain", async () => {
    const { upsertEventMaisonSettings } = await import("./db");
    const admin = appRouter.createCaller(createAdminCtx());
    await admin.ceremonies.maison.update({ ceremonyId: 42, launchPhase: "live", curtainState: "opening" });
    expect(vi.mocked(upsertEventMaisonSettings)).toHaveBeenCalledWith(42, expect.objectContaining({ launchPhase: "live", curtainState: "opening", updatedBy: 1 }));
    const regular = appRouter.createCaller(createUserCtx());
    await expect(regular.ceremonies.maison.update({ ceremonyId: 42, launchPhase: "live" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
