import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local_db.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export type LocalNewsPage = {
  id: number;
  issueId: number;
  imageUrl: string;
  imageStorageKey: string | null;
  caption: string | null;
  pageOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalNewsIssue = {
  id: number;
  title: string;
  slug: string;
  issueDate: string;
  viewCount: number;
  driveFolderUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  seasonLabel: string;
  readingMode: string;
  headerLogoUrl: string | null;
  backgroundAudioUrl: string | null;
  watermarkUrl: string | null;
  watermarkScale: number;
  watermarkOpacity: number;
  watermarkPosition: string;
  watermarkTint: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalAlbumMedia = {
  id: number;
  albumId: number;
  driveFileId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  sourceType: string;
  externalUrl: string | null;
  caption: string | null;
  mediaOrder: number;
  viewCount: number;
  createdAt: Date;
};

export type LocalAlbum = {
  id: number;
  ceremonyId: number | null;
  title: string;
  slug: string;
  albumDate: string;
  coverUrl: string | null;
  description: string | null;
  driveFolderUrl: string | null;
  readingMode: string;
  headerLogoUrl: string | null;
  backgroundAudioUrl: string | null;
  watermarkUrl: string | null;
  watermarkScale: number;
  watermarkOpacity: number;
  watermarkPosition: string;
  watermarkTint: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalShowcasePostMedia = {
  id: number;
  postId: number;
  driveFileId?: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  mediaOrder: number;
  createdAt: Date;
};

export type LocalShowcasePost = {
  id: number;
  showcaseId: number;
  driveFileId: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  sourceType: string;
  externalUrl: string | null;
  title: string | null;
  description: string | null;
  isNew: boolean;
  postOrder: number;
  viewCount: number;
  createdAt: Date;
  media: LocalShowcasePostMedia[];
};

export type LocalShowcase = {
  id: number;
  title: string;
  slug: string;
  intro: string | null;
  driveFolderUrl: string | null;
  readerTheme: string;
  headerLogoUrl: string | null;
  backgroundAudioUrl: string | null;
  watermarkUrl: string | null;
  watermarkScale: number;
  watermarkOpacity: number;
  watermarkPosition: string;
  watermarkTint: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredIssue = LocalNewsIssue & { pages: LocalNewsPage[] };
export type StoredAlbum = LocalAlbum & { media: LocalAlbumMedia[] };
export type StoredShowcase = LocalShowcase & { posts: LocalShowcasePost[] };

export type LocalMediaAsset = {
  id: number;
  storageKey: string | null;
  url: string;
  kind: "image" | "video" | "audio" | "embed";
  mimeType: string | null;
  fileName: string;
  fileSize: number | null;
  altText: string | null;
  uploadedBy: number;
  createdAt: Date;
};

export type LocalAdmissionLead = {
  id: number;
  studentName: string;
  guardianName: string;
  phone: string;
  email?: string | null;
  gradeLevel: string; // "kindergarten" | "primary" | "middle" | "high"
  track: string; // "national" | "international"
  gender: string; // "boys" | "girls"
  notes?: string | null;
  status: "new" | "contacted" | "admitted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

export type LocalDbState = {
  issues: StoredIssue[];
  albums: StoredAlbum[];
  showcases: StoredShowcase[];
  mediaAssets: LocalMediaAsset[];
  admissions?: LocalAdmissionLead[];
  settings: Record<string, string>;
  overrides: Record<string, any>;
  nextId: {
    issue: number;
    issuePage: number;
    album: number;
    albumMedia: number;
    showcase: number;
    showcasePost: number;
    showcasePostMedia: number;
    mediaAsset: number;
    admission?: number;
  };
};

const DEFAULT_STATE: LocalDbState = {
  issues: [],
  albums: [],
  showcases: [
    {
      id: 1,
      title: "أخبار وعروض العقيق",
      slug: "news-offers",
      intro: "رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق وعروضها.",
      driveFolderUrl: null,
      readerTheme: "dark",
      headerLogoUrl: null,
      backgroundAudioUrl: null,
      watermarkUrl: null,
      watermarkScale: 42,
      watermarkOpacity: 12,
      watermarkPosition: "center",
      watermarkTint: "#d6b96a",
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
      posts: [],
    },
  ],
  mediaAssets: [],
  admissions: [],
  settings: {},
  overrides: {},
  nextId: {
    issue: 1,
    issuePage: 1,
    album: 1,
    albumMedia: 1,
    showcase: 2,
    showcasePost: 1,
    showcasePostMedia: 1,
    mediaAsset: 1,
    admission: 1,
  },
};


let memoryState: LocalDbState | null = null;

const SEED_FILE = path.resolve(process.cwd(), "server", "seedData.json");

export function getLocalDb(): LocalDbState {
  if (memoryState) return memoryState;

  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && (parsed.albums?.length > 0 || parsed.issues?.length > 0 || parsed.showcases?.length > 0)) {
        memoryState = parsed;
        return memoryState!;
      }
    } catch (e) {
      console.warn("[LocalDB] Corrupted DB file, reinitializing", e);
    }
  }

  // Load from bundled seedData.json so Render is NEVER empty out-of-the-box!
  if (fs.existsSync(SEED_FILE)) {
    try {
      const seedContent = fs.readFileSync(SEED_FILE, "utf-8");
      memoryState = JSON.parse(seedContent);
      saveLocalDb();
      return memoryState!;
    } catch (e) {
      console.warn("[LocalDB] Failed to load seed file:", e);
    }
  }

  memoryState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveLocalDb();
  return memoryState!;
}

export function saveLocalDb() {
  if (!memoryState) return;
  ensureDataDir();
  try {
    const json = JSON.stringify(memoryState, null, 2);
    fs.writeFileSync(DB_FILE, json, "utf-8");
    if (fs.existsSync(path.dirname(SEED_FILE))) {
      fs.writeFileSync(SEED_FILE, json, "utf-8");
    }
  } catch (err) {
    console.error("[LocalDB] Save error:", err);
  }
}

// ==================== School News Local Store ====================

export const localSchoolNews = {
  list(status?: "draft" | "published"): Array<LocalNewsIssue & { pageCount: number }> {
    const db = getLocalDb();
    let list = [...db.issues];
    if (status) list = list.filter((i) => i.status === status);
    list.sort((a, b) => b.issueDate.localeCompare(a.issueDate));
    return list.map((i) => {
      const { pages, ...rest } = i;
      return {
        ...rest,
        driveFolderUrl: rest.driveFolderUrl || null,
        viewCount: Number(rest.viewCount || 0),
        pageCount: pages?.length || 0,
        createdAt: new Date(rest.createdAt || Date.now()),
        updatedAt: new Date(rest.updatedAt || Date.now()),
        publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : null,
      };
    });
  },

  getBySlug(slug: string, includeDraft = false): (LocalNewsIssue & { pages: LocalNewsPage[] }) | undefined {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.slug === slug && (includeDraft || i.status === "published"));
    if (!issue) return undefined;
    const pages: LocalNewsPage[] = [...(issue.pages || [])].sort((a, b) => a.pageOrder - b.pageOrder).map((p) => ({
      ...p,
      imageStorageKey: p.imageStorageKey || null,
      caption: p.caption || null,
      createdAt: new Date(p.createdAt || Date.now()),
      updatedAt: new Date(p.updatedAt || Date.now()),
    }));
    return {
      ...issue,
      driveFolderUrl: issue.driveFolderUrl || null,
      viewCount: Number(issue.viewCount || 0),
      createdAt: new Date(issue.createdAt || Date.now()),
      updatedAt: new Date(issue.updatedAt || Date.now()),
      publishedAt: issue.publishedAt ? new Date(issue.publishedAt) : null,
      pages,
    };
  },

  create(data: any): LocalNewsIssue {
    const db = getLocalDb();
    const now = new Date();
    const issue: StoredIssue = {
      id: db.nextId.issue++,
      title: data.title || "النشرة الأسبوعية",
      slug: data.slug || `issue-${Date.now()}`,
      issueDate: data.issueDate || new Date().toISOString().slice(0, 10),
      viewCount: 0,
      driveFolderUrl: data.driveFolderUrl || null,
      coverUrl: data.coverUrl || null,
      description: data.description || null,
      seasonLabel: data.seasonLabel || "موسم العقيق 2026",
      readingMode: data.readingMode || "spread",
      headerLogoUrl: data.headerLogoUrl || null,
      backgroundAudioUrl: data.backgroundAudioUrl || null,
      watermarkUrl: data.watermarkUrl || null,
      watermarkScale: data.watermarkScale ?? 42,
      watermarkOpacity: data.watermarkOpacity ?? 12,
      watermarkPosition: data.watermarkPosition || "center",
      watermarkTint: data.watermarkTint || "#d6b96a",
      status: data.status || "draft",
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
      pages: [],
    };
    db.issues.unshift(issue);
    saveLocalDb();
    return {
      ...issue,
      createdAt: new Date(issue.createdAt),
      updatedAt: new Date(issue.updatedAt),
      publishedAt: null,
    };
  },

  update(id: number, data: any): LocalNewsIssue {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.id === id);
    if (!issue) throw new Error("العدد غير موجود");
    Object.assign(issue, data, { updatedAt: new Date() });
    saveLocalDb();
    return {
      ...issue,
      createdAt: new Date(issue.createdAt),
      updatedAt: new Date(issue.updatedAt),
      publishedAt: issue.publishedAt ? new Date(issue.publishedAt) : null,
    };
  },

  setCover(issueId: number, cover: { imageUrl: string; imageStorageKey?: string | null }) {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.id === issueId);
    if (!issue) throw new Error("العدد غير موجود");
    issue.coverUrl = cover.imageUrl;
    let coverPage = issue.pages.find((p) => p.imageUrl === cover.imageUrl);
    if (!coverPage) {
      coverPage = {
        id: db.nextId.issuePage++,
        issueId,
        imageUrl: cover.imageUrl,
        imageStorageKey: cover.imageStorageKey || null,
        caption: "غلاف العدد",
        pageOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      issue.pages.unshift(coverPage);
    }
    issue.pages.forEach((p, idx) => (p.pageOrder = idx));
    saveLocalDb();
    return this.getBySlug(issue.slug, true);
  },

  addPages(issueId: number, pages: Array<{ imageUrl: string; imageStorageKey?: string; caption?: string }>): LocalNewsPage[] {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.id === issueId);
    if (!issue) throw new Error("العدد غير موجود");
    const now = new Date();
    const startOrder = issue.pages.length;
    pages.forEach((p, idx) => {
      issue.pages.push({
        id: db.nextId.issuePage++,
        issueId,
        imageUrl: p.imageUrl,
        imageStorageKey: p.imageStorageKey || null,
        caption: p.caption || null,
        pageOrder: startOrder + idx,
        createdAt: now,
        updatedAt: now,
      });
    });
    saveLocalDb();
    return issue.pages.map((p) => ({
      ...p,
      imageStorageKey: p.imageStorageKey || null,
      caption: p.caption || null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  },

  deletePage(id: number) {
    const db = getLocalDb();
    db.issues.forEach((issue) => {
      issue.pages = issue.pages.filter((p) => p.id !== id);
      issue.pages.forEach((p, idx) => (p.pageOrder = idx));
    });
    saveLocalDb();
    return { success: true };
  },

  updatePage(id: number, data: any): LocalNewsPage {
    const db = getLocalDb();
    for (const issue of db.issues) {
      const page = issue.pages.find((p) => p.id === id);
      if (page) {
        Object.assign(page, data, { updatedAt: new Date() });
        saveLocalDb();
        return {
          ...page,
          imageStorageKey: page.imageStorageKey || null,
          caption: page.caption || null,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt),
        };
      }
    }
    throw new Error("الصفحة غير موجودة");
  },

  reorderPages(issueId: number, pageIds: number[]): LocalNewsPage[] {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.id === issueId);
    if (!issue) throw new Error("العدد غير موجود");
    const map = new Map(issue.pages.map((p) => [p.id, p]));
    issue.pages = pageIds.map((id, idx) => {
      const p = map.get(id);
      if (p) p.pageOrder = idx;
      return p;
    }).filter((p): p is LocalNewsPage => Boolean(p));
    saveLocalDb();
    return issue.pages.map((p) => ({
      ...p,
      imageStorageKey: p.imageStorageKey || null,
      caption: p.caption || null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  },

  delete(id: number) {
    const db = getLocalDb();
    db.issues = db.issues.filter((i) => i.id !== id);
    saveLocalDb();
    return { success: true };
  },

  publish(id: number): LocalNewsIssue {
    const db = getLocalDb();
    const issue = db.issues.find((i) => i.id === id);
    if (!issue) throw new Error("العدد غير موجود");
    issue.status = "published";
    issue.publishedAt = new Date();
    if (!issue.coverUrl && issue.pages[0]) issue.coverUrl = issue.pages[0].imageUrl;
    saveLocalDb();
    return {
      ...issue,
      createdAt: new Date(issue.createdAt),
      updatedAt: new Date(issue.updatedAt),
      publishedAt: new Date(issue.publishedAt),
    };
  },

  getMonthlyBook(monthKey: string) {
    const db = getLocalDb();
    const issues = db.issues
      .filter((i) => i.status === "published" && i.issueDate.startsWith(monthKey))
      .sort((a, b) => a.issueDate.localeCompare(b.issueDate));
    return {
      monthKey,
      issues: issues.map((i) => ({
        ...i,
        driveFolderUrl: i.driveFolderUrl || null,
        viewCount: Number(i.viewCount || 0),
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
        publishedAt: i.publishedAt ? new Date(i.publishedAt) : null,
      })),
      pages: issues.flatMap((issue) => {
        const pages = [...(issue.pages || [])].sort((a, b) => a.pageOrder - b.pageOrder);
        const hasCoverFirst = Boolean(issue.coverUrl && pages[0]?.imageUrl === issue.coverUrl);
        const cover = issue.coverUrl && !hasCoverFirst ? [{ id: -issue.id, issueId: issue.id, imageUrl: issue.coverUrl, imageStorageKey: null, caption: `غلاف ${issue.title}`, pageOrder: -1, createdAt: new Date(issue.createdAt), updatedAt: new Date(issue.updatedAt) }] : [];
        return [...cover, ...pages].map((page) => ({
          ...page,
          imageStorageKey: page.imageStorageKey || null,
          caption: page.caption || null,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt),
          issueTitle: issue.title,
          issueDate: issue.issueDate,
        }));
      }),
    };
  },
};

// ==================== Aqeeq Albums Local Store ====================

export const localAlbums = {
  list(status?: "draft" | "published"): Array<LocalAlbum & { mediaCount: number }> {
    const db = getLocalDb();
    let list = [...db.albums];
    if (status) list = list.filter((a) => a.status === status);
    list.sort((a, b) => b.albumDate.localeCompare(a.albumDate));
    return list.map((a) => ({
      ...a,
      ceremonyId: a.ceremonyId || null,
      driveFolderUrl: a.driveFolderUrl || null,
      headerLogoUrl: a.headerLogoUrl || null,
      backgroundAudioUrl: a.backgroundAudioUrl || null,
      watermarkUrl: a.watermarkUrl || null,
      watermarkScale: a.watermarkScale ?? 42,
      watermarkOpacity: a.watermarkOpacity ?? 12,
      watermarkPosition: a.watermarkPosition || "center",
      watermarkTint: a.watermarkTint || "#d6b96a",
      mediaCount: a.media?.length || 0,
      createdAt: new Date(a.createdAt || Date.now()),
      updatedAt: new Date(a.updatedAt || Date.now()),
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
    }));
  },

  getBySlug(slug: string, includeDraft = false): (LocalAlbum & { media: LocalAlbumMedia[] }) | undefined {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.slug === slug && (includeDraft || a.status === "published"));
    if (!album) return undefined;
    const media: LocalAlbumMedia[] = [...(album.media || [])].sort((a, b) => a.mediaOrder - b.mediaOrder).map((m) => ({
      ...m,
      thumbnailUrl: m.thumbnailUrl || null,
      externalUrl: m.externalUrl || null,
      caption: m.caption || null,
      createdAt: new Date(m.createdAt || Date.now()),
    }));
    return {
      ...album,
      ceremonyId: album.ceremonyId || null,
      driveFolderUrl: album.driveFolderUrl || null,
      headerLogoUrl: album.headerLogoUrl || null,
      backgroundAudioUrl: album.backgroundAudioUrl || null,
      watermarkUrl: album.watermarkUrl || null,
      watermarkScale: album.watermarkScale ?? 42,
      watermarkOpacity: album.watermarkOpacity ?? 12,
      watermarkPosition: album.watermarkPosition || "center",
      watermarkTint: album.watermarkTint || "#d6b96a",
      createdAt: new Date(album.createdAt || Date.now()),
      updatedAt: new Date(album.updatedAt || Date.now()),
      publishedAt: album.publishedAt ? new Date(album.publishedAt) : null,
      media,
    };
  },

  create(data: any): LocalAlbum {
    const db = getLocalDb();
    const now = new Date();
    const album: StoredAlbum = {
      id: db.nextId.album++,
      ceremonyId: data.ceremonyId || null,
      title: data.title || "ألبوم جديد",
      slug: data.slug || `album-${Date.now()}`,
      albumDate: data.albumDate || new Date().toISOString().slice(0, 10),
      coverUrl: data.coverUrl || null,
      description: data.description || null,
      driveFolderUrl: data.driveFolderUrl || null,
      readingMode: data.readingMode || "gallery",
      headerLogoUrl: data.headerLogoUrl || null,
      backgroundAudioUrl: data.backgroundAudioUrl || null,
      watermarkUrl: data.watermarkUrl || null,
      watermarkScale: data.watermarkScale ?? 42,
      watermarkOpacity: data.watermarkOpacity ?? 12,
      watermarkPosition: data.watermarkPosition || "center",
      watermarkTint: data.watermarkTint || "#d6b96a",
      status: data.status || "draft",
      publishedAt: null,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      media: [],
    };
    db.albums.unshift(album);
    saveLocalDb();
    return {
      ...album,
      createdAt: new Date(album.createdAt),
      updatedAt: new Date(album.updatedAt),
      publishedAt: null,
    };
  },

  update(id: number, data: any): LocalAlbum {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === id);
    if (!album) throw new Error("الألبوم غير موجود");
    Object.assign(album, data, { updatedAt: new Date() });
    saveLocalDb();
    return {
      ...album,
      createdAt: new Date(album.createdAt),
      updatedAt: new Date(album.updatedAt),
      publishedAt: album.publishedAt ? new Date(album.publishedAt) : null,
    };
  },

  replaceMedia(albumId: number, media: any[]): LocalAlbumMedia[] {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === albumId);
    if (!album) throw new Error("الألبوم غير موجود");
    const now = new Date();
    album.media = media.map((item, idx) => ({
      id: db.nextId.albumMedia++,
      albumId,
      driveFileId: item.driveFileId || `file-${nanoid(12)}`,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || null,
      fileName: item.fileName || `media-${idx + 1}`,
      mimeType: item.mimeType || "image/jpeg",
      mediaType: item.mediaType || "image",
      sourceType: item.sourceType || "drive",
      externalUrl: item.externalUrl || null,
      caption: item.caption || null,
      mediaOrder: idx,
      viewCount: 0,
      createdAt: now,
    }));
    if (!album.coverUrl && album.media[0]) album.coverUrl = album.media[0].thumbnailUrl || album.media[0].mediaUrl;
    saveLocalDb();
    return album.media.map((m) => ({
      ...m,
      thumbnailUrl: m.thumbnailUrl || null,
      externalUrl: m.externalUrl || null,
      caption: m.caption || null,
      createdAt: new Date(m.createdAt),
    }));
  },

  addMedia(albumId: number, media: any[]): LocalAlbumMedia[] {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === albumId);
    if (!album) throw new Error("الألبوم غير موجود");
    const now = new Date();
    const startOrder = album.media.length;
    media.forEach((item, idx) => {
      album.media.push({
        id: db.nextId.albumMedia++,
        albumId,
        driveFileId: item.driveFileId || `manual-${nanoid(12)}`,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl || null,
        fileName: item.fileName || `media-${startOrder + idx + 1}`,
        mimeType: item.mimeType || "image/jpeg",
        mediaType: item.mediaType || "image",
        sourceType: item.sourceType || "manual",
        externalUrl: item.externalUrl || null,
        caption: item.caption || null,
        mediaOrder: startOrder + idx,
        viewCount: 0,
        createdAt: now,
      });
    });
    if (!album.coverUrl && album.media[0]) album.coverUrl = album.media[0].thumbnailUrl || album.media[0].mediaUrl;
    saveLocalDb();
    return album.media.map((m) => ({
      ...m,
      thumbnailUrl: m.thumbnailUrl || null,
      externalUrl: m.externalUrl || null,
      caption: m.caption || null,
      createdAt: new Date(m.createdAt),
    }));
  },

  updateMedia(id: number, data: any): LocalAlbumMedia {
    const db = getLocalDb();
    for (const album of db.albums) {
      const item = album.media.find((m) => m.id === id);
      if (item) {
        Object.assign(item, data);
        saveLocalDb();
        return {
          ...item,
          thumbnailUrl: item.thumbnailUrl || null,
          externalUrl: item.externalUrl || null,
          caption: item.caption || null,
          createdAt: new Date(item.createdAt),
        };
      }
    }
    throw new Error("عنصر الوسائط غير موجود");
  },

  reorderMedia(albumId: number, mediaIds: number[]): LocalAlbumMedia[] {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === albumId);
    if (!album) throw new Error("الألبوم غير موجود");
    const map = new Map(album.media.map((m) => [m.id, m]));
    album.media = mediaIds.map((id, idx) => {
      const m = map.get(id);
      if (m) m.mediaOrder = idx;
      return m;
    }).filter((m): m is LocalAlbumMedia => Boolean(m));
    saveLocalDb();
    return album.media.map((m) => ({
      ...m,
      thumbnailUrl: m.thumbnailUrl || null,
      externalUrl: m.externalUrl || null,
      caption: m.caption || null,
      createdAt: new Date(m.createdAt),
    }));
  },

  deleteMedia(id: number) {
    const db = getLocalDb();
    db.albums.forEach((album) => {
      album.media = album.media.filter((m) => m.id !== id);
      album.media.forEach((m, idx) => (m.mediaOrder = idx));
    });
    saveLocalDb();
    return { success: true };
  },

  publish(id: number): LocalAlbum {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === id);
    if (!album) throw new Error("الألبوم غير موجود");
    album.status = "published";
    album.publishedAt = new Date();
    if (!album.coverUrl && album.media[0]) album.coverUrl = album.media[0].thumbnailUrl || album.media[0].mediaUrl;
    saveLocalDb();
    return {
      ...album,
      createdAt: new Date(album.createdAt),
      updatedAt: new Date(album.updatedAt),
      publishedAt: new Date(album.publishedAt),
    };
  },

  unpublish(id: number): LocalAlbum {
    const db = getLocalDb();
    const album = db.albums.find((a) => a.id === id);
    if (!album) throw new Error("الألبوم غير موجود");
    album.status = "draft";
    saveLocalDb();
    return {
      ...album,
      createdAt: new Date(album.createdAt),
      updatedAt: new Date(album.updatedAt),
      publishedAt: null,
    };
  },

  delete(id: number) {
    const db = getLocalDb();
    db.albums = db.albums.filter((a) => a.id !== id);
    saveLocalDb();
    return { success: true };
  },
};

