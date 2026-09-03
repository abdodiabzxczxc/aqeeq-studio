import { z } from "zod";
import { createCustomPage, createMediaAsset, deleteCustomPage, deleteMediaAsset, deletePageSection, deleteVisualFreeformElement, deleteVisualElementOverride, getCustomPageBySlug, listCustomPageHistory, listCustomPages, listMediaAssets, listPageSectionHistory, listPageSections, listVisualElementTrash, listVisualFreeformElements, listVisualElementOverrideHistory, listVisualElementOverrides, logAudit, moveVisualElementToTrash, permanentlyDeleteVisualElementTrash, publishPageSection, publishVisualFreeformElement, publishVisualElementOverride, reorderPageSections, restoreCustomPageHistory, restorePageSectionHistory, restoreVisualElementTrash, restoreVisualElementOverrideHistory, updateCustomPage, upsertPageSection, upsertVisualFreeformElement, upsertVisualElementOverride } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

const pagePathSchema = z.string().regex(/^\/$|^\/(?:about|admissions|accreditations|life|dashboard|control|scan|journal|albums|offers|live|live\/ideas|news|maison|studio|atheer|podcast|articles)$|^\/(?:news|albums|offers|journal|atheer|podcast|articles)\/manage$|^\/(?:event|workspace)\/\d+(?:\/(?:stage|memories|premiere|honor|portrait))?$|^\/(?:guest\/[a-zA-Z0-9-]+|news\/[a-z0-9-]+|news\/month\/\d{4}-\d{2}|journal\/(?:issue\/[a-z0-9-]+|month\/\d{4}-\d{2}|archive|[a-z0-9-]+)|albums\/[a-z0-9-]+|articles\/[a-z0-9-]+|page\/[a-z0-9-]{3,96})$/, "الصفحة غير مدعومة في المحرر البصري");
const cssTokenSchema = z.string().max(32).regex(/^[#a-zA-Z0-9.%(), /-]*$/, "قيمة النمط غير صالحة").nullable().optional();
// Keep this list aligned with VisualEditable ids in all first-party pages. "events" owns the public Event OS homepage.
const supportedElementSchema = z.string().min(3).max(128).regex(/^(?:home|school|event|events|lobby|dashboard|workspace|scan|control|attendees|operations|reports|settings|audit|roles|custom|page|section|journal|news|album|albums|showcase|offers|studio|aqeeq|live|blueprint|stage|memory|maison|guest|about|admissions|accreditations|app)-[a-z0-9-]+$/, "العنصر غير مدعوم في المحرر البصري");
const sectionTypeSchema = z.enum(["hero", "features", "gallery", "video", "cta", "custom"]);
const sectionConfigSchema = z.object({
  anchorId: z.string().min(2).max(96).regex(/^[a-z0-9-]+$/, "موضع الإدراج غير صالح").optional(),
  builderElement: z.enum(["text", "image", "button", "icon", "shape"]).optional(),
  shapeType: z.enum(["rectangle", "rounded", "circle", "pill", "line", "arch", "diamond"]).optional(),
  shapeColor: z.string().max(128).optional(),
  shapeLabel: z.string().max(120).optional(),
  iconName: z.enum(["sparkles", "star", "calendar", "location", "guests", "heart"]).optional(),
  title: z.string().max(240).optional(),
  subtitle: z.string().max(400).optional(),
  body: z.string().max(3000).optional(),
  imageUrl: z.string().max(1024).optional(),
  imageAlt: z.string().max(300).optional(),
  imageHref: z.string().max(1024).optional(),
  videoUrl: z.string().max(1024).optional(),
  videoHref: z.string().max(1024).optional(),
  titleHref: z.string().max(1024).optional(),
  bodyHref: z.string().max(1024).optional(),
  iconHref: z.string().max(1024).optional(),
  buttonText: z.string().max(100).optional(),
  buttonHref: z.string().max(500).optional(),
  items: z.array(z.object({ title: z.string().max(180), body: z.string().max(800).optional(), imageUrl: z.string().max(1024).optional(), imageHref: z.string().max(1024).optional() })).max(12).optional(),
}).strict();
const slugSchema = z.string().min(3).max(96).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "استخدم رابطاً إنجليزياً صغيراً من كلمات مفصولة بشرطات");
const freeformContentSchema = z.object({
  text: z.string().max(1800).optional(),
  mediaUrl: z.string().max(1024).optional(),
  altText: z.string().max(300).optional(),
  linkUrl: z.string().max(1024).optional(),
  tooltip: z.string().max(180).optional(),
  iconName: z.enum(["sparkles", "star", "calendar", "location", "guests", "heart", "ticket", "phone", "mail", "instagram", "whatsapp"]).optional(),
  textAlign: z.enum(["start", "center", "end"]).optional(),
  objectFit: z.enum(["cover", "contain"]).optional(),
  autoplay: z.boolean().optional(),
  muted: z.boolean().optional(),
}).strict();

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120) || "media-file";
}

