import {
  bigint,
  boolean,
  int,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "receptionist", "coordinator", "auditor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});


export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("setting_key", { length: 128 }).notNull().unique(),
  value: text("setting_value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;

export const platformContent = mysqlTable("platform_content", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("content_key", { length: 128 }).notNull().unique(),
  section: varchar("section", { length: 128 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  value: text("content_value").notNull(),
  valueType: mysqlEnum("value_type", ["text", "textarea"]).notNull().default("text"),
  isPublic: boolean("is_public").notNull().default(false),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const platformContentHistory = mysqlTable("platform_content_history", {
  id: int("id").autoincrement().primaryKey(),
  contentKey: varchar("content_key", { length: 128 }).notNull(),
  previousValue: text("previous_value").notNull(),
  newValue: text("new_value").notNull(),
  source: mysqlEnum("source", ["manual", "reset", "ai", "undo"]).notNull().default("manual"),
  userId: int("user_id").notNull(),
  revertedAt: timestamp("reverted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visualElementOverrides = mysqlTable("visual_element_overrides", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  elementId: varchar("element_id", { length: 128 }).notNull(),
  elementTag: varchar("element_tag", { length: 64 }).notNull(),
  contentText: text("content_text"),
  mediaUrl: varchar("media_url", { length: 1024 }),
  altText: varchar("alt_text", { length: 300 }),
  linkUrl: varchar("link_url", { length: 1024 }),
  alignment: mysqlEnum("alignment", ["start", "center", "end", "stretch"]),
  textColor: varchar("text_color", { length: 64 }),
  bgColor: varchar("bg_color", { length: 64 }),
  fontSize: varchar("font_size", { length: 32 }),
  padding: varchar("padding", { length: 32 }),
  margin: varchar("margin", { length: 32 }),
  borderRadius: varchar("border_radius", { length: 32 }),
  customCss: text("custom_css"),
  layerX: int("layer_x").notNull().default(0),
  layerY: int("layer_y").notNull().default(0),
  layerWidth: int("layer_width"),
  layerHeight: int("layer_height"),
  layerZIndex: int("layer_z_index").notNull().default(0),
  isHidden: boolean("is_hidden").notNull().default(false),
  layerOpacity: int("layer_opacity").notNull().default(100),
  backgroundSize: int("background_size").notNull().default(100),
  backgroundPositionX: int("background_position_x").notNull().default(50),
  backgroundPositionY: int("background_position_y").notNull().default(50),
  backgroundOverlay: int("background_overlay").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  publishedSnapshot: text("published_snapshot"),
  publishedAt: timestamp("published_at"),
  updatedBy: int("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("uk_page_element").on(table.pagePath, table.elementId)]);

export const visualElementOverrideHistory = mysqlTable("visual_element_override_history", {
  id: int("id").autoincrement().primaryKey(),
  overrideId: int("override_id"),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  elementId: varchar("element_id", { length: 128 }).notNull(),
  snapshot: text("snapshot").notNull(),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visualElementTrash = mysqlTable("visual_element_trash", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  elementId: varchar("element_id", { length: 128 }).notNull(),
  elementTag: varchar("element_tag", { length: 64 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  snapshot: text("snapshot"),
  deletedBy: int("deleted_by").notNull(),
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => [index("idx_visual_element_trash_page_expiry").on(table.pagePath, table.expiresAt)]);

// أصول مكتبة الوسائط: تحفظ البيانات التعريفية فقط، أما الملف نفسه فيُرفع إلى S3.
export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  storageKey: varchar("storage_key", { length: 512 }),
  url: varchar("url", { length: 1024 }).notNull(),
  kind: mysqlEnum("kind", ["image", "video", "audio", "embed"]).notNull().default("image"),
  mimeType: varchar("mime_type", { length: 128 }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size"),
  altText: varchar("alt_text", { length: 300 }),
  uploadedBy: int("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("uk_media_assets_url").on(table.url)]);

// أقسام المحتوى القابلة للإضافة والترتيب داخل أي صفحة قابلة للتحرير.
export const pageSections = mysqlTable("page_sections", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  sectionId: varchar("section_id", { length: 128 }).notNull(),
  sectionType: mysqlEnum("section_type", ["hero", "features", "gallery", "video", "cta", "custom"]).notNull(),
  orderIndex: int("order_index").notNull().default(0),
  config: text("config").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  publishedConfig: text("published_config"),
  updatedBy: int("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("uk_page_sections_path_id").on(table.pagePath, table.sectionId)]);

export const pageSectionHistory = mysqlTable("page_section_history", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  sectionId: varchar("section_id", { length: 128 }).notNull(),
  snapshot: text("snapshot").notNull(),
  action: varchar("action", { length: 32 }).notNull().default("save"),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// عناصر موضعية تُبنى بالسحب والإفلات فوق قماش الصفحة. تُحفظ الإحداثيات بألف جزء من أبعاد الحاوية.
export const visualFreeformElements = mysqlTable("visual_freeform_elements", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull(),
  elementId: varchar("element_id", { length: 128 }).notNull(),
  elementType: mysqlEnum("element_type", ["text", "image", "video", "icon", "button"]).notNull(),
  preset: varchar("preset", { length: 64 }).notNull().default("default"),
  content: text("content").notNull(),
  positionX: int("position_x").notNull().default(500),
  positionY: int("position_y").notNull().default(500),
  width: int("width").notNull().default(360),
  height: int("height").notNull().default(120),
  zIndex: int("z_index").notNull().default(1),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  publishedSnapshot: text("published_snapshot"),
  updatedBy: int("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("uk_freeform_element_path_id").on(table.pagePath, table.elementId)]);

// تعريفات الصفحات التي ينشئها المدير وربطها بالتنقل العام للموقع.
export const customPages = mysqlTable("custom_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  navLabel: varchar("nav_label", { length: 96 }).notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  orderIndex: int("order_index").notNull().default(0),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdBy: int("created_by").notNull(),
  updatedBy: int("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const customPageHistory = mysqlTable("custom_page_history", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("page_id"),
  slug: varchar("slug", { length: 96 }).notNull(),
  snapshot: text("snapshot").notNull(),
  action: varchar("action", { length: 32 }).notNull().default("update"),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول المسجلين في حفل التخرج
export const attendees = mysqlTable("attendees", {
  id: int("id").autoincrement().primaryKey(),
  // الاسم الكامل
  fullName: varchar("fullName", { length: 255 }).notNull(),
  // رقم الهوية
  idNumber: varchar("idNumber", { length: 50 }).notNull().unique(),
  // نوع التذكرة: طالب / ولي أمر / مدعو / VIP
  ticketType: mysqlEnum("ticketType", ["student", "guardian", "guest", "vip"]).notNull().default("guest"),
  // حالة الدفع
  paymentStatus: mysqlEnum("paymentStatus", ["paid", "unpaid", "exempt"]).notNull().default("unpaid"),
  // رمز QR الفريد
  qrCode: varchar("qrCode", { length: 100 }).notNull().unique(),
  // هل حضر؟
  attended: boolean("attended").default(false).notNull(),
  // وقت الدخول
  checkedInAt: bigint("checkedInAt", { mode: "number" }),
  // ملاحظات
  notes: text("notes"),
  // رقم المقعد (اختياري)
  seatNumber: varchar("seatNumber", { length: 20 }),
  // القطاع / القاعة
  section: varchar("section", { length: 64 }),
  // البوابة المخصصة
  gate: varchar("gate", { length: 64 }),
  // رقم الحفل أو الفرع
  ceremonyId: int("ceremonyId").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
});

// مهام الاستعداد والتشغيل المرتبطة بكل فعالية.
export const eventTasks = mysqlTable("event_tasks", {
  id: int("id").autoincrement().primaryKey(),
  ceremonyId: int("ceremony_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  ownerLabel: varchar("owner_label", { length: 128 }),
  dueLabel: varchar("due_label", { length: 128 }),
  status: mysqlEnum("status", ["todo", "doing", "done"]).notNull().default("todo"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const ceremonies = mysqlTable("ceremonies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).default("custom").notNull(),
  subtitle: text("subtitle"),
  logoUrl: varchar("logoUrl", { length: 512 }),
  brandColor: varchar("brandColor", { length: 32 }).default("#c9a84c").notNull(),
  fontFamily: varchar("fontFamily", { length: 64 }).default("Tajawal").notNull(),
  templateId: varchar("templateId", { length: 64 }).default("royal").notNull(),
  invitationTitle: varchar("invitationTitle", { length: 255 }),
  invitationSubtitle: text("invitationSubtitle"),
  invitationBackgroundUrl: varchar("invitationBackgroundUrl", { length: 1024 }),
  invitationDate: varchar("invitationDate", { length: 128 }),
  invitationVenue: varchar("invitationVenue", { length: 255 }),
  invitationDressCode: varchar("invitationDressCode", { length: 255 }),
  invitationCustomTemplateName: varchar("invitationCustomTemplateName", { length: 128 }),
  invitationLayout: text("invitationLayout"),
  experienceWorld: varchar("experience_world", { length: 64 }).default("golden-stage").notNull(),
  storyLine: text("story_line"),
  trailerUrl: varchar("trailer_url", { length: 1024 }),
  stageScenes: text("stage_scenes"),
  memoryCoverUrl: varchar("memory_cover_url", { length: 1024 }),
  seasonOrder: int("season_order").default(0).notNull(),
  sections: text("sections"),
  gates: text("gates"),
  seatLabels: text("seatLabels"),
  venue: varchar("venue", { length: 255 }),
  ceremonyDate: varchar("ceremonyDate", { length: 64 }),
  ceremonyTime: varchar("ceremonyTime", { length: 64 }),
  capacity: int("capacity").default(1000).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// هوية «دار العقيق» وتجربة الإطلاق الخاصة بكل فعالية. تفصل تجربة العرض
// العامة عن البيانات التشغيلية للفعالية مع بقاء التحكم حصرياً للمدير.
export const eventMaisonSettings = mysqlTable("event_maison_settings", {
  id: int("id").autoincrement().primaryKey(),
  ceremonyId: int("ceremony_id").notNull(),
  editionCode: varchar("edition_code", { length: 32 }).notNull().default("AQ–001"),
  sealLabel: varchar("seal_label", { length: 128 }).notNull().default("دار العقيق"),
  premiereTitle: varchar("premiere_title", { length: 255 }).notNull().default("إصدار من دار العقيق"),
  premierePhrase: text("premiere_phrase"),
  coverUrl: varchar("cover_url", { length: 1024 }),
  launchPhase: mysqlEnum("launch_phase", ["sealed", "reveal", "live", "archive"]).notNull().default("sealed"),
  launchNote: varchar("launch_note", { length: 255 }),
  honorTitle: varchar("honor_title", { length: 255 }).notNull().default("صالة الشرف"),
  honorMessage: text("honor_message"),
  honorProgram: text("honor_program"),
  portraitQuote: text("portrait_quote"),
  portraitHighlights: text("portrait_highlights"),
  portraitVideoUrl: varchar("portrait_video_url", { length: 1024 }),
  curtainTitle: varchar("curtain_title", { length: 255 }).notNull().default("لحظة كشف الستار"),
  curtainSubtitle: text("curtain_subtitle"),
  curtainState: mysqlEnum("curtain_state", ["closed", "opening", "revealed"]).notNull().default("closed"),
  updatedBy: int("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("uk_event_maison_ceremony").on(table.ceremonyId)]);

export type EventMaisonSettings = typeof eventMaisonSettings.$inferSelect;

// أعداد نشرة أخبار مدارس العقيق. كل عدد أسبوعي يحوي صفحات A4 مرفوعة من الإدارة.
export const schoolNewsIssues = mysqlTable("school_news_issues", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  issueDate: varchar("issue_date", { length: 10 }).notNull(),
  viewCount: int("view_count").default(0).notNull(),
  driveFolderUrl: varchar("drive_folder_url", { length: 1024 }),
  coverUrl: varchar("cover_url", { length: 1024 }),
  description: text("description"),
  seasonLabel: varchar("season_label", { length: 128 }).default("موسم العقيق 2026").notNull(),
  readingMode: varchar("reading_mode", { length: 24 }).default("spread").notNull(),
  readerTheme: varchar("reader_theme", { length: 16 }).default("dark").notNull(),
  headerLogoUrl: varchar("header_logo_url", { length: 1024 }),
  backgroundAudioUrl: varchar("background_audio_url", { length: 1024 }),
  watermarkUrl: varchar("watermark_url", { length: 1024 }),
  watermarkScale: int("watermark_scale").default(42).notNull(),
  watermarkOpacity: int("watermark_opacity").default(12).notNull(),
  watermarkPosition: varchar("watermark_position", { length: 24 }).default("center").notNull(),
  watermarkTint: varchar("watermark_tint", { length: 32 }).default("#d6b96a").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdBy: int("created_by").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_school_news_issues_status_views").on(table.status, table.viewCount)]);

// صفحات الفلايرات A4 داخل أي عدد؛ الملف يخزن في S3 والرابط فقط في القاعدة.
export const schoolNewsPages = mysqlTable("school_news_pages", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issue_id").notNull(),
  imageUrl: varchar("image_url", { length: 1024 }).notNull(),
  imageStorageKey: varchar("image_storage_key", { length: 512 }),
  caption: varchar("caption", { length: 255 }),
  pageOrder: int("page_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ألبومات الفعاليات في «ألبوم العقيق». الملفات الأصلية تظل في Google Drive
// بينما نحفظ هنا هوية الألبوم وروابط الوسائط المرتبة للعرض داخل الموقع.
export const aqeeqAlbums = mysqlTable("aqeeq_albums", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  ceremonyId: int("ceremony_id"),
  albumDate: varchar("album_date", { length: 10 }).notNull(),
  viewCount: int("view_count").default(0).notNull(),
  description: text("description"),
  driveFolderUrl: varchar("drive_folder_url", { length: 1024 }),
  coverUrl: varchar("cover_url", { length: 1024 }),
  readingMode: varchar("reading_mode", { length: 24 }).default("spread").notNull(),
  readerTheme: varchar("reader_theme", { length: 16 }).default("dark").notNull(),
  headerLogoUrl: varchar("header_logo_url", { length: 1024 }),
  backgroundAudioUrl: varchar("background_audio_url", { length: 1024 }),
  watermarkUrl: varchar("watermark_url", { length: 1024 }),
  watermarkScale: int("watermark_scale").default(42).notNull(),
  watermarkOpacity: int("watermark_opacity").default(12).notNull(),
  watermarkPosition: varchar("watermark_position", { length: 24 }).default("center").notNull(),
  watermarkTint: varchar("watermark_tint", { length: 32 }).default("#d6b96a").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdBy: int("created_by").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_aqeeq_albums_status_date").on(table.status, table.albumDate),
  index("idx_aqeeq_albums_status_views").on(table.status, table.viewCount),
]);

export const aqeeqAlbumMedia = mysqlTable("aqeeq_album_media", {
  id: int("id").autoincrement().primaryKey(),
  albumId: int("album_id").notNull(),
  driveFileId: varchar("drive_file_id", { length: 128 }).notNull(),
  mediaUrl: varchar("media_url", { length: 1024 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull(),
  sourceType: varchar("source_type", { length: 24 }).notNull().default("drive"),
  externalUrl: varchar("external_url", { length: 1024 }),
  caption: varchar("caption", { length: 255 }),
  mediaOrder: int("media_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uk_aqeeq_album_drive_file").on(table.albumId, table.driveFileId),
  index("idx_aqeeq_album_media_order").on(table.albumId, table.mediaOrder),
]);

// صفحة «الأخبار والعروض» هي خلاصة عامة مستقلة داخل استوديو العقيق. تعرض
// منشورات الصور والفيديوهات مباشرة، مع الاحتفاظ بمصدر Drive ووصف تحريري لكل منشور.
export const aqeeqShowcases = mysqlTable("aqeeq_showcases", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  intro: text("intro"),
  driveFolderUrl: varchar("drive_folder_url", { length: 1024 }),
  readerTheme: varchar("reader_theme", { length: 16 }).default("dark").notNull(),
  headerLogoUrl: varchar("header_logo_url", { length: 1024 }),
  backgroundAudioUrl: varchar("background_audio_url", { length: 1024 }),
  watermarkUrl: varchar("watermark_url", { length: 1024 }),
  watermarkScale: int("watermark_scale").default(42).notNull(),
  watermarkOpacity: int("watermark_opacity").default(12).notNull(),
  watermarkPosition: varchar("watermark_position", { length: 24 }).default("center").notNull(),
  watermarkTint: varchar("watermark_tint", { length: 32 }).default("#d6b96a").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdBy: int("created_by").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_aqeeq_showcases_status").on(table.status)]);

export const aqeeqShowcasePosts = mysqlTable("aqeeq_showcase_posts", {
  id: int("id").autoincrement().primaryKey(),
  showcaseId: int("showcase_id").notNull(),
  driveFileId: varchar("drive_file_id", { length: 128 }).notNull(),
  mediaUrl: varchar("media_url", { length: 1024 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull(),
  sourceType: varchar("source_type", { length: 24 }).notNull().default("drive"),
  externalUrl: varchar("external_url", { length: 1024 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  viewCount: int("view_count").default(0).notNull(),
  isNew: boolean("is_new").notNull().default(true),
  postOrder: int("post_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uk_aqeeq_showcase_drive_file").on(table.showcaseId, table.driveFileId),
  index("idx_aqeeq_showcase_posts_order").on(table.showcaseId, table.postOrder),
  index("idx_aqeeq_showcase_posts_views").on(table.showcaseId, table.viewCount),
]);

// وسائط إضافية مرتبطة بمنشور واحد داخل الأخبار والعروض، بترتيب مستقل داخل المنشور.
export const aqeeqShowcasePostMedia = mysqlTable("aqeeq_showcase_post_media", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  mediaUrl: varchar("media_url", { length: 1024 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull(),
  mediaOrder: int("media_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_aqeeq_showcase_post_media_order").on(table.postId, table.mediaOrder)]);

// سجل مشاهدات مجهول: يتيح ترتيب المحتوى بالأكثر مشاهدة من دون تخزين بيانات شخصية.
export const aqeeqContentViews = mysqlTable("aqeeq_content_views", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("content_type", ["journal", "album", "showcase_post"]).notNull(),
  contentId: int("content_id").notNull(),
  viewerKey: varchar("viewer_key", { length: 64 }).notNull(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("uk_aqeeq_content_viewer").on(table.contentType, table.contentId, table.viewerKey),
  index("idx_aqeeq_content_view_lookup").on(table.contentType, table.contentId),
]);

// نسخ القوالب التي ينشئها المدير من أي تصميم دعوة ويحتفظ بها داخل الفعالية.
export const invitationPresets = mysqlTable("invitation_presets", {
  id: int("id").autoincrement().primaryKey(),
  ceremonyId: int("ceremony_id").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  sourceTemplateId: varchar("source_template_id", { length: 64 }).notNull(),
  config: text("config").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  ceremonyId: int("ceremonyId"),
  action: varchar("action", { length: 128 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  ceremonyId: int("ceremonyId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  audience: mysqlEnum("audience", ["all", "unpaid", "absent", "attended"]).notNull().default("all"),
  channel: mysqlEnum("channel", ["in_app", "email", "whatsapp"]).notNull().default("in_app"),
  status: mysqlEnum("status", ["draft", "queued", "sent"]).notNull().default("draft"),
  recipientCount: int("recipientCount").default(0).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendee = typeof attendees.$inferSelect;
export type InsertAttendee = typeof attendees.$inferInsert;

// جدول سجل عمليات المسح
export const scanLogs = mysqlTable("scan_logs", {
  id: int("id").autoincrement().primaryKey(),
  attendeeId: int("attendeeId").notNull(),
  qrCode: varchar("qrCode", { length: 100 }).notNull(),
  gate: varchar("gate", { length: 255 }),
  // نتيجة المسح: نجاح / مكرر / غير موجود
  result: mysqlEnum("result", ["success", "duplicate", "not_found", "invalid"]).notNull(),
  scannedAt: bigint("scannedAt", { mode: "number" }).notNull(),
  scannedBy: int("scannedBy"),
  // جهاز المسح
  deviceInfo: text("deviceInfo"),
});

export type ScanLog = typeof scanLogs.$inferSelect;
export type InsertScanLog = typeof scanLogs.$inferInsert;
