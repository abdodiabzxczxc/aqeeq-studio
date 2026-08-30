import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, adminAuditorProcedure, adminCoordinatorProcedure, adminCoordinatorAuditorProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getUserByUsernameOrEmail,
  verifyPassword,
  hashPassword,
  ensureDefaultAdmin,
  upsertUser,
  createAttendee,

  bulkCreateAttendees,
  deleteAttendee,
  getAllAttendeesForExport,
  getScanLogs,
  getStats,
  getAdvancedStats,
  listAttendees,
  processQrScan,
  updateAttendee,
  listCeremonies,
  listCeremonyMetrics,
  getActiveCeremony,
  getCeremonyById,
  createCeremony,
  updateCeremony,
  setActiveCeremony,
  getEventMaisonSettings,
  upsertEventMaisonSettings,
  listMaisonVault,
  listInvitationPresets,
  createInvitationPreset,
  deleteInvitationPreset,
  listAuditLogs,
  logAudit,
  listUsers,
  updateUserRole,
  listNotifications,
  createNotification,
  getBackupSnapshot,
  restoreBackupSnapshot,
  publishNotification,
  getPublicNotifications,
  getGuestCardByQrCode,
  listEventTasks,
  createEventTask,
  updateEventTask,
  listSchoolNewsIssues,
  getSchoolNewsIssueBySlug,
  createSchoolNewsIssue,
  updateSchoolNewsIssue,
  setSchoolNewsCover,
  addSchoolNewsPages,
  deleteSchoolNewsPage,
  updateSchoolNewsPage,
  reorderSchoolNewsPages,
  deleteSchoolNewsIssue,
  publishSchoolNewsIssue,
  getSchoolNewsMonthlyBook,
  getJournalStudioDefaults,
  setJournalStudioDefaults,
  listAqeeqAlbums,
  listAllPublicAlbumMedia,
  getAqeeqAlbumBySlug,
  createAqeeqAlbum,
  updateAqeeqAlbum,
  replaceAqeeqAlbumMedia,
  updateAqeeqAlbumMedia,
  addAqeeqAlbumMedia,
  addAqeeqAlbumSocialMedia,
  reorderAqeeqAlbumMedia,
  deleteAqeeqAlbumMedia,
  publishAqeeqAlbum,
  unpublishAqeeqAlbum,
  deleteAqeeqAlbum,
  listAqeeqShowcases,
  getAqeeqShowcaseBySlug,
  createAqeeqShowcase,
  updateAqeeqShowcase,
  syncAqeeqShowcasePosts,
  addAqeeqShowcasePosts,
  addAqeeqShowcaseMediaGroup,
  addAqeeqShowcaseXPost,
  addAqeeqShowcaseSocialPost,
  updateAqeeqShowcasePost,
  recordAqeeqContentView,
  reorderAqeeqShowcasePosts,
  deleteAqeeqShowcasePost,
  publishAqeeqShowcase,
  unpublishAqeeqShowcase,
  deleteAqeeqShowcase,
  createAdminUser,
  resetUserPassword,
  deleteUserById,
  getSiteBroadcast,
  setSiteBroadcast,
  listSiteBroadcastItems,
  saveSiteBroadcastItem,
  deleteSiteBroadcastItem,
  toggleSiteBroadcastItem,
  getSiteOrchestration,
  setSiteOrchestration,
  hideSiteStory,
  unhideSiteStory,
  getAqeeqAnalyticsSummary,
  type SiteBroadcast,
} from "./db";
import { generateAiNewsStory, generateAiAlbumDescription } from "./aiStoryService";
import { readGoogleDriveAlbum, getDrivePdfFileId } from "./googleDriveAlbum";
import { invitationRouter } from "./routers/invitation";
import { settingsRouter } from "./routers/settings";
import { controlCenterRouter } from "./routers/controlCenter";
import { visualEditorRouter } from "./routers/visualEditor";
import { homepageRouter } from "./routers/homepage";
import { getAqeeqXPostEmbed } from "./xPostEmbed";
import {
  getPublishedArticles,
  getArticleBySlug,
  submitGuestArticle,
  createAdminArticle,
  listAllArticles,
  moderateArticle,
  deleteArticle,
  likeArticle,
  aiPolishArticle,
} from "./articlesDb";
import {
  getPodcasts,
  getPodcastBySlug,
  createPodcast,
  updatePodcast,
  deletePodcast,
  likePodcast,
} from "./podcastDb";
import { askSchoolAiAssistant } from "./schoolAiAssistant";
import {
  getLiveEvent,
  listAllLiveEvents,
  addEventMoment,
  reactToEvent,
  setEventStatus,
} from "./liveEventsDb";
import {
  WALKIE_CHANNELS,
  listWalkieMessages,
  sendWalkieDispatch,
} from "./walkieDb";

// Middleware: Admin or Receptionist (staff)
const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "receptionist" && ctx.user.role !== "coordinator") {
    throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بالوصول" });
  }
  return next({ ctx });
});

