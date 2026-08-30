export type AudioPreset = {
  id: string;
  title: string;
  subtitle: string;
  category: "royal" | "celebration" | "ambient" | "piano";
  url: string;
};

export const AQEEQ_AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "royal-acoustic",
    title: "أنغام العقيق الملكية",
    subtitle: "مقطوعة وتريات هادئة وفخمة",
    category: "royal",
    url: "/audio/aqeeq-royal.mp3",
  },
  {
    id: "celebration-fanfare",
    title: "حفل التخرج والاحتفاء",
    subtitle: "إيقاع احتفالي فخم ومبهج",
    category: "celebration",
    url: "/audio/aqeeq-celebration.mp3",
  },
  {
    id: "ambient-piano",
    title: "بيانو هادئ وملهم",
    subtitle: "لحن بيانو دافئ ومريح للقراءة",
    category: "piano",
    url: "/audio/aqeeq-piano.mp3",
  },
  {
    id: "luxury-glow",
    title: "أجواء العقيق العصرية",
    subtitle: "أنغام محيطية ناعمة",
    category: "ambient",
    url: "/audio/aqeeq-ambient.mp3",
  },
];

const DEFAULT_AUDIO_STORAGE_KEY = "aqeeq_default_background_audio";

export function getAqeeqDefaultBackgroundAudio(): string | null {
  if (typeof window === "undefined") return "/audio/aqeeq-royal.mp3";
  try {
    return localStorage.getItem(DEFAULT_AUDIO_STORAGE_KEY) || AQEEQ_AUDIO_PRESETS[0].url;
  } catch {
    return AQEEQ_AUDIO_PRESETS[0].url;
  }
}

export function setAqeeqDefaultBackgroundAudio(url: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (url) {
      localStorage.setItem(DEFAULT_AUDIO_STORAGE_KEY, url);
    } else {
      localStorage.removeItem(DEFAULT_AUDIO_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Extracts and converts a Google Drive file link into a zero-disk streaming URL.
 */
export function parseGoogleDriveAudioUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const idMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/^([a-zA-Z0-9_-]{20,})$/);
  if (idMatch) {
    return `/api/drive-audio-proxy/${idMatch[1]}`;
  }
  return null;
}
