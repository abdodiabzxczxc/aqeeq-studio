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
    url: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  },
  {
    id: "celebration-fanfare",
    title: "حفل التخرج والاحتفاء",
    subtitle: "إيقاع احتفالي فخم ومبهج",
    category: "celebration",
    url: "https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3",
  },
  {
    id: "ambient-piano",
    title: "بيانو هادئ وملهم",
    subtitle: "لحن بيانو دافئ ومريح للقراءة",
    category: "piano",
    url: "https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3",
  },
  {
    id: "luxury-glow",
    title: "أجواء العقيق العصرية",
    subtitle: "أنغام إلكترونية محيطية ناعمة",
    category: "ambient",
    url: "https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3",
  },
];