// ==================== Aqeeq Showcases Local Store ====================

export const localShowcases = {
  list(status?: "draft" | "published"): Array<LocalShowcase & { postCount: number; coverUrl: string | null }> {
    const db = getLocalDb();
    let list = [...db.showcases];
    if (status) list = list.filter((s) => s.status === status);
    return list.map((s) => {
      const coverPost = s.posts?.find((post) => !["x", "instagram", "youtube"].includes(post.sourceType));
      return {
        ...s,
        intro: s.intro || null,
        driveFolderUrl: s.driveFolderUrl || null,
        headerLogoUrl: s.headerLogoUrl || null,
        backgroundAudioUrl: s.backgroundAudioUrl || null,
        watermarkUrl: s.watermarkUrl || null,
        watermarkScale: s.watermarkScale ?? 42,
        watermarkOpacity: s.watermarkOpacity ?? 12,
        watermarkPosition: s.watermarkPosition || "center",
        watermarkTint: s.watermarkTint || "#d6b96a",
        postCount: s.posts?.length || 0,
        coverUrl: coverPost?.thumbnailUrl || coverPost?.mediaUrl || null,
        createdAt: new Date(s.createdAt || Date.now()),
        updatedAt: new Date(s.updatedAt || Date.now()),
      };
    });
  },

  getBySlug(slug: string, includeDraft = false): (LocalShowcase & { posts: LocalShowcasePost[] }) | undefined {
    const db = getLocalDb();
    let showcase = db.showcases.find((s) => s.slug === slug && (includeDraft || s.status === "published"));
    if (!showcase && slug === "news-offers") {
      showcase = db.showcases[0];
    }
    if (!showcase) return undefined;
    const posts: LocalShowcasePost[] = [...(showcase.posts || [])].sort((a, b) => a.postOrder - b.postOrder).map((p) => ({
      ...p,
      driveFileId: p.driveFileId || null,
      thumbnailUrl: p.thumbnailUrl || null,
      externalUrl: p.externalUrl || null,
      title: p.title || null,
      description: p.description || null,
      isNew: Boolean(p.isNew),
      createdAt: new Date(p.createdAt || Date.now()),
      media: (p.media || []).map((m) => ({
        ...m,
        driveFileId: m.driveFileId || null,
        thumbnailUrl: m.thumbnailUrl || null,
        createdAt: new Date(m.createdAt || Date.now()),
      })),
    }));
    return {
      ...showcase,
      intro: showcase.intro || null,
      driveFolderUrl: showcase.driveFolderUrl || null,
      headerLogoUrl: showcase.headerLogoUrl || null,
      backgroundAudioUrl: showcase.backgroundAudioUrl || null,
      watermarkUrl: showcase.watermarkUrl || null,
      watermarkScale: showcase.watermarkScale ?? 42,
      watermarkOpacity: showcase.watermarkOpacity ?? 12,
      watermarkPosition: showcase.watermarkPosition || "center",
      watermarkTint: showcase.watermarkTint || "#d6b96a",
      createdAt: new Date(showcase.createdAt || Date.now()),
      updatedAt: new Date(showcase.updatedAt || Date.now()),
      posts,
    };
  },

  create(data: any): LocalShowcase {
    const db = getLocalDb();
    const now = new Date();
    const showcase: StoredShowcase = {
      id: db.nextId.showcase++,
      title: data.title || "معرض جديد",
      slug: data.slug || `showcase-${Date.now()}`,
      intro: data.intro || null,
      driveFolderUrl: data.driveFolderUrl || null,
      readerTheme: data.readerTheme || "dark",
      headerLogoUrl: data.headerLogoUrl || null,
      backgroundAudioUrl: data.backgroundAudioUrl || null,
      watermarkUrl: data.watermarkUrl || null,
      watermarkScale: data.watermarkScale ?? 42,
      watermarkOpacity: data.watermarkOpacity ?? 12,
      watermarkPosition: data.watermarkPosition || "center",
      watermarkTint: data.watermarkTint || "#d6b96a",
      status: data.status || "draft",
      createdAt: now,
      updatedAt: now,
      posts: [],
    };
    db.showcases.push(showcase);
    saveLocalDb();
    return {
      ...showcase,
      createdAt: new Date(showcase.createdAt),
      updatedAt: new Date(showcase.updatedAt),
    };
  },

  update(id: number, data: any): LocalShowcase {
    const db = getLocalDb();
    const showcase = db.showcases.find((s) => s.id === id);
    if (!showcase) throw new Error("المعرض غير موجود");
    Object.assign(showcase, data, { updatedAt: new Date() });
    saveLocalDb();
    return {
      ...showcase,
      createdAt: new Date(showcase.createdAt),
      updatedAt: new Date(showcase.updatedAt),
    };
  },

  addPosts(showcaseId: number, posts: any[]): LocalShowcasePost[] {
    const db = getLocalDb();
    const showcase = db.showcases.find((s) => s.id === showcaseId) || db.showcases[0];
    if (!showcase) throw new Error("المعرض غير موجود");
    const now = new Date();
    const startOrder = showcase.posts.length;
    posts.forEach((item, idx) => {
      showcase.posts.unshift({
        id: db.nextId.showcasePost++,
        showcaseId: showcase.id,
        driveFileId: item.driveFileId || null,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl || null,
        fileName: item.fileName || `post-${startOrder + idx + 1}`,
        mimeType: item.mimeType || "image/jpeg",
        mediaType: item.mediaType || "image",
        sourceType: item.sourceType || "manual",
        externalUrl: item.externalUrl || null,
        title: item.title || null,
        description: item.description || null,
        isNew: true,
        postOrder: startOrder + idx,
        viewCount: 0,
        createdAt: now,
        media: [],
      });
    });
    saveLocalDb();
    return showcase.posts.map((p) => ({
      ...p,
      driveFileId: p.driveFileId || null,
      thumbnailUrl: p.thumbnailUrl || null,
      externalUrl: p.externalUrl || null,
      title: p.title || null,
      description: p.description || null,
      isNew: Boolean(p.isNew),
      createdAt: new Date(p.createdAt),
    }));
  },

  addMediaGroup(showcaseId: number, group: { title?: string | null; description?: string | null; items: any[] }): LocalShowcasePost {
    const db = getLocalDb();
    const showcase = db.showcases.find((s) => s.id === showcaseId) || db.showcases[0];
    if (!showcase) throw new Error("المعرض غير موجود");
    const first = group.items[0];
    if (!first) throw new Error("المجموعة فارغة");
    const now = new Date();
    const postId = db.nextId.showcasePost++;
    const postMedia: LocalShowcasePostMedia[] = group.items.map((item, idx) => ({
      id: db.nextId.showcasePostMedia++,
      postId,
      driveFileId: item.driveFileId || null,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || null,
      fileName: item.fileName || `media-${idx + 1}`,
      mimeType: item.mimeType || "image/jpeg",
      mediaType: item.mediaType || "image",
      mediaOrder: idx,
      createdAt: now,
    }));
    const post: LocalShowcasePost = {
      id: postId,
      showcaseId: showcase.id,
      driveFileId: `group-${nanoid(12)}`,
      mediaUrl: first.mediaUrl,
      thumbnailUrl: first.thumbnailUrl || null,
      fileName: first.fileName || "مجموعة وسائط",
      mimeType: first.mimeType || "image/jpeg",
      mediaType: first.mediaType || "image",
      sourceType: "manual",
      externalUrl: null,
      title: group.title || null,
      description: group.description || null,
      isNew: !(group.title || group.description),
      postOrder: 0,
      viewCount: 0,
      createdAt: now,
      media: postMedia,
    };
    showcase.posts.unshift(post);
    saveLocalDb();
    return {
      ...post,
      driveFileId: post.driveFileId || null,
      thumbnailUrl: post.thumbnailUrl || null,
      externalUrl: null,
      title: post.title || null,
      description: post.description || null,
      isNew: Boolean(post.isNew),
      createdAt: new Date(post.createdAt),
      media: postMedia.map((m) => ({
        ...m,
        driveFileId: m.driveFileId || null,
        thumbnailUrl: m.thumbnailUrl || null,
        createdAt: new Date(m.createdAt),
      })),
    };
  },

  updatePost(id: number, data: any): LocalShowcasePost {
    const db = getLocalDb();
    for (const showcase of db.showcases) {
      const post = showcase.posts.find((p) => p.id === id);
      if (post) {
        Object.assign(post, data);
        saveLocalDb();
        return {
          ...post,
          driveFileId: post.driveFileId || null,
          thumbnailUrl: post.thumbnailUrl || null,
          externalUrl: post.externalUrl || null,
          title: post.title || null,
          description: post.description || null,
          isNew: Boolean(post.isNew),
          createdAt: new Date(post.createdAt),
        };
      }
    }
    throw new Error("المنشور غير موجود");
  },

  deletePost(id: number) {
    const db = getLocalDb();
    db.showcases.forEach((showcase) => {
      showcase.posts = showcase.posts.filter((p) => p.id !== id);
    });
    saveLocalDb();
    return { success: true };
  },

  recordView(id: number) {
    const db = getLocalDb();
    for (const showcase of db.showcases) {
      const post = showcase.posts.find((p) => p.id === id);
      if (post) {
        post.viewCount = (post.viewCount || 0) + 1;
        saveLocalDb();
        return post.viewCount;
      }
    }
    return 1;
  },
};

