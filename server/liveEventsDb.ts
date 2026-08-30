import { localSettings } from "./localStore";

export type AqeeqLiveMoment = {
  id: number;
  eventId: number;
  title: string;
  content: string;
  mediaUrl?: string | null;
  mediaType: "image" | "video" | "text";
  minuteMarker: string;
  reactions: { hearts: number; claps: number; stars: number; fires: number };
  createdAt: string;
};

export type AqeeqLiveEvent = {
  id: number;
  title: string;
  slug: string;
  status: "live" | "ended" | "scheduled";
  description: string;
  coverUrl?: string | null;
  liveStreamUrl?: string | null;
  totalReactions: { hearts: number; claps: number; stars: number; fires: number };
  moments: AqeeqLiveMoment[];
  startDate: string;
  createdAt: string;
};

const DEFAULT_LIVE_EVENTS: AqeeqLiveEvent[] = [
  {
    id: 1,
    title: "التغطية الحية المباشرة: حفل ختام العام وتكريم أوائل الطلبة 🎓",
    slug: "annual-graduation-live-2026",
    status: "live",
    description: "متابعة دقيقة بدقيقة لكافة فعاليات حفل التخرج وتكريم الخريجين والخريجات وأولياء الأمور الكرام.",
    coverUrl: "/og-preview.png",
    liveStreamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    totalReactions: { hearts: 480, claps: 320, stars: 210, fires: 175 },
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    moments: [
      {
        id: 1,
        eventId: 1,
        title: "بدء مراسم طابور العرض ومسيرة الخريجين والخريجات 🎓",
        content: "دخول مهيب لدفعة التميز 2026 إلى المسرح الرئيسي وسط تصفيق وترحيب حار من أولياء الأمور والهيئة الإدارية والتعليمية.",
        mediaUrl: "/favicon.png",
        mediaType: "image",
        minuteMarker: "10:00 ص",
        reactions: { hearts: 140, claps: 95, stars: 60, fires: 45 },
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: 2,
        eventId: 1,
        title: "كلمة سعادة المدير العام ورسالة الفخر والاعتزاز 🎙️",
        content: "ألقى سعادة مدير عام المدارس كلمة ضافية هنأ فيها الخريجين وأشاد بإنجازاتهم في المسابقات الوطنية والدولية.",
        mediaUrl: null,
        mediaType: "text",
        minuteMarker: "10:20 ص",
        reactions: { hearts: 110, claps: 85, stars: 50, fires: 40 },
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: 3,
        eventId: 1,
        title: "لحظة تسليم دروع التميز وشهادات التخرج 🏅",
        content: "بدء صعود الفرسان إلى منصة الشرف لاستلام دروع التفوق والتقاط الصور التذكارية الفردية والجماعية.",
        mediaUrl: "/og-preview.png",
        mediaType: "image",
        minuteMarker: "10:45 ص",
        reactions: { hearts: 230, claps: 140, stars: 100, fires: 90 },
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
  },
];

export async function listAllLiveEvents(): Promise<AqeeqLiveEvent[]> {
  const raw = localSettings.get("aqeeq_live_events_list");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  localSettings.set("aqeeq_live_events_list", JSON.stringify(DEFAULT_LIVE_EVENTS));
  return DEFAULT_LIVE_EVENTS;
}

export async function getLiveEvent(slugOrId?: string): Promise<AqeeqLiveEvent | undefined> {
  const all = await listAllLiveEvents();
  if (!slugOrId) {
    return all.find((e) => e.status === "live") || all[0];
  }
  return all.find((e) => e.slug === slugOrId || String(e.id) === slugOrId);
}

export async function addEventMoment(
  eventId: number,
  data: {
    title: string;
    content: string;
    mediaUrl?: string;
    mediaType?: "image" | "video" | "text";
    minuteMarker?: string;
  }
): Promise<AqeeqLiveMoment | undefined> {
  const all = await listAllLiveEvents();
  const event = all.find((e) => e.id === eventId);
  if (!event) return undefined;

  const now = new Date();
  const momentId = event.moments.length > 0 ? Math.max(...event.moments.map((m) => m.id)) + 1 : 1;
  const minuteMarker =
    data.minuteMarker ||
    now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  const newMoment: AqeeqLiveMoment = {
    id: momentId,
    eventId,
    title: data.title.trim(),
    content: data.content.trim(),
    mediaUrl: data.mediaUrl || null,
    mediaType: data.mediaType || "text",
    minuteMarker,
    reactions: { hearts: 0, claps: 0, stars: 0, fires: 0 },
    createdAt: now.toISOString(),
  };

  event.moments.unshift(newMoment);
  localSettings.set("aqeeq_live_events_list", JSON.stringify(all));
  return newMoment;
}

export async function reactToEvent(
  eventId: number,
  type: "hearts" | "claps" | "stars" | "fires",
  momentId?: number
): Promise<{ total: number }> {
  const all = await listAllLiveEvents();
  const event = all.find((e) => e.id === eventId);
  if (!event) return { total: 0 };

  if (!event.totalReactions) {
    event.totalReactions = { hearts: 0, claps: 0, stars: 0, fires: 0 };
  }
  event.totalReactions[type] = (event.totalReactions[type] || 0) + 1;

  if (momentId) {
    const m = event.moments.find((x) => x.id === momentId);
    if (m) {
      if (!m.reactions) m.reactions = { hearts: 0, claps: 0, stars: 0, fires: 0 };
      m.reactions[type] = (m.reactions[type] || 0) + 1;
    }
  }

  localSettings.set("aqeeq_live_events_list", JSON.stringify(all));
  return { total: event.totalReactions[type] };
}

export async function setEventStatus(
  eventId: number,
  status: "live" | "ended" | "scheduled"
): Promise<AqeeqLiveEvent | undefined> {
  const all = await listAllLiveEvents();
  const event = all.find((e) => e.id === eventId);
  if (!event) return undefined;

  event.status = status;
  localSettings.set("aqeeq_live_events_list", JSON.stringify(all));
  return event;
}
