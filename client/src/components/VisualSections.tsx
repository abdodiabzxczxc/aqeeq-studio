import { trpc } from "@/lib/trpc";
import { CalendarDays, CheckCircle2, ChevronLeft, Copy, GripVertical, Heart, ImageIcon, ImagePlus, Link2, MapPin, PlayCircle, Plus, Save, Sparkles, Star, Trash2, Users, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import GalleryManager from "./GalleryManager";
import MediaLibrary from "./MediaLibrary";
import { VisualEditable, VisualImage, VisualVideo, useVisualEditorState } from "./VisualEditor";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";

type SectionConfig = {
  anchorId?: string;
  builderElement?: "text" | "image" | "button" | "icon" | "shape";
  shapeType?: "rectangle" | "rounded" | "circle" | "pill" | "line" | "arch" | "diamond";
  shapeColor?: string;
  shapeLabel?: string;
  iconName?: "sparkles" | "star" | "calendar" | "location" | "guests" | "heart";
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageHref?: string;
  videoUrl?: string;
  videoHref?: string;
  titleHref?: string;
  bodyHref?: string;
  iconHref?: string;
  buttonText?: string;
  buttonHref?: string;
  items?: Array<{ title: string; body?: string; imageUrl?: string; imageHref?: string }>;
};

type BuilderSection = { id: number; sectionId: string; sectionType: "hero" | "features" | "gallery" | "video" | "cta" | "custom"; config: string; status: "draft" | "published"; orderIndex: number };

function parseConfig(raw: string): SectionConfig {
  try { return JSON.parse(raw) as SectionConfig; } catch { return {}; }
}

type MediaField = "imageUrl" | "videoUrl" | { itemIndex: number };

function SectionContentEditor({ section, pagePath, onClose }: { section: BuilderSection; pagePath: string; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<SectionConfig>(() => parseConfig(section.config));
  const [mediaField, setMediaField] = useState<MediaField | null>(null);
  useEffect(() => { setDraft(parseConfig(section.config)); }, [section.sectionId, section.config]);
  const save = trpc.visualEditor.sections.save.useMutation({
    onSuccess: () => {
      void utils.visualEditor.sections.list.invalidate({ pagePath });
      void utils.visualEditor.sections.publicList.invalidate({ pagePath });
      void utils.visualEditor.sections.history.invalidate({ pagePath });
      toast.success("تم حفظ محتوى القالب كمسودة");
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ محتوى القالب"),
  });
  const update = (patch: Partial<SectionConfig>) => setDraft((current) => ({ ...current, ...patch }));
  const updateItem = (index: number, patch: Partial<NonNullable<SectionConfig["items"]>[number]>) => setDraft((current) => ({ ...current, items: (current.items || []).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const isImage = mediaField === "imageUrl" || typeof mediaField === "object";
  const chooseMedia = (asset: { url: string; altText: string | null }) => {
    if (!mediaField) return;
    if (typeof mediaField === "object") updateItem(mediaField.itemIndex, { imageUrl: asset.url });
    else if (mediaField === "imageUrl") update({ imageUrl: asset.url, imageAlt: asset.altText || "" });
    else update({ videoUrl: asset.url });
    setMediaField(null);
  };
  const hasTitle = Boolean(draft.title !== undefined || section.sectionType !== "gallery");
  return <><aside className="fixed bottom-5 right-5 top-24 z-[140] flex w-[min(430px,calc(100vw-40px))] flex-col overflow-hidden rounded-3xl border border-sky-300/35 bg-[#111722]/[.98] shadow-[0_30px_90px_rgba(0,0,0,.68)] backdrop-blur-xl" dir="rtl">
    <header className="flex items-start justify-between border-b border-white/[0.08] p-4"><div><div className="text-[10px] font-black tracking-[0.15em] text-sky-300">EDIT THIS BLOCK</div><h2 className="mt-1 text-base font-black text-white">تعديل محتوى القالب</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">كل نص ووسيط ورابط في هذا القالب قابل للتعديل.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"><X size={17} /></button></header>
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
      {hasTitle ? <TextField label="العنوان" value={draft.title || ""} onChange={(title) => update({ title })} /> : null}
      <TextField label="رابط العنوان أو الوجهة عند النقر" value={draft.titleHref || ""} placeholder="/page/... أو https://..." onChange={(titleHref) => update({ titleHref })} icon={<Link2 size={13} />} />
      <TextAreaField label="النص التعريفي" value={draft.subtitle || ""} onChange={(subtitle) => update({ subtitle })} />
      <TextAreaField label="الوصف أو المحتوى" value={draft.body || ""} onChange={(body) => update({ body })} />
      <TextField label="رابط الوصف أو النص" value={draft.bodyHref || ""} placeholder="/page/... أو https://..." onChange={(bodyHref) => update({ bodyHref })} icon={<Link2 size={13} />} />
      {draft.builderElement === "button" || draft.buttonText !== undefined || section.sectionType === "hero" || section.sectionType === "cta" ? <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.045] p-3"><div className="text-[11px] font-black text-amber-100">الزر الرئيسي</div><TextField label="نص الزر" value={draft.buttonText || ""} onChange={(buttonText) => update({ buttonText })} /><TextField label="رابط الزر أو الصفحة" value={draft.buttonHref || ""} placeholder="/page/... أو https://..." onChange={(buttonHref) => update({ buttonHref })} icon={<Link2 size={13} />} /></div> : null}
      {draft.builderElement === "image" || draft.imageUrl !== undefined || section.sectionType === "hero" ? <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.035] p-3"><div className="text-[11px] font-black text-amber-100">الصورة أو الشعار</div><button type="button" onClick={() => setMediaField("imageUrl")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2.5 text-xs font-black text-amber-100 transition hover:bg-amber-400/20"><ImagePlus size={15} />اختيار أو رفع صورة</button><TextField label="وصف الصورة" value={draft.imageAlt || ""} onChange={(imageAlt) => update({ imageAlt })} /><TextField label="الرابط عند النقر على الصورة" value={draft.imageHref || ""} placeholder="/page/... أو https://..." onChange={(imageHref) => update({ imageHref })} icon={<Link2 size={13} />} /></div> : null}
      {section.sectionType === "video" || draft.videoUrl !== undefined ? <div className="space-y-3 rounded-2xl border border-sky-400/20 bg-sky-400/[0.035] p-3"><div className="text-[11px] font-black text-sky-100">الفيديو</div><button type="button" onClick={() => setMediaField("videoUrl")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/35 bg-sky-400/10 px-3 py-2.5 text-xs font-black text-sky-100 transition hover:bg-sky-400/20"><Video size={15} />اختيار أو رفع فيديو</button><TextField label="رابط فيديو أو YouTube / Vimeo" value={draft.videoUrl || ""} placeholder="https://..." onChange={(videoUrl) => update({ videoUrl })} /><TextField label="رابط عند النقر على الفيديو" value={draft.videoHref || ""} placeholder="/page/... أو https://..." onChange={(videoHref) => update({ videoHref })} icon={<Link2 size={13} />} /></div> : null}
      {draft.builderElement === "icon" ? <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.035] p-3"><div className="text-[11px] font-black text-amber-100">الأيقونة التفاعلية</div><label className="block text-[11px] font-bold text-slate-400">الرمز<select value={draft.iconName || "sparkles"} onChange={(event) => update({ iconName: event.target.value as NonNullable<SectionConfig["iconName"]> })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-black/20 px-3 py-2.5 text-xs text-white outline-none focus:border-sky-300"><option value="sparkles">احتفال</option><option value="star">نجمة</option><option value="calendar">موعد</option><option value="location">موقع</option><option value="guests">ضيوف</option><option value="heart">قلب</option></select></label><TextField label="رابط الأيقونة أو الصفحة" value={draft.iconHref || ""} placeholder="/page/... أو https://..." onChange={(iconHref) => update({ iconHref })} icon={<Link2 size={13} />} /></div> : null}
      {section.sectionType === "gallery" && draft.items?.length ? <div className="space-y-3 rounded-2xl border border-white/[0.09] bg-black/15 p-3"><div className="text-[11px] font-black text-white">صور المعرض</div>{draft.items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-800 p-2.5"><TextField label={`عنوان الصورة ${index + 1}`} value={item.title} onChange={(title) => updateItem(index, { title })} /><button type="button" onClick={() => setMediaField({ itemIndex: index })} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-2 py-2 text-[10px] font-black text-slate-200 transition hover:border-amber-300 hover:text-amber-200"><ImagePlus size={13} />اختيار الصورة</button><TextField label="رابط الصورة" value={item.imageHref || ""} placeholder="/page/... أو https://..." onChange={(imageHref) => updateItem(index, { imageHref })} icon={<Link2 size={13} />} /></div>)}</div> : null}
    </div>
    <footer className="border-t border-white/[0.08] p-4"><button type="button" onClick={() => save.mutate({ pagePath, sectionId: section.sectionId, sectionType: section.sectionType, orderIndex: section.orderIndex, config: draft })} disabled={save.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-amber-950 transition hover:bg-amber-300 disabled:opacity-50"><Save size={15} />{save.isPending ? "جارٍ الحفظ…" : "حفظ كل تعديلات القالب"}</button></footer>
  </aside><MediaLibrary open={Boolean(mediaField)} onClose={() => setMediaField(null)} accept={isImage ? "image" : "video"} onSelect={chooseMedia} /></>;
}

function TextField({ label, value, onChange, placeholder = "", icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return <label className="block text-[11px] font-bold text-slate-400">{label}<div className="relative mt-1.5">{icon ? <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-300">{icon}</span> : null}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full rounded-xl border border-slate-700 bg-black/20 py-2.5 text-xs text-white outline-none transition focus:border-sky-300 ${icon ? "pr-8 pl-3" : "px-3"}`} /></div></label>;
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-bold text-slate-400">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-700 bg-black/20 p-3 text-xs leading-6 text-white outline-none transition focus:border-sky-300" /></label>;
}

function embedUrl(url?: string) {
  if (!url) return "";
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/i);
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function BuilderSectionView({ section, pagePath }: { section: BuilderSection; pagePath: string }) {
  const config = parseConfig(section.config);
  const shell = "container py-12 md:py-16";
  const [, navigate] = useLocation();
  const action = () => {
    if (!config.buttonHref) return;
    if (config.buttonHref.startsWith("/")) { navigate(config.buttonHref); return; }
    window.open(config.buttonHref, "_self");
  };
  const { isEditing } = useVisualEditorState();
  const [galleryManagerOpen, setGalleryManagerOpen] = useState(false);
  const utils = trpc.useUtils();
  const saveGallery = trpc.visualEditor.sections.save.useMutation({ onSuccess: () => { void utils.visualEditor.sections.list.invalidate({ pagePath }); void utils.visualEditor.sections.publicList.invalidate({ pagePath }); setGalleryManagerOpen(false); } });

  if (config.builderElement === "shape") {
    const shapeClass = ({ rectangle: "h-44 w-full rounded-none", rounded: "h-44 w-full rounded-[2rem]", circle: "aspect-square w-44 rounded-full", pill: "h-20 w-full rounded-full", line: "h-1 w-full rounded-full", arch: "h-48 w-full rounded-t-[999px]", diamond: "h-40 w-40 rotate-45 rounded-2xl" } as const)[config.shapeType || "rounded"];
    return <section className="bg-transparent py-8"><div className={`${shell} flex justify-center`}><VisualEditable id={`${section.sectionId}-shape`} tag="section-block" label={`شكل: ${config.shapeLabel || "جديد"}`} as="div" className={`flex items-center justify-center shadow-[0_18px_45px_rgba(0,0,0,.24)] ${shapeClass}`} style={{ background: config.shapeColor || "linear-gradient(135deg,#f5df9d,#c98327)" }}><span className="pointer-events-none -rotate-45 text-[10px] font-black text-amber-100/55">{config.shapeType === "diamond" ? config.shapeLabel || "شكل" : ""}</span></VisualEditable></div></section>;
  }

  if (config.builderElement === "icon") { const Icon = ({ sparkles: Sparkles, star: Star, calendar: CalendarDays, location: MapPin, guests: Users, heart: Heart } as const)[config.iconName || "sparkles"]; const icon = <span className="grid h-20 w-20 place-items-center rounded-3xl border border-amber-400/25 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-400/5"><Icon size={34} /></span>; return <VisualEditable id={section.sectionId} tag="section-block" label={`أيقونة: ${config.title || "جديدة"}`} as="section" className="bg-[#0c1018]"><div className={`${shell} flex flex-col items-center text-center`}>{config.iconHref ? <a href={config.iconHref}>{icon}</a> : icon}<h2 className="mt-4 text-xl font-black text-amber-100">{config.titleHref ? <a href={config.titleHref}>{config.title || "أيقونة جديدة"}</a> : config.title || "أيقونة جديدة"}</h2></div></VisualEditable>; }

  if (config.builderElement === "image") return <VisualEditable id={section.sectionId} tag="section-block" label={`عنصر صورة: ${config.title || "جديد"}`} as="section" className="bg-[#0c1018]"><div className={`${shell} text-center`}>{config.imageUrl ? <VisualImage id={`${section.sectionId}-image`} label={`صورة ${config.title || "جديدة"}`} src={config.imageUrl} alt={config.imageAlt || config.title || "صورة"} linkUrl={config.imageHref} className="max-h-[620px] max-w-full rounded-3xl border border-amber-400/20 object-contain shadow-2xl" /> : <VisualEditable id={`${section.sectionId}-image`} tag="image" label="اختر صورة" as="div" className="mx-auto flex aspect-video max-w-4xl items-center justify-center rounded-3xl border border-dashed border-amber-400/30 bg-amber-400/[0.035] text-amber-200"><div className="text-center"><ImageIcon className="mx-auto" size={34} /><div className="mt-3 text-sm font-black">اضغط لاختيار أو رفع صورة</div></div></VisualEditable>}</div></VisualEditable>;
  if (config.builderElement === "button") return <VisualEditable id={section.sectionId} tag="section-block" label={`عنصر زر: ${config.title || "جديد"}`} as="section" className="bg-[#0c1018]"><div className={`${shell} text-center`}><VisualEditable id={`${section.sectionId}-button`} tag="button" label="نص الزر والرابط" defaultText={config.buttonText || "اضغط هنا"} as="button" onAction={action} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-amber-950"><span className="pointer-events-none"><ChevronLeft size={16} /></span>{config.buttonText || "اضغط هنا"}</VisualEditable></div></VisualEditable>;
  if (config.builderElement === "text") return <VisualEditable id={section.sectionId} tag="section-block" label={`نص: ${config.title || "جديد"}`} as="section" className="bg-[#0c1018]"><div className={`${shell} max-w-4xl`}><VisualEditable id={`${section.sectionId}-title`} tag="text" label="عنوان النص" defaultText={config.title || "عنوان جديد"} as="h2" className="text-3xl font-black text-amber-100">{(text) => config.titleHref ? <a href={config.titleHref}>{text}</a> : text}</VisualEditable><VisualEditable id={`${section.sectionId}-body`} tag="text" label="محتوى النص" defaultText={config.body || "ابدأ بالكتابة هنا."} as="p" className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-400">{(text) => config.bodyHref ? <a href={config.bodyHref}>{text}</a> : text}</VisualEditable></div></VisualEditable>;

  if (section.sectionType === "hero") return <VisualEditable id={section.sectionId} tag="section-block" label={`قسم بداية: ${config.title || "جديد"}`} as="section" className="relative overflow-hidden border-y border-amber-400/15 bg-[radial-gradient(circle_at_82%_18%,rgba(251,191,36,.14),transparent_28%),#0e121d]"><div className={`${shell} grid items-center gap-9 lg:grid-cols-[1.15fr_.85fr]`}><div><div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-black text-amber-300"><Sparkles size={13} />قسم مخصص</div><h2 className="mt-4 text-3xl font-black leading-tight text-amber-100 md:text-5xl">{config.titleHref ? <a href={config.titleHref}>{config.title || "عنوان قسم جديد"}</a> : config.title || "عنوان قسم جديد"}</h2>{config.subtitle ? <p className="mt-4 text-lg leading-8 text-slate-300">{config.subtitle}</p> : null}{config.body ? <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">{config.bodyHref ? <a href={config.bodyHref}>{config.body}</a> : config.body}</p> : null}{config.buttonText ? <button onClick={action} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-amber-950"><ChevronLeft size={16} />{config.buttonText}</button> : null}</div>{config.imageUrl ? <VisualImage id={`${section.sectionId}-hero-image`} label={`صورة واجهة ${config.title || "جديدة"}`} src={config.imageUrl} alt={config.imageAlt || config.title || "صورة القسم"} linkUrl={config.imageHref} className="aspect-[4/3] w-full rounded-3xl border border-amber-400/20 object-cover shadow-2xl" /> : <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-amber-400/25 bg-black/20 text-slate-600"><ImageIcon size={32} /></div>}</div></VisualEditable>;
  if (section.sectionType === "features") return <VisualEditable id={section.sectionId} tag="section-block" label={`قسم مزايا: ${config.title || "جديد"}`} as="section" className="bg-[#0b0f18]"><div className={shell}><div className="max-w-2xl"><h2 className="text-3xl font-black text-amber-100">{config.title || "مزايا مميزة"}</h2>{config.subtitle ? <p className="mt-3 leading-7 text-slate-400">{config.subtitle}</p> : null}</div><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(config.items?.length ? config.items : [{ title: "ميزة أولى", body: "أضف وصفاً مختصراً من لوحة المنشئ." }, { title: "ميزة ثانية", body: "يمكنك تغيير النص أو الصورة أو الترتيب." }, { title: "ميزة ثالثة", body: "انشر المسودة عند اكتمال التصميم." }]).map((item, index) => <article key={`${item.title}-${index}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><CheckCircle2 className="text-amber-400" size={20} /><h3 className="mt-4 font-black text-slate-100">{item.title}</h3>{item.body ? <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p> : null}</article>)}</div></div></VisualEditable>;
  if (section.sectionType === "gallery") return <><VisualEditable id={section.sectionId} tag="section-block" label={`معرض صور: ${config.title || "جديد"}`} as="section" className="bg-[#101520]"><div className={shell}><div className="text-center"><h2 className="text-3xl font-black text-amber-100">{config.titleHref ? <a href={config.titleHref}>{config.title || "معرض الصور"}</a> : config.title || "معرض الصور"}</h2>{config.subtitle ? <p className="mt-3 text-sm text-slate-400">{config.subtitle}</p> : null}{isEditing ? <button onClick={(event) => { event.stopPropagation(); setGalleryManagerOpen(true); }} className="mt-4 rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-200">إدارة صور المعرض</button> : null}</div><div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">{(config.items?.length ? config.items : [{ title: "صورة المعرض" }, { title: "صورة المعرض" }, { title: "صورة المعرض" }]).map((item, index) => <div key={`${item.title}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">{item.imageUrl ? <VisualImage id={`${section.sectionId}-gallery-${index}`} label={`صورة المعرض ${index + 1}`} src={item.imageUrl} alt={item.title} linkUrl={item.imageHref} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <VisualEditable id={`${section.sectionId}-gallery-${index}`} tag="image" label={`أضف صورة للمعرض ${index + 1}`} as="div" className="flex h-full items-center justify-center text-slate-600"><ImageIcon size={27} /></VisualEditable>}<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-7 text-xs font-bold text-white">{item.title}</div></div>)}</div></div></VisualEditable><GalleryManager open={galleryManagerOpen} onClose={() => setGalleryManagerOpen(false)} items={config.items ?? []} pending={saveGallery.isPending} onSave={(items) => saveGallery.mutate({ pagePath, sectionId: section.sectionId, sectionType: section.sectionType, orderIndex: section.orderIndex, config: { ...config, items } })} /></>;
  if (section.sectionType === "video") return <VisualEditable id={section.sectionId} tag="section-block" label={`قسم فيديو: ${config.title || "جديد"}`} as="section" className="bg-[#0b0f18]"><div className={`${shell} grid items-center gap-7 lg:grid-cols-[.8fr_1.2fr]`}><div><div className="inline-flex items-center gap-2 text-xs font-black text-sky-300"><PlayCircle size={16} />فيديو</div><h2 className="mt-3 text-3xl font-black text-amber-100">{config.titleHref ? <a href={config.titleHref}>{config.title || "فيديو الفعالية"}</a> : config.title || "فيديو الفعالية"}</h2>{config.body ? <p className="mt-4 text-sm leading-7 text-slate-400">{config.bodyHref ? <a href={config.bodyHref}>{config.body}</a> : config.body}</p> : null}</div><VisualVideo id={`${section.sectionId}-video`} label={`فيديو قسم ${config.title || "جديد"}`} src={config.videoUrl} linkUrl={config.videoHref} title={config.title || "فيديو"} className="aspect-video overflow-hidden rounded-3xl border border-sky-400/20 bg-black" /></div></VisualEditable>;
  if (section.sectionType === "cta") return <VisualEditable id={section.sectionId} tag="section-block" label={`دعوة لاتخاذ إجراء: ${config.title || "جديدة"}`} as="section" className="bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,.14),transparent_30%),#131725]"><div className={`${shell} text-center`}><h2 className="text-3xl font-black text-amber-100">{config.titleHref ? <a href={config.titleHref}>{config.title || "جاهز للخطوة التالية؟"}</a> : config.title || "جاهز للخطوة التالية؟"}</h2>{config.subtitle ? <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-300">{config.bodyHref ? <a href={config.bodyHref}>{config.subtitle}</a> : config.subtitle}</p> : null}{config.buttonText ? <button onClick={action} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-amber-950"><ChevronLeft size={16} />{config.buttonText}</button> : null}</div></VisualEditable>;
  return <VisualEditable id={section.sectionId} tag="section-block" label={`قسم نصّي: ${config.title || "جديد"}`} as="section" className="bg-[#0e121d]"><div className={`${shell} max-w-4xl`}><h2 className="text-3xl font-black text-amber-100">{config.title || "قسم جديد"}</h2>{config.subtitle ? <p className="mt-3 text-lg text-slate-300">{config.subtitle}</p> : null}{config.body ? <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-400">{config.body}</p> : null}</div></VisualEditable>;
}

type InsertPayload = { id: string; title: string; sectionType: BuilderSection["sectionType"]; config: Record<string, unknown>; media?: "imageUrl" | "videoUrl" };

function sectionAnchor(section: BuilderSection) {
  const config = parseConfig(section.config) as SectionConfig & { anchorId?: string };
  return config.anchorId || "page-end";
}

export default function VisualSections({ pagePath, anchorId = "page-end" }: { pagePath: string; anchorId?: string }) {
  const { isEditing } = useVisualEditorState();
  const { snapshot } = usePublishedHomepage();
  const { data: fetchedPublished = [] } = trpc.visualEditor.sections.publicList.useQuery({ pagePath }, { enabled: !isEditing && pagePath !== "/", refetchOnWindowFocus: false });
  const published = pagePath === "/" ? (snapshot?.sections ?? []) : fetchedPublished;
  const { data: drafts = [] } = trpc.visualEditor.sections.list.useQuery({ pagePath }, { enabled: isEditing, refetchOnWindowFocus: false });
  const sections = (isEditing ? drafts : published) as BuilderSection[];
  const anchored = sections.filter((section) => sectionAnchor(section) === anchorId);
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<BuilderSection | null>(null);
  const utils = trpc.useUtils();
  const invalidate = () => {
    void utils.visualEditor.sections.list.invalidate({ pagePath });
    void utils.visualEditor.sections.publicList.invalidate({ pagePath });
    void utils.visualEditor.sections.history.invalidate({ pagePath });
  };
  const save = trpc.visualEditor.sections.save.useMutation({ onSuccess: invalidate, onError: (error) => toast.error(error.message || "تعذر وضع القالب داخل الصفحة") });
  const remove = trpc.visualEditor.sections.delete.useMutation({ onSuccess: () => { invalidate(); toast.success("تم حذف القسم من هذه الصفحة"); }, onError: (error) => toast.error(error.message || "تعذر الحذف") });
  const publish = trpc.visualEditor.sections.publish.useMutation({ onSuccess: () => { invalidate(); toast.success("تم نشر القسم للزوار"); }, onError: (error) => toast.error(error.message || "تعذر النشر") });
  const reorder = trpc.visualEditor.sections.reorder.useMutation({ onSuccess: invalidate });

  const insertFromPayload = (payload: InsertPayload, index: number) => {
    const sectionId = `section-${payload.sectionType}-${Date.now().toString(36)}`;
    const config = { ...payload.config, anchorId };
    const sectionIds = sections.map((section) => section.sectionId);
    const currentAnchorIds = anchored.map((section) => section.sectionId);
    const afterAnchorIds = [...currentAnchorIds.slice(0, index), sectionId, ...currentAnchorIds.slice(index)];
    const firstAnchorPosition = currentAnchorIds.length ? sectionIds.indexOf(currentAnchorIds[0]) : sectionIds.length;
    const nextOrder = [...sectionIds.filter((id) => !currentAnchorIds.includes(id))];
    nextOrder.splice(firstAnchorPosition < 0 ? nextOrder.length : firstAnchorPosition, 0, ...afterAnchorIds);
    save.mutate({ pagePath, sectionId, sectionType: payload.sectionType, orderIndex: Math.max(0, firstAnchorPosition + index), config }, { onSuccess: () => {
      reorder.mutate({ pagePath, sectionIds: nextOrder });
      toast.success(`تم وضع «${payload.title}» داخل الصفحة — اضغطه لتحريره أو حذفه`);
    } });
  };

  const onDrop = (event: React.DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    setActiveDropIndex(null);
    const raw = event.dataTransfer.getData("application/x-site-builder-block");
    if (!raw) return;
    try {
      insertFromPayload(JSON.parse(raw) as InsertPayload, index);
    } catch {
      toast.error("تعذر قراءة القالب المسحوب");
    }
  };

  const duplicate = (section: BuilderSection) => {
    const config = { ...parseConfig(section.config), anchorId };
    save.mutate({ pagePath, sectionId: `section-${section.sectionType}-${Date.now().toString(36)}`, sectionType: section.sectionType, orderIndex: sections.length, config }, { onSuccess: () => toast.success("تم تكرار القسم كمسودة") });
  };

  const dropZone = (index: number) => isEditing ? <div key={`drop-${index}`} onDragEnter={(event) => { event.preventDefault(); setActiveDropIndex(index); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setActiveDropIndex(index); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveDropIndex(null); }} onDrop={(event) => onDrop(event, index)} className={`relative mx-auto flex h-12 w-[min(100%-2rem,1180px)] items-center justify-center transition-all ${activeDropIndex === index ? "my-3 h-16" : ""}`}>
    <div className={`absolute inset-x-5 h-px transition ${activeDropIndex === index ? "bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,.85)]" : "bg-transparent"}`} />
    <span className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black transition ${activeDropIndex === index ? "border-amber-300 bg-amber-300 text-amber-950" : "border-dashed border-sky-300/55 bg-[#101825] text-sky-100 shadow-[0_6px_22px_rgba(56,189,248,.08)]"}`}><Plus size={12} />{activeDropIndex === index ? "أفلت القالب هنا" : "اسحب قالباً إلى هنا"}</span>
  </div> : null;

  if (!anchored.length && !isEditing) return null;
  return <section className={isEditing ? "relative" : ""} data-page-anchor={anchorId}>
    {dropZone(0)}
    {anchored.map((section, index) => <div key={section.sectionId} className="group/section relative">
      {isEditing ? <div className="pointer-events-none absolute right-5 top-5 z-[84] flex items-center gap-1 opacity-0 transition group-hover/section:opacity-100"><span className="pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-[#111521]/95 px-2 py-1.5 text-[10px] font-black text-amber-100 shadow-xl"><GripVertical size={13} />قسم قابل للإدارة</span><button type="button" onClick={(event) => { event.stopPropagation(); setEditingSection(section); }} title="تعديل محتوى القسم" className="pointer-events-auto inline-flex items-center gap-1 rounded-lg border border-sky-300/45 bg-[#111521]/95 px-2 py-1.5 text-[10px] font-black text-sky-100 shadow-xl transition hover:bg-sky-400 hover:text-slate-950"><Save size={13} />تعديل</button><button type="button" onClick={(event) => { event.stopPropagation(); duplicate(section); }} title="تكرار القسم" className="pointer-events-auto grid h-7 w-7 place-items-center rounded-lg border border-slate-600 bg-[#111521]/95 text-slate-200 shadow-xl transition hover:border-amber-300 hover:text-amber-200"><Copy size={13} /></button><button type="button" onClick={(event) => { event.stopPropagation(); remove.mutate({ pagePath, sectionId: section.sectionId }); }} title="حذف القسم" className="pointer-events-auto grid h-7 w-7 place-items-center rounded-lg border border-rose-400/35 bg-[#111521]/95 text-rose-300 shadow-xl transition hover:bg-rose-400/15"><Trash2 size={13} /></button><button type="button" onClick={(event) => { event.stopPropagation(); publish.mutate({ pagePath, sectionId: section.sectionId }); }} title="نشر القسم" className="pointer-events-auto rounded-lg bg-emerald-400 px-2 py-1.5 text-[10px] font-black text-emerald-950 shadow-xl">نشر</button></div> : null}
      <BuilderSectionView section={section} pagePath={pagePath} />
      {dropZone(index + 1)}
    </div>)}
    {editingSection ? <SectionContentEditor section={editingSection} pagePath={pagePath} onClose={() => setEditingSection(null)} /> : null}
  </section>;
}
