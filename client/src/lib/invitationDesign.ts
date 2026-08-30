export type InvitationLayerKind = "text" | "details" | "guest" | "qr" | "shape" | "image";
export type InvitationLayer = { id: string; kind: InvitationLayerKind; name: string; x: number; y: number; width: number; height: number; z: number; visible: boolean; text?: string; color?: string; font?: string; fontSize?: number; backgroundColor?: string; borderColor?: string; borderRadius?: number; opacity?: number; shape?: "card" | "arch" | "circle" | "ribbon" | "divider" | "ticket" | "stamp" | "barcode"; imageUrl?: string };
export type InvitationLayoutConfig = {
  sourceTemplateId?: string;
  titleX: number; titleY: number; titleSize: number; titleColor: string; titleFont: string;
  subtitleX: number; subtitleY: number; subtitleSize: number; subtitleColor: string; subtitleFont: string;
  detailsX: number; detailsY: number; guestX: number; guestY: number; guestWidth: number;
  qrX: number; qrY: number; qrSize: number; panelOpacity: number; layers?: InvitationLayer[];
};

export const defaultInvitationLayout: InvitationLayoutConfig = {
  titleX: 600, titleY: 250, titleSize: 54, titleColor: "#fbfcff", titleFont: "Tajawal",
  subtitleX: 600, subtitleY: 326, subtitleSize: 23, subtitleColor: "#d6dce7", subtitleFont: "Tajawal",
  detailsX: 600, detailsY: 415, guestX: 90, guestY: 515, guestWidth: 1020,
  qrX: 90, qrY: 955, qrSize: 220, panelOpacity: 57,
};

const layerKinds: InvitationLayerKind[] = ["text", "details", "guest", "qr", "shape", "image"];
export function isInvitationLayer(value: unknown): value is InvitationLayer {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.name === "string" && layerKinds.includes(item.kind as InvitationLayerKind) && ["x", "y", "width", "height", "z"].every((key) => typeof item[key] === "number");
}
export function makeInvitationLayer(kind: InvitationLayerKind, index = 0): InvitationLayer {
  const id = `${kind}-${Date.now()}-${index}`;
  const base = { id, kind, x: 180, y: 760, width: 840, height: 90, z: 20 + index, visible: true, opacity: 100, color: "#ffffff", font: "Tajawal", fontSize: 30, borderRadius: 20, backgroundColor: "rgba(6,12,22,.45)", borderColor: "#e8c66d" };
  if (kind === "text") return { ...base, name: "نص جديد", text: "اكتب نصك هنا" };
  if (kind === "shape") return { ...base, name: "لوحة زخرفية", height: 160, shape: "card" };
  if (kind === "image") return { ...base, name: "صورة أو شعار", width: 190, height: 190, imageUrl: "" };
  if (kind === "qr") return { ...base, name: "رمز تحقق", width: 220, height: 220 };
  if (kind === "guest") return { ...base, name: "بطاقة الضيف", height: 290 };
  return { ...base, name: "تفاصيل المناسبة", height: 55 };
}

