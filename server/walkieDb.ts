import { localSettings } from "./localStore";
import { GoogleGenAI } from "@google/genai";

export type WalkieChannel = {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  description: string;
};

export const WALKIE_CHANNELS: WalkieChannel[] = [
  {
    id: "channel-1",
    name: "التردد العام الشامل",
    code: "ALL-01",
    color: "#ef4444",
    icon: "Megaphone",
    description: "للإعلانات الإدارية العامة والنداءات العاجلة لكافة الكادر",
  },
  {
    id: "channel-2",
    name: "الإشراف والفناء والملاعب",
    code: "YARD-02",
    color: "#eab308",
    icon: "ShieldAlert",
    description: "لتنظيم الطابور الصباحي، الفسحة، وحركة الطلاب بالممرات",
  },
  {
    id: "channel-3",
    name: "البوابات وانصراف الباصات",
    code: "GATE-03",
    color: "#22c55e",
    icon: "Bus",
    description: "للنداء على الطلاب عند البوابات وتنسيق مغادرة الحافلات",
  },
  {
    id: "channel-4",
    name: "غرفة التحكم وتغطية المسرح",
    code: "STAGE-04",
    color: "#3b82f6",
    icon: "Radio",
    description: "لفريق الصوت والإضاءة والمصورين أثناء الحفلات والفعاليات",
  },
];

export type WalkieDispatchMessage = {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string | null;
  audioBase64?: string | null;
  audioUrl?: string | null;
  durationSec: number;
  transcriptText: string;
  isEmergency: boolean;
  createdAt: string;
};

const DEFAULT_WALKIE_MESSAGES: WalkieDispatchMessage[] = [
  {
    id: "msg-1",
    channelId: "channel-1",
    senderName: "أ. عبد الرحمن خليل",
    senderRole: "مدير الشؤون الميدانية",
    durationSec: 5,
    transcriptText: "تنبيه عام: يرجى من مشرفي الأدوار التواجد عند مخارج الطوارئ لضبط حركة الانصراف.",
    isEmergency: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "msg-2",
    channelId: "channel-3",
    senderName: "أ. ماجد الحربي",
    senderRole: "مشرف البوابة 2",
    durationSec: 4,
    transcriptText: "انصراف الحافلة رقم 4 (بنين) متجهة إلى حي باقدو، يرجى خروج الطلاب.",
    isEmergency: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
];

export async function listWalkieMessages(channelId?: string): Promise<WalkieDispatchMessage[]> {
  const raw = localSettings.get("aqeeq_walkie_messages");
  let list: WalkieDispatchMessage[] = DEFAULT_WALKIE_MESSAGES;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  }
  if (!raw) {
    localSettings.set("aqeeq_walkie_messages", JSON.stringify(DEFAULT_WALKIE_MESSAGES));
  }
  if (channelId && channelId !== "all") {
    return list.filter((m) => m.channelId === channelId).slice(0, 30);
  }
  return list.slice(0, 30);
}

export async function sendWalkieDispatch(data: {
  channelId: string;
  senderName: string;
  senderRole?: string;
  audioBase64?: string;
  audioUrl?: string;
  durationSec?: number;
  transcriptText?: string;
  isEmergency?: boolean;
}): Promise<WalkieDispatchMessage> {
  const raw = localSettings.get("aqeeq_walkie_messages");
  let list: WalkieDispatchMessage[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch {}
  }

  let text = data.transcriptText?.trim() || "";

  // If no transcript provided but audio exists, generate AI transcript
  if (!text && data.audioBase64) {
    text = await transcribeAudioWithGemini(data.audioBase64);
  }
  if (!text) {
    text = "رسالة صوتية واردة عبر جهاز اللاسلكي الإداري 🎙️";
  }

  const newMessage: WalkieDispatchMessage = {
    id: `walkie-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    channelId: data.channelId,
    senderName: data.senderName.trim() || "موظف إداري",
    senderRole: data.senderRole || "الكادر المدرسي",
    audioBase64: data.audioBase64 || null,
    audioUrl: data.audioUrl || null,
    durationSec: data.durationSec || 5,
    transcriptText: text,
    isEmergency: Boolean(data.isEmergency),
    createdAt: new Date().toISOString(),
  };

  list.unshift(newMessage);
  if (list.length > 80) list = list.slice(0, 80);
  localSettings.set("aqeeq_walkie_messages", JSON.stringify(list));
  return newMessage;
}

export async function transcribeAudioWithGemini(audioBase64: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return "نداء صوتي عبر جهاز اللاسلكي المدرسي";

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "audio/webm",
                data: cleanBase64,
              },
            },
            {
              text: "قم بتفريغ هذا النداء الصوتي المدرسي بدقة إلى نص باللغة العربية. اكتب النص المسموع فقط دون أي إضافات.",
            },
          ],
        },
      ],
    });

    return res.text?.trim() || "نداء صوتي عبر جهاز اللاسلكي المدرسي";
  } catch (err) {
    console.warn("Audio transcription error:", err);
    return "نداء صوتي عبر جهاز اللاسلكي المدرسي";
  }
}
