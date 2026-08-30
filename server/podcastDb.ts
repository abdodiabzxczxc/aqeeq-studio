import { localSettings } from "./localStore";

export type AqeeqPodcast = {
  id: number;
  title: string;
  slug: string;
  description: string;
  mediaType: "audio" | "video";
  sourceType: "drive" | "youtube" | "direct";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  duration: string;
  category: "إذاعة الصباح" | "بودكاست قيادات" | "تغطيات صوتية" | "حوارات الطلاب" | "نشرات إخبارية";
  hostName?: string;
  publishedAt: string;
  viewCount: number;
  likesCount: number;
  createdAt: string;
};

const DEFAULT_PODCASTS: AqeeqPodcast[] = [
  {
    id: 1,
    title: "الحلقة 01: كيف تصنع شغف التعلم والابتكار لدى أبنائك؟",
    slug: "passion-for-learning-ep1",
    description: "حوار إذاعي ملهم مع قيادات مدارس العقيق حول غرس عادات القراءة والتفكير الإبداعي ومهارات الذكاء الاصطناعي لدى الأجيال الصاعدة.",
    mediaType: "audio",
    sourceType: "direct",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnailUrl: "/og-preview.png",
    coverUrl: "/og-preview.png",
    duration: "14:32",
    category: "بودكاست قيادات",
    hostName: "أ. عبد الرحمن خليل & د. خالد السبيعي",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    viewCount: 312,
    likesCount: 54,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "الإذاعة الصباحية المتميزة: إشراقة أمل ونبض الموهبة",
    slug: "morning-radio-ep2",
    description: "فقرات متنوعة قدمها فرسان وفراشات مدارس العقيق تشمل حكمة اليوم، وتجارب علمية، وقصائد وطنية من إلقاء الطلاب.",
    mediaType: "audio",
    sourceType: "direct",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    thumbnailUrl: "/alaqeeq-logo.png",
    coverUrl: "/og-preview.png",
    duration: "08:15",
    category: "إذاعة الصباح",
    hostName: "نادي الإذاعة والصحافة المدرسية",
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    viewCount: 420,
    likesCount: 88,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 3,
    title: "التغطية المرئية الكاملة: حفل ختام الأنشطة وتكريم المتفوقين",
    slug: "activities-closing-ceremony-video",
    description: "بث مرئي توثيقي لأبرز لحظات الفرح والتتويج في حفل ختام الأنشطة والبطولات الرياضية والمعارض العلمية.",
    mediaType: "video",
    sourceType: "youtube",
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/og-preview.png",
    coverUrl: "/og-preview.png",
    duration: "22:40",
    category: "تغطيات صوتية",
    hostName: "فريق الإعلام الرقمي بمدارس العقيق",
    publishedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    viewCount: 650,
    likesCount: 110,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export async function listAllPodcasts(): Promise<AqeeqPodcast[]> {
  const raw = localSettings.get("aqeeq_podcasts_list");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  localSettings.set("aqeeq_podcasts_list", JSON.stringify(DEFAULT_PODCASTS));
  return DEFAULT_PODCASTS;
}

export async function getPodcasts(category?: string, mediaType?: "audio" | "video", search?: string): Promise<AqeeqPodcast[]> {
  const all = await listAllPodcasts();
  return all
    .filter((p) => (!category || category === "all" ? true : p.category === category))
    .filter((p) => (!mediaType || mediaType === ("all" as any) ? true : p.mediaType === mediaType))
    .filter((p) => {
      if (!search || !search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.hostName && p.hostName.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getPodcastBySlug(slug: string): Promise<AqeeqPodcast | undefined> {
  const all = await listAllPodcasts();
  const podcast = all.find((p) => p.slug === slug || String(p.id) === slug);
  if (podcast) {
    podcast.viewCount = (podcast.viewCount || 0) + 1;
    localSettings.set("aqeeq_podcasts_list", JSON.stringify(all));
  }
  return podcast;
}

export async function createPodcast(data: {
  title: string;
  description: string;
  mediaType: "audio" | "video";
  sourceType: "drive" | "youtube" | "direct";
  mediaUrl: string;
  thumbnailUrl?: string;
  coverUrl?: string;
  duration?: string;
  category: "إذاعة الصباح" | "بودكاست قيادات" | "تغطيات صوتية" | "حوارات الطلاب" | "نشرات إخبارية";
  hostName?: string;
}): Promise<AqeeqPodcast> {
  const all = await listAllPodcasts();
  const now = new Date().toISOString();
  const id = all.length > 0 ? Math.max(...all.map((p) => p.id)) + 1 : 1;
  const slug = `podcast-${id}-${Date.now().toString(36)}`;

  const newPodcast: AqeeqPodcast = {
    id,
    title: data.title.trim(),
    slug,
    description: data.description.trim(),
    mediaType: data.mediaType,
    sourceType: data.sourceType,
    mediaUrl: data.mediaUrl.trim(),
    thumbnailUrl: data.thumbnailUrl || null,
    coverUrl: data.coverUrl || null,
    duration: data.duration || "10:00",
    category: data.category,
    hostName: data.hostName?.trim() || "مدارس العقيق",
    publishedAt: now,
    viewCount: 0,
    likesCount: 0,
    createdAt: now,
  };

  all.unshift(newPodcast);
  localSettings.set("aqeeq_podcasts_list", JSON.stringify(all));
  return newPodcast;
}

export async function updatePodcast(id: number, data: Partial<AqeeqPodcast>): Promise<AqeeqPodcast | undefined> {
  const all = await listAllPodcasts();
  const podcast = all.find((p) => p.id === id);
  if (!podcast) return undefined;

  Object.assign(podcast, data);
  localSettings.set("aqeeq_podcasts_list", JSON.stringify(all));
  return podcast;
}

export async function deletePodcast(id: number): Promise<boolean> {
  let all = await listAllPodcasts();
  all = all.filter((p) => p.id !== id);
  localSettings.set("aqeeq_podcasts_list", JSON.stringify(all));
  return true;
}

export async function likePodcast(id: number): Promise<number> {
  const all = await listAllPodcasts();
  const podcast = all.find((p) => p.id === id);
  if (podcast) {
    podcast.likesCount = (podcast.likesCount || 0) + 1;
    localSettings.set("aqeeq_podcasts_list", JSON.stringify(all));
    return podcast.likesCount;
  }
  return 0;
}