export const visualEditorRouter = router({
  publicList: publicProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listVisualElementOverrides(input.pagePath, "published")),
  list: adminProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listVisualElementOverrides(input.pagePath, "all")),

  save: adminProcedure.input(z.object({
    pagePath: pagePathSchema,
    elementId: supportedElementSchema,
    elementTag: z.enum(["text", "button", "section", "image", "video", "icon", "section-block"]),
    contentText: z.string().max(1500).nullable().optional(),
    mediaUrl: z.string().max(1024).nullable().optional(),
    altText: z.string().max(300).nullable().optional(),
    linkUrl: z.string().max(1024).nullable().optional(),
    alignment: z.enum(["start", "center", "end", "stretch"]).nullable().optional(),
    textColor: cssTokenSchema,
    bgColor: cssTokenSchema,
    fontSize: cssTokenSchema,
    padding: cssTokenSchema,
    margin: cssTokenSchema,
    borderRadius: cssTokenSchema,
    layerX: z.number().int().min(-4000).max(4000).optional(),
    layerY: z.number().int().min(-4000).max(4000).optional(),
    layerWidth: z.number().int().min(20).max(5000).nullable().optional(),
    layerHeight: z.number().int().min(20).max(5000).nullable().optional(),
    layerZIndex: z.number().int().min(-100).max(300).optional(),
    layerOpacity: z.number().int().min(0).max(100).optional(),
    backgroundSize: z.number().int().min(25).max(300).optional(),
    backgroundPositionX: z.number().int().min(0).max(100).optional(),
    backgroundPositionY: z.number().int().min(0).max(100).optional(),
    backgroundOverlay: z.number().int().min(0).max(100).optional(),
    customCss: z.string().max(4000).nullable().optional(),
    isLocked: z.boolean().optional(),
    isHidden: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const override = await upsertVisualElementOverride({ ...input, customCss: input.customCss ?? null, updatedBy: ctx.user.id });
    await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.save", details: JSON.stringify({ pagePath: input.pagePath, elementId: input.elementId }) });
    return override;
  }),

  reset: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: supportedElementSchema })).mutation(async ({ input, ctx }) => {
    const result = await deleteVisualElementOverride(input.pagePath, input.elementId);
    await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.reset", details: JSON.stringify(input) });
    return result;
  }),

  publish: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: supportedElementSchema })).mutation(async ({ input, ctx }) => {
    const result = await publishVisualElementOverride(input.pagePath, input.elementId, ctx.user.id);
    await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.publish", details: JSON.stringify(input) });
    return result;
  }),

  history: adminProcedure.input(z.object({ pagePath: pagePathSchema, limit: z.number().min(1).max(100).optional() })).query(({ input }) => listVisualElementOverrideHistory(input.pagePath, input.limit ?? 25)),

  restore: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
    const result = await restoreVisualElementOverrideHistory(input.id, ctx.user.id);
    await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.history_restore", details: JSON.stringify({ id: input.id }) });
    return result;
  }),

  trash: router({
    list: adminProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listVisualElementTrash(input.pagePath)),
    move: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: supportedElementSchema, elementTag: z.enum(["text", "button", "section", "image", "video", "icon", "section-block"]), label: z.string().min(1).max(255), snapshot: z.string().max(12_000).nullable() })).mutation(async ({ input, ctx }) => {
      const result = await moveVisualElementToTrash({ ...input, deletedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.trash_move", details: JSON.stringify({ pagePath: input.pagePath, elementId: input.elementId, expiresAt: result.expiresAt }) });
      return result;
    }),
    restore: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const result = await restoreVisualElementTrash(input.id, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.trash_restore", details: JSON.stringify({ id: input.id, ...result }) });
      return result;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const result = await permanentlyDeleteVisualElementTrash(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.trash_remove", details: JSON.stringify(input) });
      return result;
    }),
  }),

  freeform: router({
    publicList: publicProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listVisualFreeformElements(input.pagePath, "published")),
    list: adminProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listVisualFreeformElements(input.pagePath, "all")),
    save: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: z.string().min(3).max(128).regex(/^free-[a-z0-9-]+$/), elementType: z.enum(["text", "image", "video", "icon", "button"]), preset: z.string().min(2).max(64), content: freeformContentSchema, positionX: z.number().int().min(0).max(1000), positionY: z.number().int().min(0).max(1000), width: z.number().int().min(80).max(1000), height: z.number().int().min(40).max(1000), zIndex: z.number().int().min(1).max(100) })).mutation(async ({ input, ctx }) => {
      const element = await upsertVisualFreeformElement({ ...input, content: JSON.stringify(input.content), updatedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.freeform_save", details: JSON.stringify({ pagePath: input.pagePath, elementId: input.elementId, elementType: input.elementType }) });
      return element;
    }),
    publish: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: z.string().min(3).max(128).regex(/^free-[a-z0-9-]+$/) })).mutation(async ({ input, ctx }) => {
      const element = await publishVisualFreeformElement(input.pagePath, input.elementId, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.freeform_publish", details: JSON.stringify(input) });
      return element;
    }),
    delete: adminProcedure.input(z.object({ pagePath: pagePathSchema, elementId: z.string().min(3).max(128).regex(/^free-[a-z0-9-]+$/) })).mutation(async ({ input, ctx }) => {
      const result = await deleteVisualFreeformElement(input.pagePath, input.elementId);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.freeform_delete", details: JSON.stringify(input) });
      return result;
    }),
  }),

  media: router({
    publicList: publicProcedure.query(() => listMediaAssets()),
    list: adminProcedure.query(() => listMediaAssets()),
    upload: adminProcedure.input(z.object({ fileName: z.string().min(1).max(255), mimeType: z.string().min(3).max(128), base64: z.string().min(8).max(35_000_000), altText: z.string().max(300).optional() })).mutation(async ({ input, ctx }) => {
      const isImage = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"].includes(input.mimeType);
      const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(input.mimeType);
      const isAudio = ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm"].includes(input.mimeType);
      if (!isImage && !isVideo && !isAudio) throw new Error("يُسمح برفع الصور والفيديو وملفات MP3 وM4A وOGG وWAV الصوتية فقط");
      const rawBase64 = input.base64.includes(",") ? input.base64.split(",", 2)[1] : input.base64;
      const data = Buffer.from(rawBase64, "base64");
      const maxBytes = isVideo || isAudio ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
      if (!data.length || data.length > maxBytes) throw new Error(isVideo || isAudio ? "الحد الأقصى للفيديو أو الصوت 25 ميجابايت" : "الحد الأقصى للصورة 8 ميجابايت");
      const filename = safeFileName(input.fileName);
      const uploaded = await storagePut(`site-media/${ctx.user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${filename}`, data, input.mimeType);
      const asset = await createMediaAsset({ storageKey: uploaded.key, url: uploaded.url, kind: isAudio ? "audio" : isVideo ? "video" : "image", mimeType: input.mimeType, fileName: filename, fileSize: data.length, altText: input.altText?.trim() || null, uploadedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.media_upload", details: JSON.stringify({ id: asset?.id, mimeType: input.mimeType, fileName: filename }) });
      return asset;
    }),
    addEmbed: adminProcedure.input(z.object({ url: z.string().url().max(1024), title: z.string().min(1).max(255), altText: z.string().max(300).optional() })).mutation(async ({ input, ctx }) => {
      if (!/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(input.url)) throw new Error("استخدم رابط YouTube أو Vimeo صالحاً");
      const asset = await createMediaAsset({ url: input.url, kind: "embed", fileName: input.title.trim(), altText: input.altText?.trim() || null, uploadedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.media_embed", details: JSON.stringify({ id: asset?.id, url: input.url }) });
      return asset;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const result = await deleteMediaAsset(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.media_delete", details: JSON.stringify(input) });
      return result;
    }),
  }),

  sections: router({
    publicList: publicProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listPageSections(input.pagePath, "published")),
    list: adminProcedure.input(z.object({ pagePath: pagePathSchema })).query(({ input }) => listPageSections(input.pagePath, "all")),
    save: adminProcedure.input(z.object({ pagePath: pagePathSchema, sectionId: z.string().min(3).max(128).regex(/^section-[a-z0-9-]+$/), sectionType: sectionTypeSchema, orderIndex: z.number().int().min(0).max(500), config: sectionConfigSchema })).mutation(async ({ input, ctx }) => {
      const section = await upsertPageSection({ ...input, config: JSON.stringify(input.config), updatedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.section_save", details: JSON.stringify({ pagePath: input.pagePath, sectionId: input.sectionId, sectionType: input.sectionType }) });
      return section;
    }),
    publish: adminProcedure.input(z.object({ pagePath: pagePathSchema, sectionId: z.string().min(3).max(128).regex(/^section-[a-z0-9-]+$/) })).mutation(async ({ input, ctx }) => {
      const section = await publishPageSection(input.pagePath, input.sectionId, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.section_publish", details: JSON.stringify(input) });
      return section;
    }),
    delete: adminProcedure.input(z.object({ pagePath: pagePathSchema, sectionId: z.string().min(3).max(128).regex(/^section-[a-z0-9-]+$/) })).mutation(async ({ input, ctx }) => {
      const result = await deletePageSection(input.pagePath, input.sectionId);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.section_delete", details: JSON.stringify(input) });
      return result;
    }),
    reorder: adminProcedure.input(z.object({ pagePath: pagePathSchema, sectionIds: z.array(z.string().min(3).max(128).regex(/^section-[a-z0-9-]+$/)).min(1).max(500) })).mutation(async ({ input, ctx }) => {
      const sections = await reorderPageSections(input.pagePath, input.sectionIds, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.section_reorder", details: JSON.stringify({ pagePath: input.pagePath, count: input.sectionIds.length }) });
      return sections;
    }),
    history: adminProcedure.input(z.object({ pagePath: pagePathSchema, sectionId: z.string().min(3).max(128).regex(/^section-[a-z0-9-]+$/).optional(), limit: z.number().int().min(1).max(100).optional() })).query(({ input }) => listPageSectionHistory(input.pagePath, input.sectionId, input.limit ?? 25)),
    restore: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const section = await restorePageSectionHistory(input.id, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.section_restore", details: JSON.stringify({ id: input.id }) });
      return section;
    }),
  }),

  pages: router({
    publicList: publicProcedure.query(() => listCustomPages("public")),
    list: adminProcedure.query(() => listCustomPages("all")),
    get: adminProcedure.input(z.object({ slug: slugSchema })).query(({ input }) => getCustomPageBySlug(input.slug, "all")),
    publicGet: publicProcedure.input(z.object({ slug: slugSchema })).query(({ input }) => getCustomPageBySlug(input.slug, "public")),
    history: adminProcedure.input(z.object({ pageId: z.number().positive().optional(), limit: z.number().int().min(1).max(100).optional() })).query(({ input }) => listCustomPageHistory(input.pageId, input.limit ?? 25)),
    restore: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const page = await restoreCustomPageHistory(input.id, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.page_restore", details: JSON.stringify({ id: input.id }) });
      return page;
    }),
    create: adminProcedure.input(z.object({ slug: slugSchema, title: z.string().min(2).max(180), navLabel: z.string().min(2).max(96), isVisible: z.boolean().optional() })).mutation(async ({ input, ctx }) => {
      const pages = await listCustomPages("all");
      const page = await createCustomPage({ ...input, isVisible: input.isVisible ?? true, orderIndex: pages.length, status: "draft", createdBy: ctx.user.id, updatedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.page_create", details: JSON.stringify({ slug: input.slug, title: input.title }) });
      return page;
    }),
    update: adminProcedure.input(z.object({ id: z.number().positive(), title: z.string().min(2).max(180).optional(), navLabel: z.string().min(2).max(96).optional(), isVisible: z.boolean().optional(), orderIndex: z.number().int().min(0).max(500).optional(), status: z.enum(["draft", "published"]).optional() })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const page = await updateCustomPage(id, { ...data, updatedBy: ctx.user.id });
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.page_update", details: JSON.stringify({ id, ...data }) });
      return page;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().positive() })).mutation(async ({ input, ctx }) => {
      const result = await deleteCustomPage(input.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "visual_editor.page_delete", details: JSON.stringify(input) });
      return result;
    }),
  }),
});