// ==================== Media Assets Local Store ====================

export const localMediaAssets = {
  list(limit = 120): LocalMediaAsset[] {
    const db = getLocalDb();
    if (!db.mediaAssets) db.mediaAssets = [];
    return [...db.mediaAssets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  create(data: any): LocalMediaAsset {
    const db = getLocalDb();
    if (!db.mediaAssets) db.mediaAssets = [];
    const asset: LocalMediaAsset = {
      id: db.nextId.mediaAsset++,
      fileName: data.fileName,
      fileSize: data.fileSize || null,
      mimeType: data.mimeType || null,
      storageKey: data.storageKey || null,
      url: data.url || data.publicUrl || "",
      kind: data.kind || "image",
      altText: data.altText || null,
      uploadedBy: data.uploadedBy || 1,
      createdAt: new Date(),
    };
    db.mediaAssets.unshift(asset);
    saveLocalDb();
    return asset;
  },

  delete(id: number) {
    const db = getLocalDb();
    if (db.mediaAssets) {
      db.mediaAssets = db.mediaAssets.filter((a) => a.id !== id);
      saveLocalDb();
    }
    return { success: true };
  },
};

export const localSettings = {
  get(key: string): string | undefined {
    const db = getLocalDb();
    if (!db.settings) db.settings = {};
    return db.settings[key];
  },
  set(key: string, value: string): void {
    const db = getLocalDb();
    if (!db.settings) db.settings = {};
    db.settings[key] = value;
    saveLocalDb();
  },
};

export const localAdmissions = {
  list(): LocalAdmissionLead[] {
    const db = getLocalDb();
    if (!db.admissions) db.admissions = [];
    return [...db.admissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  create(data: Omit<LocalAdmissionLead, "id" | "createdAt" | "updatedAt" | "status">): LocalAdmissionLead {
    const db = getLocalDb();
    if (!db.admissions) db.admissions = [];
    if (!db.nextId.admission) db.nextId.admission = (db.admissions.length || 0) + 1;
    const item: LocalAdmissionLead = {
      id: db.nextId.admission++,
      ...data,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.admissions.unshift(item);
    saveLocalDb();
    return item;
  },
  updateStatus(id: number, status: LocalAdmissionLead["status"]): LocalAdmissionLead | null {
    const db = getLocalDb();
    if (!db.admissions) db.admissions = [];
    const item = db.admissions.find((a: LocalAdmissionLead) => a.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date();
    saveLocalDb();
    return item;
  },
  delete(id: number): boolean {
    const db = getLocalDb();
    if (!db.admissions) db.admissions = [];
    db.admissions = db.admissions.filter((a: LocalAdmissionLead) => a.id !== id);
    saveLocalDb();
    return true;
  },
};