const journalStudioDefaultsInput = z.object({
  readingMode: z.enum(["spread", "scroll"]),
  headerLogoUrl: z.string().max(1024).nullable(),
  backgroundAudioUrl: z.string().max(1024).nullable(),
  watermarkUrl: z.string().max(1024).nullable(),
  watermarkScale: z.number().int().min(20).max(90),
  watermarkOpacity: z.number().int().min(0).max(60),
  watermarkPosition: z.enum(["center", "top-right", "bottom-left", "bottom-right"]),
  watermarkTint: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const storedMediaUrl = z.string().trim().min(1).max(1024).refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "رابط الملف غير صالح");

const aqeeqAlbumInput = z.object({
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(128),
  albumDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ceremonyId: z.number().int().positive().nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  driveFolderUrl: z.string().url().max(1024).nullable().optional(),
  coverUrl: storedMediaUrl.nullable().optional(),
  readingMode: z.enum(["spread", "scroll", "gallery"]).optional(),
  headerLogoUrl: storedMediaUrl.nullable().optional(),
  backgroundAudioUrl: storedMediaUrl.nullable().optional(),
  watermarkUrl: storedMediaUrl.nullable().optional(),
  watermarkScale: z.number().int().min(20).max(90).optional(),
  watermarkOpacity: z.number().int().min(0).max(60).optional(),
  watermarkPosition: z.enum(["center", "top-right", "bottom-left", "bottom-right"]).optional(),
  watermarkTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const aqeeqShowcaseInput = z.object({
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(128),
  intro: z.string().max(4000).nullable().optional(),
  driveFolderUrl: z.string().url().max(1024).nullable().optional(),
  readerTheme: z.enum(["dark", "light"]).optional(),
  headerLogoUrl: storedMediaUrl.nullable().optional(),
  backgroundAudioUrl: storedMediaUrl.nullable().optional(),
  watermarkUrl: storedMediaUrl.nullable().optional(),
  watermarkScale: z.number().int().min(20).max(90).optional(),
  watermarkOpacity: z.number().int().min(0).max(60).optional(),
  watermarkPosition: z.enum(["center", "top-right", "bottom-left", "bottom-right"]).optional(),
  watermarkTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1, "اسم المستخدم مطلوب"),
          password: z.string().min(1, "كلمة المرور مطلوبة"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const cleanUsername = input.username.trim();
        const cleanPassword = input.password;

        let user = await getUserByUsernameOrEmail(cleanUsername);

        if (!user && cleanUsername === ENV.adminUsername && cleanPassword === ENV.adminPassword) {
          await ensureDefaultAdmin();
          user = await getUserByUsernameOrEmail(cleanUsername);
        }

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "اسم المستخدم أو كلمة المرور غير صحيحة",
          });
        }

        let isValid = false;
        if (user.passwordHash) {
          isValid = verifyPassword(cleanPassword, user.passwordHash);
        } else if (cleanUsername === ENV.adminUsername && cleanPassword === ENV.adminPassword) {
          isValid = true;
          const newHash = hashPassword(cleanPassword);
          await upsertUser({ openId: user.openId, passwordHash: newHash });
        }

        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "اسم المستخدم أو كلمة المرور غير صحيحة",
          });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.openId,
          role: user.role,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token: sessionToken,
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),


  // ==================== Users & Roles ====================
  users: router({
    list: adminProcedure.query(() => listUsers()),
    updateRole: adminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin", "receptionist", "coordinator", "auditor"]) }))
      .mutation(async ({ input, ctx }) => {
        const updated = await updateUserRole(input.id, input.role);
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "user.role_update", details: JSON.stringify({ targetUserId: input.id, role: input.role }) });
        return updated;
      }),
  }),

  // ==================== Attendees ====================
  attendees: router({
    list: adminCoordinatorAuditorProcedure
      .input(
        z.object({
          search: z.string().optional(),
          ticketType: z.string().optional(),
          paymentStatus: z.string().optional(),
          attended: z.boolean().optional(),
          ceremonyId: z.number().optional(),
          section: z.string().optional(),
          gate: z.string().optional(),
          limit: z.number().min(1).max(500).optional(),
          offset: z.number().min(0).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return listAttendees(input ?? {});
      }),

    stats: publicProcedure
      .input(z.object({ ceremonyId: z.number().optional() }).optional())
      .query(async ({ input }) => getStats(input?.ceremonyId)),

    guestCard: publicProcedure
      .input(z.object({ qrCode: z.string().min(6).max(100) }))
      .query(({ input }) => getGuestCardByQrCode(input.qrCode)),

    create: adminCoordinatorProcedure
      .input(
        z.object({
          fullName: z.string().min(2, "الاسم مطلوب"),
          idNumber: z.string().min(1, "رقم الهوية مطلوب"),
          ticketType: z.enum(["student", "guardian", "guest", "vip"]),
          paymentStatus: z.enum(["paid", "unpaid", "exempt"]),
          notes: z.string().optional(),
          seatNumber: z.string().optional(),
          section: z.string().optional(),
          gate: z.string().optional(),
          ceremonyId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createAttendee({ ...input, createdBy: ctx.user.id });
      }),

    update: adminCoordinatorProcedure
      .input(
        z.object({
          id: z.number(),
          fullName: z.string().min(2).optional(),
          idNumber: z.string().min(1).optional(),
          ticketType: z.enum(["student", "guardian", "guest", "vip"]).optional(),
          paymentStatus: z.enum(["paid", "unpaid", "exempt"]).optional(),
          notes: z.string().optional(),
          seatNumber: z.string().optional(),
          section: z.string().optional(),
          gate: z.string().optional(),
          ceremonyId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return updateAttendee(id, data);
      }),

    delete: adminCoordinatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteAttendee(input.id);
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "attendee.delete", details: JSON.stringify({ attendeeId: input.id }) });
        return { success: true };
      }),

    bulkCreate: adminCoordinatorProcedure
      .input(z.object({
        rows: z.array(z.object({
          fullName: z.string(),
          idNumber: z.string(),
          ticketType: z.enum(["student", "guardian", "guest", "vip"]).default("guest"),
          paymentStatus: z.enum(["paid", "unpaid", "exempt"]).default("unpaid"),
          notes: z.string().optional(),
          seatNumber: z.string().optional(),
          section: z.string().optional(),
          gate: z.string().optional(),
          ceremonyId: z.number().optional(),
          createdBy: z.number().optional(),
        })).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await bulkCreateAttendees(input.rows.map((row) => ({ ...row, createdBy: ctx.user.id })));
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "attendee.bulk_import", details: JSON.stringify({ inserted: result.inserted, duplicates: result.duplicates.length, invalid: result.invalid.length }) });
        return result;
      }),

    export: adminCoordinatorProcedure.input(z.object({ ceremonyId: z.number().optional() }).optional()).query(async ({ input }) => {
      return getAllAttendeesForExport(input?.ceremonyId);
    }),
  }),

  // ==================== Ceremonies ====================
  ceremonies: router({
    public: publicProcedure.input(z.object({ id: z.number().optional() }).optional()).query(({ input }) => input?.id ? getCeremonyById(input.id) : getActiveCeremony()),
    metrics: adminCoordinatorAuditorProcedure.query(() => listCeremonyMetrics()),
    list: adminCoordinatorAuditorProcedure.query(() => listCeremonies()),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(2),
        eventType: z.string().min(2).default("custom"),
        subtitle: z.string().optional(),
        logoUrl: z.string().max(512).optional(),
        brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
        fontFamily: z.enum(["Tajawal", "Cairo", "Amiri", "Noto Kufi Arabic"]).optional(),
        templateId: z.enum(["royal", "minimal", "modern", "luxury", "floral", "midnight", "pearl", "aurora", "sapphire", "rose", "obsidian", "artdeco", "celestial", "heritage", "cinema", "custom"]).optional(),
        invitationTitle: z.string().max(255).optional(),
        invitationSubtitle: z.string().max(4000).optional(),
        sections: z.string().max(4000).optional(),
        gates: z.string().max(4000).optional(),
        seatLabels: z.string().max(12000).optional(),
        venue: z.string().optional(),
        ceremonyDate: z.string().optional(),
        ceremonyTime: z.string().optional(),
        invitationBackgroundUrl: z.string().max(1024).optional(),
        invitationDate: z.string().max(128).optional(),
        invitationVenue: z.string().max(255).optional(),
        invitationDressCode: z.string().max(255).optional(),
        invitationCustomTemplateName: z.string().max(128).optional(),
        invitationLayout: z.string().max(4000).optional(),
        experienceWorld: z.string().max(64).optional(),
        storyLine: z.string().max(4000).optional(),
        trailerUrl: z.string().max(1024).optional(),
        stageScenes: z.string().max(12000).optional(),
        memoryCoverUrl: z.string().max(1024).optional(),
        seasonOrder: z.number().int().min(0).max(999).optional(),
        capacity: z.number().int().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const ceremony = await createCeremony(input);
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: ceremony.id, action: "ceremony.create", details: JSON.stringify(input) });
        return ceremony;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(2).optional(),
        eventType: z.string().min(2).optional(),
        subtitle: z.string().optional(),
        logoUrl: z.string().max(512).optional(),
        brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
        fontFamily: z.enum(["Tajawal", "Cairo", "Amiri", "Noto Kufi Arabic"]).optional(),
        templateId: z.enum(["royal", "minimal", "modern", "luxury", "floral", "midnight", "pearl", "aurora", "sapphire", "rose", "obsidian", "artdeco", "celestial", "heritage", "cinema", "custom"]).optional(),
        invitationTitle: z.string().max(255).optional(),
        invitationSubtitle: z.string().max(4000).optional(),
        sections: z.string().max(4000).optional(),
        gates: z.string().max(4000).optional(),
        seatLabels: z.string().max(12000).optional(),
        venue: z.string().optional(),
        ceremonyDate: z.string().optional(),
        ceremonyTime: z.string().optional(),
        invitationBackgroundUrl: z.string().max(1024).optional(),
        invitationDate: z.string().max(128).optional(),
        invitationVenue: z.string().max(255).optional(),
        invitationDressCode: z.string().max(255).optional(),
        invitationCustomTemplateName: z.string().max(128).optional(),
        invitationLayout: z.string().max(4000).optional(),
        experienceWorld: z.string().max(64).optional(),
        storyLine: z.string().max(4000).optional(),
        trailerUrl: z.string().max(1024).optional(),
        stageScenes: z.string().max(12000).optional(),
        memoryCoverUrl: z.string().max(1024).optional(),
        seasonOrder: z.number().int().min(0).max(999).optional(),
        capacity: z.number().int().min(1).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const ceremony = await updateCeremony(id, data);
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: id, action: "ceremony.update", details: JSON.stringify({ id, ...data }) });
        return ceremony;
      }),
    activate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ceremony = await setActiveCeremony(input.id);
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.id, action: "ceremony.activate", details: JSON.stringify(input) });
        return ceremony;
      }),
    maison: router({
      public: publicProcedure.input(z.object({ ceremonyId: z.number().int().positive() })).query(({ input }) => getEventMaisonSettings(input.ceremonyId)),
      vault: publicProcedure.query(() => listMaisonVault()),
      admin: adminProcedure.input(z.object({ ceremonyId: z.number().int().positive() })).query(({ input }) => getEventMaisonSettings(input.ceremonyId)),
      update: adminProcedure.input(z.object({
        ceremonyId: z.number().int().positive(),
        editionCode: z.string().trim().min(3).max(32).optional(),
        sealLabel: z.string().trim().min(2).max(128).optional(),
        premiereTitle: z.string().trim().min(3).max(255).optional(),
        premierePhrase: z.string().max(4000).nullable().optional(),
        coverUrl: z.string().max(1024).nullable().optional(),
        launchPhase: z.enum(["sealed", "reveal", "live", "archive"]).optional(),
        launchNote: z.string().max(255).nullable().optional(),
        honorTitle: z.string().trim().min(2).max(255).optional(),
        honorMessage: z.string().max(4000).nullable().optional(),
        honorProgram: z.string().max(12000).nullable().optional(),
        portraitQuote: z.string().max(4000).nullable().optional(),
        portraitHighlights: z.string().max(12000).nullable().optional(),
        portraitVideoUrl: z.string().max(1024).nullable().optional(),
        curtainTitle: z.string().trim().min(2).max(255).optional(),
        curtainSubtitle: z.string().max(4000).nullable().optional(),
        curtainState: z.enum(["closed", "opening", "revealed"]).optional(),
      })).mutation(async ({ input, ctx }) => {
        const { ceremonyId, ...data } = input;
        const maison = await upsertEventMaisonSettings(ceremonyId, { ...data, updatedBy: ctx.user.id });
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId, action: "maison.update", details: JSON.stringify(data) });
        return maison;
      }),
    }),
  }),

  invitationPresets: router({
    list: adminProcedure.input(z.object({ ceremonyId: z.number().int().positive() })).query(({ input }) => listInvitationPresets(input.ceremonyId)),
    create: adminProcedure.input(z.object({ ceremonyId: z.number().int().positive(), name: z.string().trim().min(2).max(128), sourceTemplateId: z.string().trim().min(1).max(64), config: z.string().min(2).max(12000) })).mutation(async ({ input, ctx }) => {
      const preset = await createInvitationPreset({ ...input, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.ceremonyId, action: "invitationPreset.create", details: JSON.stringify({ id: preset?.id, name: input.name, sourceTemplateId: input.sourceTemplateId }) });
      return preset;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive(), ceremonyId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      await deleteInvitationPreset(input.id, input.ceremonyId);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.ceremonyId, action: "invitationPreset.delete", details: JSON.stringify({ id: input.id }) });
      return { success: true };
    }),
  }),

  schoolNews: router({
    publicList: publicProcedure.query(() => listSchoolNewsIssues("published")),
    recordView: publicProcedure.input(z.object({ id: z.number().int().positive(), viewerKey: z.string().trim().min(12).max(64) })).mutation(({ input }) => recordAqeeqContentView("journal", input.id, input.viewerKey)),
    monthlyBook: publicProcedure.input(z.object({ monthKey: z.string().regex(/^\d{4}-\d{2}$/) })).query(({ input }) => getSchoolNewsMonthlyBook(input.monthKey)),
    list: adminProcedure.query(() => listSchoolNewsIssues()),
    studioDefaults: adminProcedure.query(() => getJournalStudioDefaults()),
    saveStudioDefaults: adminProcedure.input(journalStudioDefaultsInput).mutation(async ({ input, ctx }) => {
      const defaults = await setJournalStudioDefaults(input);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.save_studio_defaults", details: JSON.stringify(defaults) });
      return defaults;
    }),
    publicIssue: publicProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getSchoolNewsIssueBySlug(input.slug)),
    issue: adminProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getSchoolNewsIssueBySlug(input.slug, true)),
    create: adminProcedure.input(z.object({ title: z.string().trim().min(3).max(255), slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(128), issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), driveFolderUrl: z.string().url().max(1024).nullable().optional(), coverUrl: z.string().max(1024).optional(), description: z.string().max(4000).optional(), seasonLabel: z.string().max(128).optional(), readingMode: z.enum(["spread", "scroll"]).optional(), headerLogoUrl: z.string().max(1024).nullable().optional(), backgroundAudioUrl: z.string().max(1024).nullable().optional(), watermarkUrl: z.string().max(1024).nullable().optional(), watermarkScale: z.number().int().min(20).max(90).optional(), watermarkOpacity: z.number().int().min(0).max(60).optional(), watermarkPosition: z.enum(["center", "top-right", "bottom-left", "bottom-right"]).optional(), watermarkTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() })).mutation(async ({ input, ctx }) => {
      const issue = await createSchoolNewsIssue({ ...input, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.create", details: JSON.stringify({ title: input.title, slug: input.slug }) });
      return issue;
    }),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(3).max(255).optional(), issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), driveFolderUrl: z.string().url().max(1024).nullable().optional(), coverUrl: z.string().max(1024).nullable().optional(), description: z.string().max(4000).nullable().optional(), seasonLabel: z.string().max(128).optional(), readingMode: z.enum(["spread", "scroll"]).optional(), headerLogoUrl: z.string().max(1024).nullable().optional(), backgroundAudioUrl: z.string().max(1024).nullable().optional(), watermarkUrl: z.string().max(1024).nullable().optional(), watermarkScale: z.number().int().min(20).max(90).optional(), watermarkOpacity: z.number().int().min(0).max(60).optional(), watermarkPosition: z.enum(["center", "top-right", "bottom-left", "bottom-right"]).optional(), watermarkTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() })).mutation(({ input, ctx }) => {
      const { id, ...data } = input;
      return updateSchoolNewsIssue(id, data);
    }),
    setCover: adminProcedure.input(z.object({ issueId: z.number().int().positive(), imageUrl: z.string().min(1).max(1024), imageStorageKey: z.string().max(512).nullable().optional() })).mutation(async ({ input, ctx }) => {
      const issue = await setSchoolNewsCover(input.issueId, { imageUrl: input.imageUrl, imageStorageKey: input.imageStorageKey });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.set_cover", details: JSON.stringify({ issueId: input.issueId }) });
      return issue;
    }),
    addPages: adminProcedure.input(z.object({ issueId: z.number().int().positive(), pages: z.array(z.object({ imageUrl: z.string().min(1).max(1024), imageStorageKey: z.string().max(512).optional(), caption: z.string().max(255).optional() })).min(1).max(100) })).mutation(async ({ input, ctx }) => {
      const pages = await addSchoolNewsPages(input.issueId, input.pages);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.add_pages", details: JSON.stringify({ issueId: input.issueId, count: input.pages.length }) });
      return pages;
    }),
    deletePage: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteSchoolNewsPage(input.id)),
    updatePage: adminProcedure.input(z.object({ id: z.number().int().positive(), caption: z.string().max(255).nullable().optional(), imageUrl: z.string().min(1).max(1024).optional(), imageStorageKey: z.string().max(512).nullable().optional() })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateSchoolNewsPage(id, data);
    }),
    reorderPages: adminProcedure.input(z.object({ issueId: z.number().int().positive(), pageIds: z.array(z.number().int().positive()).min(1).max(100) })).mutation(({ input }) => reorderSchoolNewsPages(input.issueId, input.pageIds)),
    importFromDrive: adminProcedure.input(z.object({ issueId: z.number().int().positive(), driveFolderUrl: z.string().url().max(1024) })).mutation(async ({ input, ctx }) => {
      try {
        const media = await readGoogleDriveAlbum(input.driveFolderUrl);
        const images = media.filter((item) => item.mediaType === "image");
        if (!images.length) throw new Error("لم يتم العثور على صور صفحات (JPG/PNG) داخل الفولدر. إذا كان لديك ملف PDF، استخدم خيار «استيراد PDF من Drive» في القائمة لتحويل صفحاته تلقائياً.");
        const pages = await addSchoolNewsPages(input.issueId, images.map((item) => ({ imageUrl: item.thumbnailUrl || item.mediaUrl, caption: item.fileName })));
        await updateSchoolNewsIssue(input.issueId, { driveFolderUrl: input.driveFolderUrl });
        await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.import_drive", details: JSON.stringify({ issueId: input.issueId, count: pages.length }) });
        return pages;
      } catch (err: any) {
        if (input.driveFolderUrl.includes(".pdf") || input.driveFolderUrl.includes("/file/d/")) {
          throw new Error("هذا الرابط يشير لملف PDF. يرجى استخدام زر «استيراد PDF من Drive» في قسم الصفحات باليمين ليتم تحويل صفحاته فوراً.");
        }
        throw err;
      }
    }),
    fetchDrivePdf: adminProcedure.input(z.object({ driveUrl: z.string().min(1).max(1024) })).mutation(async ({ input }) => {
      const fileId = await getDrivePdfFileId(input.driveUrl);
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
      const response = await fetch(downloadUrl, { headers: { "User-Agent": "AlaqeeqStudio/1.0" } });
      if (!response.ok) throw new Error("تعذر تحميل ملف PDF من Google Drive. تأكد أن الملف أو الفولدر متاح للمشاهدة لأي شخص لديه الرابط.");
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 30 * 1024 * 1024) throw new Error("الحد الأقصى لملف PDF هو 30 ميجابايت");
      return { base64: buffer.toString("base64"), fileName: `drive-${fileId}.pdf` };
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive(), confirm: z.literal(true) })).mutation(async ({ input, ctx }) => {
      const result = await deleteSchoolNewsIssue(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.delete", details: JSON.stringify({ issueId: input.id }) });
      return result;
    }),
    publish: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const issue = await publishSchoolNewsIssue(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "school_news.publish", details: JSON.stringify({ issueId: input.id }) });
      return issue;
    }),
    generateAiStory: staffProcedure
      .input(
        z.object({
          title: z.string().optional(),
          topic: z.string().optional(),
          prompt: z.string().optional(),
          keyPoints: z.string().optional(),
          tone: z.enum(["royal", "celebration", "educational", "urgent"]).optional(),
          schoolName: z.string().optional(),
          apiKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return generateAiNewsStory(input);
      }),
  }),

  aqeeqAlbums: router({
    publicList: publicProcedure.query(() => listAqeeqAlbums("published")),
    allPublicMedia: publicProcedure.query(() => listAllPublicAlbumMedia()),
    recordView: publicProcedure.input(z.object({ id: z.number().int().positive(), viewerKey: z.string().trim().min(12).max(64) })).mutation(({ input }) => recordAqeeqContentView("album", input.id, input.viewerKey)),
    publicAlbum: publicProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getAqeeqAlbumBySlug(input.slug)),
    list: adminProcedure.query(() => listAqeeqAlbums()),
    album: adminProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getAqeeqAlbumBySlug(input.slug, true)),
    create: adminProcedure.input(aqeeqAlbumInput).mutation(async ({ input, ctx }) => {
      const album = await createAqeeqAlbum({ ...input, ceremonyId: input.ceremonyId ?? null, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.ceremonyId ?? undefined, action: "aqeeq_album.create", details: JSON.stringify({ title: input.title, slug: input.slug }) });
      return album;
    }),
    update: adminProcedure.input(aqeeqAlbumInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const album = await updateAqeeqAlbum(id, data);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: album?.ceremonyId ?? undefined, action: "aqeeq_album.update", details: JSON.stringify({ id }) });
      return album;
    }),
    importFromDrive: adminProcedure.input(z.object({ albumId: z.number().int().positive(), driveFolderUrl: z.string().url().max(1024) })).mutation(async ({ input, ctx }) => {
      const media = await readGoogleDriveAlbum(input.driveFolderUrl);
      const stored = await replaceAqeeqAlbumMedia(input.albumId, media);
      const album = await updateAqeeqAlbum(input.albumId, { driveFolderUrl: input.driveFolderUrl });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: album?.ceremonyId ?? undefined, action: "aqeeq_album.import_drive", details: JSON.stringify({ id: input.albumId, count: stored.length }) });
      return stored;
    }),
    updateMedia: adminProcedure.input(z.object({ id: z.number().int().positive(), caption: z.string().max(255).nullable().optional(), mediaOrder: z.number().int().min(0).optional() })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateAqeeqAlbumMedia(id, data);
    }),
    addMedia: adminProcedure.input(z.object({ albumId: z.number().int().positive(), media: z.array(z.object({ mediaUrl: z.string().min(1).max(1024), thumbnailUrl: z.string().max(1024).nullable().optional(), fileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(128), mediaType: z.enum(["image", "video"]), caption: z.string().max(255).nullable().optional() })).min(1).max(100) })).mutation(async ({ input, ctx }) => {
      const stored = await addAqeeqAlbumMedia(input.albumId, input.media);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_album.add_media", details: JSON.stringify({ id: input.albumId, count: input.media.length }) });
      return stored;
    }),
    addSocialMedia: adminProcedure.input(z.object({ albumId: z.number().int().positive(), source: z.enum(["x", "instagram", "youtube"]), postUrl: z.string().url().max(1024), caption: z.string().max(255).nullable().optional() })).mutation(async ({ input, ctx }) => {
      const result = await addAqeeqAlbumSocialMedia(input.albumId, input);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_album.add_social_media", details: JSON.stringify({ id: input.albumId, source: input.source, mediaId: result.media.id, added: result.added }) });
      return result;
    }),
    reorderMedia: adminProcedure.input(z.object({ albumId: z.number().int().positive(), mediaIds: z.array(z.number().int().positive()).min(1).max(250) })).mutation(({ input }) => reorderAqeeqAlbumMedia(input.albumId, input.mediaIds)),
    deleteMedia: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteAqeeqAlbumMedia(input.id)),
    publish: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const album = await publishAqeeqAlbum(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: album?.ceremonyId ?? undefined, action: "aqeeq_album.publish", details: JSON.stringify({ id: input.id }) });
      return album;
    }),
    unpublish: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const album = await unpublishAqeeqAlbum(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: album?.ceremonyId ?? undefined, action: "aqeeq_album.unpublish", details: JSON.stringify({ id: input.id }) });
      return album;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive(), confirm: z.literal(true) })).mutation(async ({ input, ctx }) => {
      const result = await deleteAqeeqAlbum(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_album.delete", details: JSON.stringify({ id: input.id }) });
      return result;
    }),
    generateAiStory: staffProcedure
      .input(
        z.object({
          title: z.string().optional(),
          topic: z.string().optional(),
          prompt: z.string().optional(),
          tone: z.enum(["royal", "celebration", "educational", "urgent"]).optional(),
          itemCount: z.number().optional(),
          apiKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return generateAiAlbumDescription(input);
      }),
  }),

  aqeeqShowcases: router({
    publicList: publicProcedure.query(() => listAqeeqShowcases("published")),
    recordPostView: publicProcedure.input(z.object({ id: z.number().int().positive(), viewerKey: z.string().trim().min(12).max(64) })).mutation(({ input }) => recordAqeeqContentView("showcase_post", input.id, input.viewerKey)),
    publicShowcase: publicProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getAqeeqShowcaseBySlug(input.slug)),
    xEmbed: publicProcedure.input(z.object({ xPostUrl: z.string().url().max(1024).refine((value) => /^(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/i.test(value), "ضع رابط منشور X صحيحًا") })).query(({ input }) => getAqeeqXPostEmbed(input.xPostUrl)),
    list: adminProcedure.query(() => listAqeeqShowcases()),
    showcase: adminProcedure.input(z.object({ slug: z.string().min(2).max(128) })).query(({ input }) => getAqeeqShowcaseBySlug(input.slug, true)),
    create: adminProcedure.input(aqeeqShowcaseInput).mutation(async ({ input, ctx }) => {
      const showcase = await createAqeeqShowcase({ ...input, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.create", details: JSON.stringify({ title: input.title, slug: input.slug }) });
      return showcase;
    }),
    update: adminProcedure.input(aqeeqShowcaseInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const showcase = await updateAqeeqShowcase(id, data);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.update", details: JSON.stringify({ id }) });
      return showcase;
    }),
    syncFromDrive: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), driveFolderUrl: z.string().url().max(1024) })).mutation(async ({ input, ctx }) => {
      const media = await readGoogleDriveAlbum(input.driveFolderUrl);
      const result = await syncAqeeqShowcasePosts(input.showcaseId, media);
      await updateAqeeqShowcase(input.showcaseId, { driveFolderUrl: input.driveFolderUrl });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.sync_drive", details: JSON.stringify({ id: input.showcaseId, addedCount: result.addedCount }) });
      return result;
    }),
    addPosts: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), posts: z.array(z.object({ mediaUrl: storedMediaUrl, thumbnailUrl: storedMediaUrl.nullable().optional(), fileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(128), mediaType: z.enum(["image", "video"]), title: z.string().max(255).nullable().optional(), description: z.string().max(4000).nullable().optional() })).min(1).max(100) })).mutation(async ({ input, ctx }) => {
      const posts = await addAqeeqShowcasePosts(input.showcaseId, input.posts);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.add_posts", details: JSON.stringify({ id: input.showcaseId, count: input.posts.length }) });
      return posts;
    }),
    addMediaGroup: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), title: z.string().max(255).nullable().optional(), description: z.string().max(4000).nullable().optional(), media: z.array(z.object({ mediaUrl: storedMediaUrl, thumbnailUrl: storedMediaUrl.nullable().optional(), fileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(128), mediaType: z.enum(["image", "video"]) })).min(1).max(30) })).mutation(async ({ input, ctx }) => {
      const post = await addAqeeqShowcaseMediaGroup(input.showcaseId, input);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.add_media_group", details: JSON.stringify({ id: input.showcaseId, postId: post.id, count: input.media.length }) });
      return post;
    }),
    addXPost: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), xPostUrl: z.string().url().max(1024).refine((value) => /^(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/i.test(value), "ضع رابط منشور X صحيحًا"), title: z.string().max(255).nullable().optional(), description: z.string().max(4000).nullable().optional() })).mutation(async ({ input, ctx }) => {
      const result = await addAqeeqShowcaseXPost(input.showcaseId, input);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.add_x_post", details: JSON.stringify({ id: input.showcaseId, postId: result.post.id, added: result.added }) });
      return result;
    }),
    addSocialPost: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), source: z.enum(["instagram", "youtube"]), postUrl: z.string().url().max(1024), title: z.string().max(255).nullable().optional(), description: z.string().max(4000).nullable().optional() })).mutation(async ({ input, ctx }) => {
      const result = await addAqeeqShowcaseSocialPost(input.showcaseId, input);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.add_social_post", details: JSON.stringify({ id: input.showcaseId, source: input.source, postId: result.post.id, added: result.added }) });
      return result;
    }),
    updatePost: adminProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().max(255).nullable().optional(), description: z.string().max(4000).nullable().optional(), isNew: z.boolean().optional() })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateAqeeqShowcasePost(id, { ...data, isNew: data.isNew ?? false });
    }),
    reorderPosts: adminProcedure.input(z.object({ showcaseId: z.number().int().positive(), postIds: z.array(z.number().int().positive()).min(1).max(250) })).mutation(({ input }) => reorderAqeeqShowcasePosts(input.showcaseId, input.postIds)),
    deletePost: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteAqeeqShowcasePost(input.id)),
    publish: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const showcase = await publishAqeeqShowcase(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.publish", details: JSON.stringify({ id: input.id }) });
      return showcase;
    }),
    unpublish: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const showcase = await unpublishAqeeqShowcase(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.unpublish", details: JSON.stringify({ id: input.id }) });
      return showcase;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive(), confirm: z.literal(true) })).mutation(async ({ input, ctx }) => {
      const result = await deleteAqeeqShowcase(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "aqeeq_showcase.delete", details: JSON.stringify({ id: input.id }) });
      return result;
    }),
  }),

  audit: router({
    list: adminAuditorProcedure.input(z.object({ limit: z.number().min(1).max(500).optional(), ceremonyId: z.number().optional() }).optional()).query(({ input }) => listAuditLogs(input?.limit ?? 100, input?.ceremonyId)),
  }),

  reports: router({
    summary: adminCoordinatorAuditorProcedure.input(z.object({ ceremonyId: z.number().optional() }).optional()).query(({ input }) => getAdvancedStats(input?.ceremonyId)),
  }),

  notifications: router({
    list: adminCoordinatorProcedure.input(z.object({ limit: z.number().min(1).max(500).optional(), ceremonyId: z.number().optional() }).optional()).query(({ input }) => listNotifications(input?.limit ?? 100, input?.ceremonyId)),
    create: adminCoordinatorProcedure.input(z.object({ ceremonyId: z.number().optional(), title: z.string().min(2), message: z.string().min(2), audience: z.enum(["all", "unpaid", "absent", "attended"]), channel: z.enum(["in_app", "email", "whatsapp"]) })).mutation(async ({ input, ctx }) => {
      const notification = await createNotification({ ...input, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.ceremonyId, action: "notification.create", details: JSON.stringify({ title: input.title, audience: input.audience, channel: input.channel }) });
      return notification;
    }),
    publish: adminCoordinatorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const notification = await publishNotification(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: notification?.ceremonyId ?? undefined, action: "notification.publish", details: JSON.stringify({ id: input.id }) });
      return notification;
    }),
    public: publicProcedure.input(z.object({ limit: z.number().min(1).max(20).optional(), ceremonyId: z.number().optional() }).optional()).query(({ input }) => getPublicNotifications(input?.limit ?? 10, input?.ceremonyId)),
  }),

  backup: router({
    export: adminProcedure.query(() => getBackupSnapshot()),
    restore: adminProcedure.input(z.object({ snapshot: z.unknown(), confirm: z.literal(true) })).mutation(async ({ input, ctx }) => {
      const result = await restoreBackupSnapshot(input.snapshot);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "backup.restore", details: JSON.stringify(result) });
      return result;
    }),
  }),

  eventTasks: router({
    list: adminCoordinatorAuditorProcedure.input(z.object({ ceremonyId: z.number() })).query(({ input }) => listEventTasks(input.ceremonyId)),
    create: adminCoordinatorProcedure.input(z.object({ ceremonyId: z.number(), title: z.string().min(2).max(255), ownerLabel: z.string().max(128).optional(), dueLabel: z.string().max(128).optional() })).mutation(async ({ input, ctx }) => {
      const task = await createEventTask({ ...input, createdBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: input.ceremonyId, action: "event_task.create", details: JSON.stringify({ title: input.title }) });
      return task;
    }),
    update: adminCoordinatorProcedure.input(z.object({ id: z.number(), title: z.string().min(2).max(255).optional(), ownerLabel: z.string().max(128).nullable().optional(), dueLabel: z.string().max(128).nullable().optional(), status: z.enum(["todo", "doing", "done"]).optional() })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const task = await updateEventTask(id, data);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, ceremonyId: undefined, action: "event_task.update", details: JSON.stringify({ taskId: id, status: input.status }) });
      return task;
    }),
  }),

  // ==================== QR Scanning ====================
  scan: router({
    process: staffProcedure
      .input(
        z.object({
          qrCode: z.string().min(1),
          deviceInfo: z.string().optional(),
          ceremonyId: z.number().optional(),
          gate: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return processQrScan(input.qrCode, ctx.user.id, input.deviceInfo, input.ceremonyId, input.gate);
      }),

    logs: adminCoordinatorAuditorProcedure
      .input(z.object({ limit: z.number().optional(), ceremonyId: z.number().optional() }))
      .query(async ({ input }) => {
        return getScanLogs(input.limit ?? 50, input.ceremonyId);
      }),
  }),

  // ==================== Executive Admin Command Center ====================
  executiveAdmin: router({
    getOverviewStats: adminProcedure.query(async () => {
      const [issues, albums, showcase, usersList, logs, broadcast, orchestration] = await Promise.all([
        listSchoolNewsIssues().catch(() => []),
        listAqeeqAlbums().catch(() => []),
        getAqeeqShowcaseBySlug("news-offers").catch(() => null),
        listUsers().catch(() => []),
        listAuditLogs(10).catch(() => []),
        getSiteBroadcast().catch((): SiteBroadcast => ({ enabled: false, message: "", type: "info" })),
        getSiteOrchestration().catch(() => null),
      ]);

      const totalIssues = issues.length;
      const totalAlbums = albums.length;
      const totalPosts = (showcase as any)?.posts?.length || 0;
      const totalMediaFiles = (albums as any[]).reduce((sum: number, alb: any) => sum + (alb.mediaCount || 0), 0) + totalPosts;
      const totalViews =
        (issues as any[]).reduce((sum: number, iss: any) => sum + (iss.viewCount || 0), 0) +
        (albums as any[]).reduce((sum: number, alb: any) => sum + (alb.viewCount || 0), 0) +
        ((showcase as any)?.posts?.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0) || 0);

      const now = Date.now();
      const allActiveStories: Array<{
        id: string;
        title: string;
        category: string;
        imageUrl: string | null;
        sourceType: string;
        createdAt: string;
        timeAgo: string;
        expiresInHours: number;
        targetUrl: string;
      }> = [];

      // 1. Showcase posts within 24h
      for (const post of showcase?.posts || []) {
        if (!post.createdAt) continue;
        const diffMs = now - new Date(post.createdAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= -1 && diffHours <= 24) {
          const hoursLeft = Math.max(1, Math.round(24 - diffHours));
          const postUrl = post.externalUrl || post.mediaUrl || "";
          const isX = post.sourceType === "x" || postUrl.includes("x.com") || postUrl.includes("twitter.com");
          const isInsta = post.sourceType === "instagram" || postUrl.includes("instagram.com");
          const isYT = post.sourceType === "youtube" || postUrl.includes("youtube.com") || postUrl.includes("youtu.be");

          allActiveStories.push({
            id: "post-" + post.id,
            title: post.title || post.fileName || "خبر وتغطية جديدة",
            category: isX ? "منشور 𝕏" : isInsta ? "Instagram" : isYT ? "فيديو YouTube" : (post.mediaType === "video" ? "فيديو جديد" : "خبر جديد"),
            imageUrl: post.thumbnailUrl || post.mediaUrl || null,
            sourceType: isX ? "x" : isInsta ? "instagram" : isYT ? "youtube" : "post",
            createdAt: new Date(post.createdAt).toISOString(),
            timeAgo: diffHours < 1 ? `منذ ${Math.max(1, Math.round(diffMs / 60000))} دقيقة` : `منذ ${Math.round(diffHours)} ساعة`,
            expiresInHours: hoursLeft,
            targetUrl: "/offers",
          });
        }
      }

      // 2. Issues within 24h
      for (const iss of issues) {
        const dateVal = iss.createdAt || iss.issueDate;
        if (!dateVal) continue;
        const diffMs = now - new Date(dateVal).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= -1 && diffHours <= 24) {
          const hoursLeft = Math.max(1, Math.round(24 - diffHours));
          allActiveStories.push({
            id: "issue-" + iss.id,
            title: iss.title,
            category: "مجلة العقيق",
            imageUrl: iss.coverUrl || null,
            sourceType: "journal",
            createdAt: new Date(dateVal).toISOString(),
            timeAgo: diffHours < 1 ? "منذ قليل" : `منذ ${Math.round(diffHours)} ساعة`,
            expiresInHours: hoursLeft,
            targetUrl: `/journal/${encodeURIComponent(iss.slug)}`,
          });
        }
      }

      // 3. Albums within 24h
      for (const alb of albums) {
        const dateVal = alb.createdAt || alb.albumDate;
        if (!dateVal) continue;
        const diffMs = now - new Date(dateVal).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= -1 && diffHours <= 24) {
          const hoursLeft = Math.max(1, Math.round(24 - diffHours));
          allActiveStories.push({
            id: "album-" + alb.id,
            title: alb.title,
            category: "ألبوم فعاليات",
            imageUrl: alb.coverUrl || null,
            sourceType: "album",
            createdAt: new Date(dateVal).toISOString(),
            timeAgo: diffHours < 1 ? "منذ قليل" : `منذ ${Math.round(diffHours)} ساعة`,
            expiresInHours: hoursLeft,
            targetUrl: `/albums/${encodeURIComponent(alb.slug)}`,
          });
        }
      }

      const hiddenSet = new Set(orchestration?.hiddenStoryIds || []);
      const visibleStories = allActiveStories.filter((s) => !hiddenSet.has(s.id) && !hiddenSet.has(`story-${s.id}`));
      const hiddenStories = allActiveStories.filter((s) => hiddenSet.has(s.id) || hiddenSet.has(`story-${s.id}`));

      return {
        totalIssues,
        totalAlbums,
        totalPosts,
        totalMediaFiles,
        totalViews,
        totalUsers: usersList.length,
        activeStoriesCount: visibleStories.length,
        activeStories: visibleStories,
        hiddenStories,
        broadcast,
        recentLogs: logs,
      };
    }),

    getUsers: adminProcedure.query(async () => {
      return listUsers();
    }),

    createUser: adminProcedure
      .input(
        z.object({
          name: z.string().min(2, "الاسم يجب ألا يقل عن حرفين"),
          email: z.string().email("البريد الإلكتروني غير صحيح"),
          openId: z.string().optional(),
          password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
          role: z.enum(["admin", "coordinator", "receptionist", "auditor", "user"]).default("admin"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const created = await createAdminUser(input);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.create_user",
          details: JSON.stringify({ newUserId: created.id, name: created.name, email: created.email, role: created.role }),
        });
        return created;
      }),

    resetPassword: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          newPassword: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const res = await resetUserPassword(input.userId, input.newPassword);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.reset_password",
          details: JSON.stringify({ targetUserId: input.userId }),
        });
        return res;
      }),

    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["admin", "coordinator", "receptionist", "auditor", "user"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const res = await updateUserRole(input.userId, input.role);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.update_role",
          details: JSON.stringify({ targetUserId: input.userId, newRole: input.role }),
        });
        return res;
      }),

    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const res = await deleteUserById(input.userId);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.delete_user",
          details: JSON.stringify({ deletedUserId: input.userId }),
        });
        return res;
      }),

    getBroadcast: publicProcedure.query(async () => {
      return getSiteBroadcast();
    }),

    getBroadcastList: adminProcedure.query(async () => {
      return listSiteBroadcastItems();
    }),

    setBroadcast: adminProcedure
      .input(
        z.object({
          id: z.string().optional(),
          enabled: z.boolean(),
          message: z.string(),
          type: z.enum(["urgent", "celebration", "info"]),
          link: z.string().optional(),
          linkText: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updated = await saveSiteBroadcastItem(input);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.set_broadcast",
          details: JSON.stringify(input),
        });
        return updated;
      }),

    deleteBroadcast: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const res = await deleteSiteBroadcastItem(input.id);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.delete_broadcast",
          details: JSON.stringify(input),
        });
        return res;
      }),

    toggleBroadcast: adminProcedure
      .input(z.object({ id: z.string(), enabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const res = await toggleSiteBroadcastItem(input.id, input.enabled);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.toggle_broadcast",
          details: JSON.stringify(input),
        });
        return res;
      }),

    getMasterContent: adminProcedure.query(async () => {
      const [issues, albums, showcase] = await Promise.all([
        listSchoolNewsIssues().catch(() => []),
        listAqeeqAlbums().catch(() => []),
        getAqeeqShowcaseBySlug("news-offers").catch(() => null),
      ]);

      const unifiedList: Array<{
        id: string;
        type: "journal" | "album" | "post";
        typeLabel: string;
        title: string;
        slug: string;
        coverUrl?: string | null;
        date?: string | null;
        count?: number;
        viewsCount?: number;
        isPublished: boolean;
        editUrl: string;
        viewUrl: string;
        rawId: number;
      }> = [];

      for (const iss of issues) {
        unifiedList.push({
          id: `journal-${iss.id}`,
          type: "journal",
          typeLabel: "مجلة دورية",
          title: iss.title,
          slug: iss.slug,
          coverUrl: iss.coverUrl,
          date: iss.issueDate,
          count: iss.pageCount,
          viewsCount: iss.viewCount,
          isPublished: Boolean(iss.publishedAt),
          editUrl: `/journal/manage`,
          viewUrl: `/journal/issue/${encodeURIComponent(iss.slug)}`,
          rawId: iss.id,
        });
      }

      for (const alb of albums) {
        unifiedList.push({
          id: `album-${alb.id}`,
          type: "album",
          typeLabel: "ألبوم فعاليات",
          title: alb.title,
          slug: alb.slug,
          coverUrl: alb.coverUrl,
          date: alb.albumDate,
          count: alb.mediaCount,
          viewsCount: alb.viewCount,
          isPublished: Boolean(alb.publishedAt),
          editUrl: `/albums/manage`,
          viewUrl: `/albums/${encodeURIComponent(alb.slug)}`,
          rawId: alb.id,
        });
      }

      for (const post of showcase?.posts || []) {
        unifiedList.push({
          id: `post-${post.id}`,
          type: "post",
          typeLabel: post.sourceType === "x" ? "منشور 𝕏" : post.sourceType === "instagram" ? "Instagram" : post.mediaType === "video" ? "فيديو" : "خبر وعرض",
          title: post.title || post.fileName.replace(/\.[^.]+$/, ""),
          slug: "news-offers",
          coverUrl: post.thumbnailUrl || post.mediaUrl,
          date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : null,
          count: 1,
          viewsCount: post.viewCount,
          isPublished: true,
          editUrl: `/offers/manage`,
          viewUrl: `/offers`,
          rawId: post.id,
        });
      }

      return unifiedList;
    }),

    getSiteOrchestration: publicProcedure.query(async () => {
      return getSiteOrchestration();
    }),

    setSiteOrchestration: adminProcedure
      .input(z.record(z.string(), z.any()))
      .mutation(async ({ input, ctx }) => {
        const updated = await setSiteOrchestration(input as any);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.set_site_orchestration",
          details: JSON.stringify(input),
        });
        return updated;
      }),

    hideStory: adminProcedure
      .input(z.object({ storyId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const hiddenList = await hideSiteStory(input.storyId);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.hide_story",
          details: JSON.stringify({ storyId: input.storyId }),
        });
        return { success: true, hiddenList };
      }),

    unhideStory: adminProcedure
      .input(z.object({ storyId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const hiddenList = await unhideSiteStory(input.storyId);
        await logAudit({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "admin.unhide_story",
          details: JSON.stringify({ storyId: input.storyId }),
        });
        return { success: true, hiddenList };
      }),
  }),

  // ==================== Invitations ====================
  invitation: invitationRouter,

  // ==================== Settings & Analytics ====================
  settings: settingsRouter,
  controlCenter: controlCenterRouter,
  visualEditor: visualEditorRouter,
  homepage: homepageRouter,
  analytics: router({
    getLiveDashboard: adminProcedure.query(async () => {
      return getAqeeqAnalyticsSummary();
    }),
  }),

  // ==================== 1. Aqeeq Community Articles Platform ====================
  articles: router({
    listPublished: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return getPublishedArticles(input?.category, input?.search);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "المقال غير موجود" });
        return article;
      }),

    like: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return likeArticle(input.id);
      }),

    submitGuest: publicProcedure
      .input(
        z.object({
          title: z.string().min(3, "العنوان قصير جداً"),
          content: z.string().min(10, "نص المقال قصير جداً"),
          excerpt: z.string().optional(),
          authorName: z.string().min(2, "يرجى كتابة اسم الكاتب"),
          authorRole: z.string().optional(),
          category: z.enum(["تربوي", "إبداعات الطلاب", "إرشاد أسري", "أنشطة وفعاليات", "تجارب ملهمة"]),
          coverUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return submitGuestArticle(input);
      }),

    listAllAdmin: adminProcedure.query(async () => {
      return listAllArticles();
    }),

    createAdminArticle: adminProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          excerpt: z.string().optional(),
          authorName: z.string(),
          authorRole: z.string().optional(),
          category: z.enum(["تربوي", "إبداعات الطلاب", "إرشاد أسري", "أنشطة وفعاليات", "تجارب ملهمة"]),
          coverUrl: z.string().optional(),
          isPublished: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return createAdminArticle(input);
      }),

    moderate: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["published", "pending", "rejected"]),
          updates: z
            .object({
              title: z.string().optional(),
              content: z.string().optional(),
              excerpt: z.string().optional(),
              category: z.enum(["تربوي", "إبداعات الطلاب", "إرشاد أسري", "أنشطة وفعاليات", "تجارب ملهمة"]).optional(),
              coverUrl: z.string().nullable().optional(),
            })
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        return moderateArticle(input.id, input.status, input.updates);
      }),

    aiPolish: adminProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input }) => {
        return aiPolishArticle(input.title, input.content);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteArticle(input.id);
      }),
  }),

  // ==================== 2. Aqeeq Broadcast & Podcast Hub ====================
  podcasts: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          mediaType: z.enum(["audio", "video"]).optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return getPodcasts(input?.category, input?.mediaType, input?.search);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const podcast = await getPodcastBySlug(input.slug);
        if (!podcast) throw new TRPCError({ code: "NOT_FOUND", message: "الحلقة غير موجودة" });
        return podcast;
      }),

    like: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return likePodcast(input.id);
      }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          mediaType: z.enum(["audio", "video"]),
          sourceType: z.enum(["drive", "youtube", "direct"]),
          mediaUrl: z.string(),
          thumbnailUrl: z.string().optional(),
          coverUrl: z.string().optional(),
          duration: z.string().optional(),
          category: z.enum(["إذاعة الصباح", "بودكاست قيادات", "تغطيات صوتية", "حوارات الطلاب", "نشرات إخبارية"]),
          hostName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createPodcast(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return updatePodcast(input.id, input.data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePodcast(input.id);
      }),
  }),

  // ==================== 3. Al-Aqeeq School AI Assistant ====================
  schoolAi: router({
    ask: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1, "يرجى كتابة سؤالك"),
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        return askSchoolAiAssistant(input.history || [], input.prompt);
      }),
  }),

  // ==================== 4. Live Events & Moments Reactions ====================
  liveEvents: router({
    getCurrent: publicProcedure
      .input(z.object({ slug: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getLiveEvent(input?.slug);
      }),

    list: publicProcedure.query(async () => {
      return listAllLiveEvents();
    }),

    react: publicProcedure
      .input(
        z.object({
          eventId: z.number(),
          type: z.enum(["hearts", "claps", "stars", "fires"]),
          momentId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return reactToEvent(input.eventId, input.type, input.momentId);
      }),

    addMoment: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          title: z.string(),
          content: z.string(),
          mediaUrl: z.string().optional(),
          mediaType: z.enum(["image", "video", "text"]).optional(),
          minuteMarker: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return addEventMoment(input.eventId, input);
      }),

    setStatus: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          status: z.enum(["live", "ended", "scheduled"]),
        })
      )
      .mutation(async ({ input }) => {
        return setEventStatus(input.eventId, input.status);
      }),
  }),

  // ==================== 5. Staff Walkie Radar & Dispatch ====================
  walkie: router({
    getChannels: publicProcedure.query(async () => {
      return WALKIE_CHANNELS;
    }),

    listMessages: publicProcedure
      .input(z.object({ channelId: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return listWalkieMessages(input?.channelId);
      }),

    dispatch: publicProcedure
      .input(
        z.object({
          channelId: z.string(),
          senderName: z.string(),
          senderRole: z.string().optional(),
          audioBase64: z.string().optional(),
          audioUrl: z.string().optional(),
          durationSec: z.number().optional(),
          transcriptText: z.string().optional(),
          isEmergency: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return sendWalkieDispatch(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
