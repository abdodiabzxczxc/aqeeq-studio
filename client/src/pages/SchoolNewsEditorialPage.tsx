import { useAuth } from "@/_core/hooks/useAuth";
import JournalCoverStudio from "@/components/JournalCoverStudio";
import MediaLibrary from "@/components/MediaLibrary";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, FilePlus2, FolderArchive, ImagePlus, LibraryBig, Loader2, Newspaper, Plus, Sparkles, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Asset = { url: string; fileName: string };
type NewsIssue = { id: number; title: string; slug: string; issueDate: string; coverUrl: string | null; description: string | null; seasonLabel: string; status: "draft" | "published"; pageCount: number };
const today = () => new Date().toISOString().slice(0, 10);
const monthName = (key: string) => new Date(`${key}-01T12:00:00`).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });

export default function SchoolNewsEditorialPage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const isAdmin = isAuthenticated && user?.role === "admin";
  const utils = trpc.useUtils();
  const publicIssues = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const managedIssues = trpc.schoolNews.list.useQuery(undefined, { enabled: isAdmin, refetchOnWindowFocus: false });
  const issues = ((isAdmin ? managedIssues.data : publicIssues.data) || []) as NewsIssue[];
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [coverStudioOpen, setCoverStudioOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "page" | null>(null);
  const [title, setTitle] = useState("النشرة الأسبوعية");
  const [issueDate, setIssueDate] = useState(today());
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const selectedQuery = trpc.schoolNews.issue.useQuery({ slug: selectedSlug || "__none" }, { enabled: isAdmin && Boolean(selectedSlug), refetchOnWindowFocus: false });
  const selected = selectedQuery.data;
  const latest = issues[0];
  const create = trpc.schoolNews.create.useMutation({ onSuccess: (issue) => { toast.success("تم إنشاء العدد. أضف صفحاته الآن."); setCreatorOpen(false); setSelectedSlug(issue.slug); void utils.schoolNews.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const update = trpc.schoolNews.update.useMutation({ onSuccess: () => { toast.success("تم حفظ الغلاف"); void utils.schoolNews.issue.invalidate(); void utils.schoolNews.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const addPages = trpc.schoolNews.addPages.useMutation({ onSuccess: () => { toast.success("تمت إضافة صفحة"); void utils.schoolNews.issue.invalidate(); void utils.schoolNews.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const removePage = trpc.schoolNews.deletePage.useMutation({ onSuccess: () => { toast.message("تم حذف الصفحة"); void utils.schoolNews.issue.invalidate(); }, onError: (error) => toast.error(error.message) });
  const publish = trpc.schoolNews.publish.useMutation({ onSuccess: () => { toast.success("نُشر العدد وأُضيف إلى كتيب الشهر"); void utils.schoolNews.list.invalidate(); void utils.schoolNews.publicList.invalidate(); void utils.schoolNews.issue.invalidate(); }, onError: (error) => toast.error(error.message) });
  const groups = useMemo(() => { const map = new Map<string, NewsIssue[]>(); issues.forEach((issue) => { const key = issue.issueDate.slice(0, 7); map.set(key, [...(map.get(key) || []), issue]); }); return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a)); }, [issues]);
  const totalPages = issues.reduce((total, issue) => total + Number(issue.pageCount || 0), 0);
  const chooseAsset = (asset: Asset) => { if (mediaTarget === "cover") { if (selected) update.mutate({ id: selected.id, coverUrl: asset.url }); else setCoverUrl(asset.url); } else if (selected) addPages.mutate({ issueId: selected.id, pages: [{ imageUrl: asset.url, caption: asset.fileName }] }); setMediaTarget(null); };
  const submit = () => create.mutate({ title: title.trim() || "النشرة الأسبوعية", slug: `issue-${issueDate.replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6)}`, issueDate, description: description.trim() || undefined, coverUrl: coverUrl || undefined, seasonLabel: "موسم العقيق 2026" });
  const loading = publicIssues.isLoading || (isAdmin && managedIssues.isLoading);

  return (
    <main dir="rtl" className={`min-h-screen overflow-x-hidden ${dark ? "bg-[#080b12] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${dark ? "border-white/[.08] bg-[#080b12]/90" : "border-slate-200 bg-white/95 shadow-sm"}`}>
        <div className="container flex h-16 items-center justify-between gap-3">
          <button onClick={() => navigate(isAdmin ? "/dashboard" : "/")} className={`inline-flex items-center gap-2 text-xs font-bold transition ${dark ? "text-slate-400 hover:text-amber-200" : "text-slate-600 hover:text-[#08467d]"}`}>
            <ArrowRight size={16} />{isAdmin ? "لوحة التحكم" : "المنصة"}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className={`text-[10px] font-black tracking-[.2em] ${dark ? "text-amber-300" : "text-[#08467d]"}`}>AL-AQEEQ JOURNAL</div>
              <div className={`mt-0.5 text-sm font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>نشرة أخبار مدارس العقيق</div>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${dark ? "border-amber-300/25 bg-amber-300/[.08] text-amber-200" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"}`}>
              <Newspaper size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-7 md:py-10">
        <section className={`relative isolate overflow-hidden rounded-[2rem] border p-5 md:p-9 ${dark ? "border-amber-300/20 bg-[#111622]" : "border-slate-200 bg-white shadow-xl"}`}>
          <div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: dark ? "radial-gradient(circle at 84% 12%,rgba(251,191,36,.18),transparent 26%),radial-gradient(circle at 9% 92%,rgba(56,189,248,.11),transparent 28%),linear-gradient(112deg,transparent 41%,rgba(255,255,255,.035) 41.2%,transparent 41.6%)" : "radial-gradient(circle at 84% 12%,rgba(8,70,125,.08),transparent 26%),radial-gradient(circle at 9% 92%,rgba(16,185,129,.06),transparent 28%)" }} />
          <div className="relative grid items-center gap-8 lg:grid-cols-[.76fr_1.24fr]">
            <div className="relative mx-auto py-5">
              <div className={`absolute inset-5 -rotate-6 rounded-[1.6rem] border ${dark ? "border-white/[.12] bg-white/[.035]" : "border-black/[.08] bg-slate-100"}`} />
              <div className="relative aspect-[3/4] w-[min(65vw,280px)] rotate-[4deg] overflow-hidden rounded-xl border border-amber-100/55 bg-[linear-gradient(155deg,#f7e8b3,#cc9930_56%,#5d390b)] p-5 text-[#291a05] shadow-[22px_26px_0_rgba(234,190,72,.13),0_30px_70px_rgba(0,0,0,.48)] transition duration-500 hover:rotate-[1deg]">
                {latest?.coverUrl ? (
                  <img src={latest.coverUrl} alt={`غلاف ${latest.title}`} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="text-[9px] font-black tracking-[.25em]">AL-AQEEQ JOURNAL</div>
                    <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-3xl font-black leading-tight">نشرة<br />الأخبار</div>
                    <div className="absolute inset-x-5 bottom-5 border-t border-[#291a05]/30 pt-2 text-[9px] font-black">موسم العقيق 2026</div>
                  </>
                )}
              </div>
            </div>
            <div className="max-w-3xl">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${dark ? "border-amber-300/30 bg-amber-300/[.07] text-amber-200" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"}`}>
                <Sparkles size={14} />{latest ? "عدد الأسبوع بين يديك" : "كتاب المدرسة الذي يتجدد كل أسبوع"}
              </div>
              <h1 className={`mt-5 text-4xl font-black leading-[1.1] md:text-6xl ${dark ? "text-amber-50" : "text-slate-900"}`}>
                {latest ? latest.title : "نشرة العقيق."}<br />
                <span className={dark ? "text-amber-300" : "text-[#08467d]"}>{latest ? "اقرأ الخبر كما يُحفظ." : "خبر يُقلب إلى ذكرى."}</span>
              </h1>
              <p className={`mt-5 max-w-2xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {latest?.description || "اجعل فلايرات المدرسة أعداداً قابلة للقراءة والمشاركة. كل أسبوع يأخذ مكانه في رفّه، وكل شهر يتحول إلى كتيب من ذاكرة العقيق."}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${dark ? "border-white/[.09] bg-black/20 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                  <BookOpen className={`ml-1 inline ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={14} />{issues.length} عدد منشور
                </span>
                <span className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${dark ? "border-white/[.09] bg-black/20 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                  <LibraryBig className={`ml-1 inline ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={14} />{totalPages} صفحة
                </span>
                <span className={`rounded-xl border px-3 py-2 text-[11px] font-bold ${dark ? "border-white/[.09] bg-black/20 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                  <FolderArchive className={`ml-1 inline ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={14} />{groups.length} كتيب شهري
                </span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                {latest ? (
                  <button onClick={() => navigate(`/news/${latest.slug}`)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${dark ? "bg-amber-300 text-slate-950 hover:bg-amber-200" : "bg-[#08467d] text-white hover:bg-[#063560] shadow-md"}`}>
                    <BookOpen size={16} />اقرأ العدد <ArrowLeft size={16} />
                  </button>
                ) : null}
                {isAdmin ? (
                  <button onClick={() => setCreatorOpen(true)} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${dark ? "border-amber-300/35 bg-amber-300/[.06] text-amber-100 hover:bg-amber-300/[.13]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/15"}`}>
                    <FilePlus2 size={16} />إنشاء عدد جديد
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button onClick={() => setCoverStudioOpen(true)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition ${dark ? "border-[#08467d]/40 bg-[#08467d]/15 text-[#f8ca14] hover:bg-[#08467d]/25" : "border-[#08467d]/30 bg-[#08467d]/5 text-[#08467d] hover:bg-[#08467d]/10"}`}>
              <Sparkles size={15} />تعديل غلاف الواجهة
            </button>
            {issues.length ? (
              <select value={selectedSlug || ""} onChange={(event) => setSelectedSlug(event.target.value || null)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold outline-none ${dark ? "border-slate-700 bg-[#111622] text-slate-200 focus:border-amber-300" : "border-slate-300 bg-white text-slate-800 shadow-sm focus:border-[#08467d]"}`}>
                <option value="">إدارة عدد…</option>
                {issues.map((issue) => <option key={issue.id} value={issue.slug}>{issue.title} · {issue.issueDate}</option>)}
              </select>
            ) : null}
          </div>
        ) : null}

        {isAdmin && selected ? (
          <section className={`mt-6 rounded-[2rem] border p-5 md:p-6 ${dark ? "border-amber-300/20 bg-[#111622]" : "border-slate-200 bg-white shadow-xl"}`}>
            <div className={`flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between ${dark ? "border-white/[.08]" : "border-slate-200"}`}>
              <div>
                <div className={`text-[11px] font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>استوديو العدد</div>
                <h2 className={`mt-1 text-xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>{selected.title}</h2>
                <p className={`mt-1 text-xs ${dark ? "text-slate-500" : "text-slate-600"}`}>ارفع صفحات A4 من مكتبة الوسائط؛ ترتيب الرفع هو ترتيبها في القارئ.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setMediaTarget("page")} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${dark ? "border-amber-300/30 text-amber-200 hover:bg-amber-300/[.07]" : "border-[#08467d]/30 text-[#08467d] hover:bg-[#08467d]/10"}`}>
                  <UploadCloud size={15} />رفع صفحة A4
                </button>
                <button onClick={() => publish.mutate({ id: selected.id })} disabled={!selected.pages.length || publish.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-40 shadow-sm">
                  <CheckCircle2 size={15} />{publish.isPending ? "جارٍ النشر…" : "نشر وإضافة للشهر"}
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
              <button onClick={() => setMediaTarget("cover")} className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border border-dashed ${dark ? "border-amber-300/35 bg-black/20 text-amber-200" : "border-slate-300 bg-slate-50 text-slate-700"}`}>
                {selected.coverUrl ? (
                  <img src={selected.coverUrl} alt="غلاف العدد" className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 text-xs font-black">
                    <ImagePlus size={20} />اختيار غلاف
                  </span>
                )}
              </button>
              <div>
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-black ${dark ? "text-slate-300" : "text-slate-800"}`}>صفحات العدد ({selected.pages.length})</div>
                  <span className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-600"}`}>الصفحات تظهر فور نشر العدد</span>
                </div>
                {selected.pages.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {selected.pages.map((page, index) => (
                      <article key={page.id} className={`group overflow-hidden rounded-xl border ${dark ? "border-white/[.08] bg-black/20" : "border-slate-200 bg-slate-50 shadow-sm"}`}>
                        <img src={page.imageUrl} alt={page.caption || `صفحة ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
                        <div className="flex items-center justify-between gap-2 p-2">
                          <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>ص {index + 1}</span>
                          <button onClick={() => removePage.mutate({ id: page.id })} className="text-[10px] font-bold text-[#de191e] sm:opacity-0 sm:transition sm:group-hover:opacity-100">حذف</button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={`mt-3 rounded-2xl border border-dashed p-7 text-center text-xs leading-6 ${dark ? "border-slate-700 text-slate-500" : "border-slate-300 text-slate-600 bg-slate-50"}`}>
                    ارفع أول فلاير A4 الآن؛ سيظهر في القارئ عند النشر.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className={`text-[11px] font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>رفوف الموسم</div>
              <h2 className={`mt-1 text-2xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>الأعداد والكتيبات</h2>
            </div>
            <button onClick={() => navigate("/journal")} className={`inline-flex items-center gap-2 text-xs font-black transition ${dark ? "text-amber-200 hover:text-amber-100" : "text-[#08467d] hover:underline"}`}>
              <LibraryBig size={15} />فتح مكتبة العقيق <ChevronLeft size={15} />
            </button>
          </div>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 className={`animate-spin ${dark ? "text-amber-300" : "text-[#08467d]"}`} />
            </div>
          ) : groups.length ? (
            <div className="space-y-6">
              {groups.map(([monthKey, entries], shelfIndex) => (
                <article key={monthKey} className={`relative overflow-hidden rounded-[1.7rem] border p-4 md:p-5 ${dark ? "border-white/[.08] bg-[#111622]" : "border-slate-200 bg-white shadow-md"}`}>
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-amber-300/45 to-transparent" />
                  <div className={`flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${dark ? "border-white/[.08]" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-black ${dark ? "border-amber-300/25 bg-amber-300/[.08] text-amber-200" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"}`}>
                        {String(shelfIndex + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className={`font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>كتيب {monthName(monthKey)}</h3>
                        <p className={`mt-1 text-[11px] ${dark ? "text-slate-500" : "text-slate-600"}`}>
                          {entries.length} أعداد · {entries.reduce((sum, issue) => sum + Number(issue.pageCount || 0), 0)} صفحات
                        </p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/news/month/${monthKey}`)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${dark ? "border-amber-300/30 bg-amber-300/[.06] text-amber-200 hover:bg-amber-300 hover:text-slate-950" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white"}`}>
                      <FolderArchive size={15} />قراءة كتيب الشهر
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {entries.map((issue, index) => (
                      <button key={issue.id} onClick={() => navigate(`/news/${issue.slug}`)} className={`group relative overflow-hidden rounded-2xl border text-right transition hover:-translate-y-1 ${dark ? "border-white/[.07] bg-black/20 hover:border-amber-300/45" : "border-slate-200 bg-slate-50 hover:border-[#08467d]/40 shadow-sm"}`}>
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {issue.coverUrl ? (
                            <img src={issue.coverUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#1d2432,#090b11)] text-amber-200">
                              <Newspaper size={28} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute right-3 top-3 rounded-full border border-white/[.18] bg-black/35 px-2 py-1 text-[9px] font-black text-amber-100">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="absolute inset-x-3 bottom-3 text-[11px] font-black text-white">
                            اقرأ العدد <ChevronLeft className="inline" size={13} />
                          </div>
                        </div>
                        <div className="p-3">
                          <div className={`line-clamp-1 text-xs font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>{issue.title}</div>
                          <div className={`mt-1 flex items-center gap-1 text-[10px] ${dark ? "text-slate-500" : "text-slate-600 font-bold"}`}>
                            <CalendarDays size={11} />{issue.issueDate}
                            <span className={`mr-auto font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>{issue.pageCount} صفحات</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={`rounded-[2rem] border border-dashed p-12 text-center ${dark ? "border-amber-300/25 bg-[#111622]" : "border-slate-300 bg-white shadow-sm"}`}>
              <Newspaper className={`mx-auto ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={32} />
              <h2 className={`mt-4 text-xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>أول عدد سيصنع بداية الرف</h2>
              <p className={`mt-2 text-sm leading-7 ${dark ? "text-slate-500" : "text-slate-600"}`}>انشر أول عدد ليظهر هنا ككتاب مستقل وضمن كتيب شهره.</p>
            </div>
          )}
        </section>
      </div>

      {creatorOpen ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center" onMouseDown={() => setCreatorOpen(false)}>
          <section onMouseDown={(event) => event.stopPropagation()} className={`w-full max-w-xl rounded-[2rem] border p-5 shadow-2xl md:p-7 ${dark ? "border-amber-300/25 bg-[#111622]" : "border-slate-200 bg-white"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`text-[11px] font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>عدد جديد</div>
                <h2 className={`mt-1 text-2xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>ابدأ نشرة الأسبوع</h2>
                <p className={`mt-2 text-xs leading-6 ${dark ? "text-slate-500" : "text-slate-600"}`}>أنشئ الغلاف والتاريخ، ثم ارفع صفحات A4 بالترتيب المطلوب.</p>
              </div>
              <button onClick={() => setCreatorOpen(false)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-700"}`}>إلغاء</button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>عنوان العدد
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} className={`mt-2 w-full rounded-xl border px-3 py-3 text-sm outline-none ${dark ? "border-slate-700 bg-black/20 text-white focus:border-amber-300" : "border-slate-300 bg-slate-50 text-slate-900 focus:border-[#08467d]"}`} />
              </label>
              <label className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>تاريخ العدد
                <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className={`mt-2 w-full rounded-xl border px-3 py-3 text-sm outline-none ${dark ? "border-slate-700 bg-black/20 text-white focus:border-amber-300" : "border-slate-300 bg-slate-50 text-slate-900 focus:border-[#08467d]"}`} />
              </label>
              <label className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>وصف موجز اختياري
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={4000} className={`mt-2 w-full resize-none rounded-xl border px-3 py-3 text-sm leading-7 outline-none ${dark ? "border-slate-700 bg-black/20 text-white focus:border-amber-300" : "border-slate-300 bg-slate-50 text-slate-900 focus:border-[#08467d]"}`} />
              </label>
              <div className={`rounded-2xl border p-3 ${dark ? "border-slate-800 bg-black/15" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={`text-xs font-black ${dark ? "text-slate-200" : "text-slate-900"}`}>غلاف اختياري</div>
                    <div className={`mt-1 text-[10px] ${dark ? "text-slate-500" : "text-slate-600"}`}>اختره من مكتبة صور الفلايرات.</div>
                  </div>
                  <button onClick={() => setMediaTarget("cover")} className={`rounded-xl border px-3 py-2 text-xs font-black ${dark ? "border-amber-300/30 text-amber-200" : "border-[#08467d]/30 text-[#08467d] bg-white shadow-sm"}`}>
                    {coverUrl ? "تغيير الغلاف" : "اختيار الغلاف"}
                  </button>
                </div>
                {coverUrl ? <img src={coverUrl} alt="معاينة الغلاف" className="mt-3 h-28 w-full rounded-xl object-cover" /> : null}
              </div>
              <button onClick={submit} disabled={!title.trim() || create.isPending} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black disabled:opacity-50 ${dark ? "bg-amber-300 text-slate-950" : "bg-[#08467d] text-white shadow-md hover:bg-[#063560]"}`}>
                <Plus size={16} />{create.isPending ? "جارٍ إنشاء العدد…" : "إنشاء العدد وفتح الاستوديو"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <JournalCoverStudio open={coverStudioOpen} onClose={() => setCoverStudioOpen(false)} />
      <MediaLibrary open={mediaTarget !== null} onClose={() => setMediaTarget(null)} accept="image" onSelect={chooseAsset} />
    </main>
  );
}