export function parseInvitationLayout(value?: string | null): InvitationLayoutConfig {
  try {
    const parsed = JSON.parse(value || "{}");
    if (!parsed || typeof parsed !== "object") return defaultInvitationLayout;
    const numeric = Object.fromEntries(Object.entries(parsed).filter(([, item]) => typeof item === "number"));
    const colors = Object.fromEntries(["titleColor", "subtitleColor"].filter((key) => typeof parsed[key] === "string" && /^#[0-9a-fA-F]{6}$/.test(parsed[key])).map((key) => [key, parsed[key]]));
    const fonts = Object.fromEntries(["titleFont", "subtitleFont"].filter((key) => ["Tajawal", "Cairo", "Amiri", "Noto Kufi Arabic"].includes(parsed[key])).map((key) => [key, parsed[key]]));
    const source = typeof parsed.sourceTemplateId === "string" ? { sourceTemplateId: parsed.sourceTemplateId } : {};
    const layers = Array.isArray(parsed.layers) ? (parsed.layers.filter(isInvitationLayer) as InvitationLayer[]).map((layer: InvitationLayer) => ({ ...layer, visible: layer.visible !== false, opacity: typeof layer.opacity === "number" ? layer.opacity : 100, borderRadius: typeof layer.borderRadius === "number" ? layer.borderRadius : 20 })) : undefined;
    return { ...defaultInvitationLayout, ...numeric, ...colors, ...fonts, ...source, ...(layers?.length ? { layers } : {}) };
  } catch { return defaultInvitationLayout; }
}

const art = {
  palace: "/manus-storage/invitation-palace-arches_39b67295.jpg",
  marble: "/manus-storage/invitation-marble-gold_2ab49790.jpg",
  cinema: "/manus-storage/invitation-cinema-velvet_4031e2d2.jpg",
  emerald: "/manus-storage/invitation-emerald-garden_5e4ab10d.jpg",
  celestial: "/manus-storage/invitation-celestial_39cc2210.jpg",
} as const;

export const invitationTemplates = [
  { id: "royal", name: "قصر المرايا", description: "قوس ذهبي داخل قصر ليلي؛ تصميم حفلات ملكي", surface: "linear-gradient(145deg,#241708,#080909)", accent: "#e8c66d", ink: "#fff8e7", layout: "arch", family: "arch", artUrl: art.palace },
  { id: "minimal", name: "مرمر إيطالي", description: "غلاف مجلة وعروق شامبين لتصميم ناعم", surface: "linear-gradient(145deg,#fffefb,#ddd5c9)", accent: "#ad8151", ink: "#29231e", layout: "marble", family: "magazine", artUrl: art.marble },
  { id: "modern", name: "أضواء المسرح", description: "تذكرة دخول عصرية بإضاءة سينمائية", surface: "linear-gradient(145deg,#081b38,#43205b)", accent: "#76ecff", ink: "#f6fbff", layout: "poster", family: "ticket", artUrl: art.cinema },
  { id: "luxury", name: "حديقة الزمرد", description: "بطاقة بريدية فنية من حديقة ليلية", surface: "linear-gradient(145deg,#0d3a31,#061815)", accent: "#edc76b", ink: "#f7fff8", layout: "gallery", family: "postcard", artUrl: art.emerald },
  { id: "floral", name: "ورد وحرير", description: "دعوة حريرية بشريط احتفالي", surface: "linear-gradient(145deg,#6b2444,#250d21)", accent: "#ffd1e1", ink: "#fff8fb", layout: "ribbon", family: "ribbon", artUrl: art.cinema },
  { id: "midnight", name: "بلاك تاي", description: "بطاقة VIP معتمدة من الحبر والذهب", surface: "linear-gradient(145deg,#0d1930,#050812)", accent: "#d7a955", ink: "#fbf6e9", layout: "formal", family: "vip", artUrl: art.palace },
  { id: "pearl", name: "اللؤلؤ السائل", description: "تذكرة طولية ببريق لؤلؤي وختم QR", surface: "linear-gradient(145deg,#faf4ec,#cfbda9)", accent: "#bd8d52", ink: "#403028", layout: "halo", family: "tall-ticket", artUrl: art.marble },
  { id: "aurora", name: "أورورا كريستال", description: "دعوة مقسومة بهوية بصرية سينمائية", surface: "linear-gradient(145deg,#0b2951,#552461)", accent: "#9beaff", ink: "#f4f8ff", layout: "split", family: "split", artUrl: art.celestial },
  { id: "sapphire", name: "ياقوت أزرق", description: "تصريح VIP مخملي بتفاصيل فضية", surface: "linear-gradient(145deg,#12376a,#07142e)", accent: "#e4bf68", ink: "#fff9eb", layout: "formal", family: "vip", artUrl: art.celestial },
  { id: "rose", name: "مخمل وردي", description: "بطاقة بريدية حميمية للحفلات الخاصة", surface: "linear-gradient(145deg,#7b2c53,#240d20)", accent: "#ffd0dc", ink: "#fff9fb", layout: "arch", family: "postcard", artUrl: art.cinema },
  { id: "obsidian", name: "أوبسيديان", description: "غلاف مجلة أسود بحروف كبيرة", surface: "linear-gradient(145deg,#29292e,#030304)", accent: "#e7c16c", ink: "#fffdf7", layout: "gallery", family: "magazine", artUrl: art.palace },
  { id: "artdeco", name: "آرت ديكو", description: "بوستر هندسي لحفلات النخبة", surface: "linear-gradient(145deg,#1f2135,#090a11)", accent: "#e7bb58", ink: "#fff7df", layout: "poster", family: "poster", artUrl: art.cinema },
  { id: "celestial", name: "سماء مخملية", description: "دعوة هالة ليلية للحفل الساحر", surface: "linear-gradient(145deg,#152a56,#0b1028)", accent: "#b9d8ff", ink: "#f8fbff", layout: "halo", family: "halo", artUrl: art.celestial },
  { id: "heritage", name: "تراث ذهبي", description: "رسالة تحريرية بدفء رخام قديم", surface: "linear-gradient(145deg,#efe2c8,#b59362)", accent: "#805025", ink: "#332013", layout: "marble", family: "editorial", artUrl: art.marble },
  { id: "cinema", name: "ليلة العرض", description: "برنامج مسرحي وتذكرة عرض احتفالية", surface: "linear-gradient(145deg,#42132c,#120915)", accent: "#ffcf70", ink: "#fff7ed", layout: "poster", family: "stage", artUrl: art.cinema },
  { id: "custom", name: "قالبك الحر", description: "استوديو مفتوح لحرك كل العناصر", surface: "linear-gradient(145deg,#1c2230,#0a0e16)", accent: "#f2bc52", ink: "#f8fafc", layout: "custom", family: "studio", artUrl: art.palace },
] as const;

export type InvitationTemplateId = (typeof invitationTemplates)[number]["id"];
export function isInvitationTemplateId(value: string | null | undefined): value is InvitationTemplateId { return invitationTemplates.some((template) => template.id === value); }
export function getInvitationTemplate(value: string | null | undefined) { return invitationTemplates.find((template) => template.id === value) ?? invitationTemplates[0]; }

export function getInvitationTemplateLayers(value: string | null | undefined, layout: InvitationLayoutConfig): InvitationLayer[] {
  const template = getInvitationTemplate(value); const ink = template.ink; const accent = template.accent;
  const layer = (id: string, kind: InvitationLayerKind, name: string, x: number, y: number, width: number, height: number, z: number, extra: Partial<InvitationLayer> = {}): InvitationLayer => ({ id, kind, name, x, y, width, height, z, visible: true, opacity: 100, color: ink, font: "Tajawal", fontSize: 28, backgroundColor: "rgba(5,10,18,.48)", borderColor: accent, borderRadius: 20, ...extra });
  const content = () => [
    layer("logo", "image", "شعار الدعوة", 1040, 68, 86, 86, 70, { imageUrl: "{{logo}}", borderRadius: 16 }),
    layer("title", "text", "عنوان الدعوة", layout.titleX - 465, layout.titleY - 54, 930, 108, 30, { text: "{{title}}", color: layout.titleColor, font: layout.titleFont, fontSize: layout.titleSize }),
    layer("subtitle", "text", "النص المرافق", layout.subtitleX - 440, layout.subtitleY - 36, 880, 72, 31, { text: "{{subtitle}}", color: layout.subtitleColor, font: layout.subtitleFont, fontSize: layout.subtitleSize }),
    layer("details", "details", "تفاصيل المناسبة", layout.detailsX - 400, layout.detailsY - 30, 800, 60, 35),
    layer("guest", "guest", "بطاقة الضيف", layout.guestX, layout.guestY, layout.guestWidth, 290, 40),
    layer("qr", "qr", "رمز التحقق", layout.qrX, layout.qrY, layout.qrSize, layout.qrSize, 50),
  ];
  if (template.family === "ticket") return [layer("ticket-shell", "shape", "جسم التذكرة", 60, 700, 1080, 660, 5, { shape: "ticket", backgroundColor: "rgba(4,10,27,.72)", borderRadius: 38 }), layer("ticket-label", "text", "شارة الدخول", 820, 720, 250, 45, 20, { text: "ADMIT ONE", color: accent, fontSize: 20 }), ...content(), layer("ticket-code", "text", "نص البوابة", 760, 1210, 310, 35, 45, { text: "PRESENT AT GATE", color: accent, fontSize: 15 })];
  if (template.family === "vip") return [layer("vip-frame", "shape", "إطار VIP", 58, 350, 1084, 790, 5, { shape: "card", backgroundColor: "rgba(2,6,15,.72)", borderRadius: 42 }), layer("vip-label", "text", "شارة VIP", 790, 375, 270, 50, 20, { text: "VIP ACCESS", color: accent, fontSize: 28 }), ...content(), layer("vip-bars", "shape", "شريط دخول", 120, 1040, 940, 50, 45, { shape: "barcode", backgroundColor: accent })];
  if (template.family === "magazine") return [layer("mag-header", "text", "ترويسة المجلة", 710, 105, 350, 35, 10, { text: "THE EVENT EDIT", color: accent, fontSize: 17 }), layer("mag-rule", "shape", "خط تحريري", 100, 490, 720, 6, 20, { shape: "divider", backgroundColor: accent, borderRadius: 0 }), ...content(), layer("mag-issue", "text", "رقم الإصدار", 820, 1350, 240, 35, 45, { text: "ISSUE · 2026", color: accent, fontSize: 17 })];
  if (template.family === "postcard") return [layer("postcard-shell", "shape", "بطاقة بريدية", 78, 610, 1044, 650, 5, { shape: "card", backgroundColor: "rgba(255,255,255,.13)", borderRadius: 28 }), layer("postcard-divider", "shape", "فاصل البطاقة", 598, 665, 4, 535, 10, { shape: "divider", backgroundColor: accent, borderRadius: 0 }), ...content(), layer("postcard-note", "text", "تحية البطاقة", 135, 1080, 420, 50, 45, { text: "تحية من هذه المناسبة", color: ink, fontSize: 20 })];
  if (template.family === "tall-ticket") return [layer("pass-shell", "shape", "تذكرة طولية", 190, 400, 820, 880, 5, { shape: "ticket", backgroundColor: "rgba(255,255,255,.63)", borderRadius: 55 }), ...content(), layer("pass-label", "text", "تأكيد الدخول", 400, 1200, 400, 35, 45, { text: "PRESENT THIS PASS", color: accent, fontSize: 17 })];
  if (template.family === "split") return [layer("split-panel", "shape", "لوحة جانبية", 0, 0, 410, 1500, 5, { shape: "card", backgroundColor: "rgba(3,9,23,.58)", borderRadius: 0 }), layer("split-event", "text", "اسم القسم", 90, 120, 230, 42, 20, { text: "EVENT", color: accent, fontSize: 22 }), ...content()];
  if (template.family === "stage") return [layer("stage-shell", "shape", "لوحة البرنامج", 70, 560, 1060, 645, 5, { shape: "card", backgroundColor: "rgba(10,2,7,.58)", borderRadius: 28 }), layer("stage-heading", "text", "اسم البرنامج", 390, 125, 420, 40, 20, { text: "PROGRAMME", color: accent, fontSize: 20 }), layer("stage-note", "text", "فقرة الحفل", 660, 635, 380, 50, 25, { text: "الفقرة الرئيسية", color: accent, fontSize: 18 }), ...content()];
  if (template.family === "ribbon") return [layer("ribbon", "shape", "الشريط الاحتفالي", 0, 95, 680, 92, 5, { shape: "ribbon", backgroundColor: accent, borderRadius: 0 }), layer("ribbon-label", "text", "عنوان الشريط", 290, 115, 280, 40, 20, { text: "دعوة احتفالية", color: "#211019", fontSize: 22 }), ...content()];
  if (template.family === "editorial") return [layer("editorial-label", "text", "ترويسة الرسالة", 770, 100, 290, 40, 10, { text: "دعوة خاصة", color: accent, fontSize: 20 }), layer("editorial-rule", "shape", "خط الرسالة", 100, 465, 700, 5, 20, { shape: "divider", backgroundColor: accent, borderRadius: 0 }), ...content()];
  if (template.family === "poster") return [layer("poster-word", "text", "كلمة البوستر", 95, 130, 400, 120, 10, { text: "THE\nMOMENT", color: accent, fontSize: 70 }), ...content()];
  if (template.family === "halo" || template.family === "arch") return [layer("hero-shape", "shape", "هالة زخرفية", 365, 70, 470, 470, 5, { shape: template.family === "arch" ? "arch" : "circle", backgroundColor: "rgba(0,0,0,0)", borderColor: accent, borderRadius: 240 }), ...content()];
  return [layer("studio-title", "text", "اسم الاستوديو", 380, 125, 440, 40, 10, { text: "YOUR STUDIO", color: accent, fontSize: 20 }), ...content()];
}

export function getInvitationTemplateLayout(value: string | null | undefined): InvitationLayoutConfig {
  const template = getInvitationTemplate(value);
  const layouts: Record<string, Partial<InvitationLayoutConfig>> = {
    royal: { titleX: 600, titleY: 450, subtitleX: 600, subtitleY: 525, detailsX: 600, detailsY: 620, guestX: 150, guestY: 720, guestWidth: 900, qrX: 495, qrY: 1120, qrSize: 210 },
    minimal: { titleX: 600, titleY: 255, subtitleX: 600, subtitleY: 330, detailsX: 600, detailsY: 410, guestX: 145, guestY: 610, guestWidth: 910, qrX: 490, qrY: 1050, qrSize: 220 },
    modern: { titleX: 870, titleY: 450, subtitleX: 870, subtitleY: 540, detailsX: 790, detailsY: 635, guestX: 145, guestY: 765, guestWidth: 910, qrX: 90, qrY: 1190, qrSize: 210 },
    luxury: { titleX: 600, titleY: 650, subtitleX: 600, subtitleY: 725, detailsX: 600, detailsY: 810, guestX: 150, guestY: 895, guestWidth: 900, qrX: 490, qrY: 1210, qrSize: 220 },
    floral: { titleX: 600, titleY: 315, subtitleX: 600, subtitleY: 390, detailsX: 600, detailsY: 475, guestX: 130, guestY: 555, guestWidth: 940, qrX: 130, qrY: 1030, qrSize: 210 },
    midnight: { titleX: 600, titleY: 160, subtitleX: 600, subtitleY: 218, detailsX: 600, detailsY: 310, guestX: 385, guestY: 410, guestWidth: 705, qrX: 110, qrY: 410, qrSize: 220 },
    pearl: { titleX: 600, titleY: 390, subtitleX: 600, subtitleY: 465, detailsX: 600, detailsY: 550, guestX: 150, guestY: 650, guestWidth: 900, qrX: 490, qrY: 1060, qrSize: 220 },
    aurora: { titleX: 860, titleY: 190, subtitleX: 860, subtitleY: 270, detailsX: 770, detailsY: 350, guestX: 470, guestY: 470, guestWidth: 640, qrX: 88, qrY: 1040, qrSize: 220 },
    sapphire: { titleX: 600, titleY: 185, subtitleX: 600, subtitleY: 245, detailsX: 600, detailsY: 335, guestX: 375, guestY: 445, guestWidth: 715, qrX: 105, qrY: 445, qrSize: 215 },
    rose: { titleX: 600, titleY: 455, subtitleX: 600, subtitleY: 530, detailsX: 600, detailsY: 620, guestX: 145, guestY: 730, guestWidth: 910, qrX: 495, qrY: 1130, qrSize: 210 },
    obsidian: { titleX: 600, titleY: 660, subtitleX: 600, subtitleY: 735, detailsX: 600, detailsY: 820, guestX: 150, guestY: 905, guestWidth: 900, qrX: 490, qrY: 1220, qrSize: 220 },
    artdeco: { titleX: 860, titleY: 430, subtitleX: 860, subtitleY: 520, detailsX: 790, detailsY: 615, guestX: 145, guestY: 745, guestWidth: 910, qrX: 90, qrY: 1180, qrSize: 210 },
    celestial: { titleX: 600, titleY: 405, subtitleX: 600, subtitleY: 480, detailsX: 600, detailsY: 565, guestX: 150, guestY: 670, guestWidth: 900, qrX: 490, qrY: 1080, qrSize: 220 },
    heritage: { titleX: 600, titleY: 265, subtitleX: 600, subtitleY: 340, detailsX: 600, detailsY: 425, guestX: 145, guestY: 625, guestWidth: 910, qrX: 490, qrY: 1060, qrSize: 220 },
    cinema: { titleX: 850, titleY: 465, subtitleX: 850, subtitleY: 555, detailsX: 790, detailsY: 650, guestX: 145, guestY: 780, guestWidth: 910, qrX: 90, qrY: 1200, qrSize: 210 },
    custom: {},
  };
  const seed = { ...defaultInvitationLayout, ...layouts[template.id], sourceTemplateId: template.id, titleColor: template.ink, subtitleColor: template.ink, titleFont: "Tajawal", subtitleFont: "Tajawal" };
  return { ...seed, layers: getInvitationTemplateLayers(template.id, seed) };
}
