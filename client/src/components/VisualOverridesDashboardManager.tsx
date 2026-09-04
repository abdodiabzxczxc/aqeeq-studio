import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Sparkles,
  Search,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Download,
  Upload,
  Type,
  ImageIcon,
  MousePointerClick,
  Layers,
  Trash2,
  Save,
  Check,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface VisualOverridesDashboardManagerProps {
  onNavigateToPage?: (path: string) => void;
}

const PAGE_OPTIONS = [
  { value: "all", label: "جميع الصفحات 🌐" },
  { value: "/", label: "الرئيسية 🏠" },
  { value: "/admissions", label: "القبول والتسجيل 🎓" },
  { value: "/about", label: "مدارسنا 🏛️" },
  { value: "/accreditations", label: "الاعتمادات ورادار الجودة 🏆" },
  { value: "/journal", label: "صحيفة ومجلة العقيق 📖" },
  { value: "/albums", label: "ألبومات الصور 📸" },
  { value: "/podcast", label: "بودكاست العقيق 🎙️" },
  { value: "/articles", label: "المقالات والأخبار ✍️" },
];

export function VisualOverridesDashboardManager({ onNavigateToPage }: VisualOverridesDashboardManagerProps) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editMedia, setEditMedia] = useState<string>("");
  const [editLink, setEditLink] = useState<string>("");

  const { data: allOverrides = [], isLoading, refetch } = trpc.visualEditor.listAll.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const saveMutation = trpc.visualEditor.save.useMutation({
    onSuccess: () => {
      toast.success("✅ تم حفظ التعديل بنجاح");
      setEditingId(null);
      refetch();
    },
    onError: (err) => toast.error(err.message || "تعذر حفظ التعديل"),
  });

  const resetMutation = trpc.visualEditor.reset.useMutation({
    onSuccess: () => {
      toast.success("🔄 تمت استعادة التصميم الأصلي للعنصر");
      refetch();
    },
    onError: (err) => toast.error(err.message || "تعذر استعادة العنصر"),
  });

  const publishAllMutation = trpc.visualEditor.publishAll.useMutation({
    onSuccess: (res) => {
      toast.success(`🚀 تم نشر جميع التعديلات المرئية (${(res as any)?.count || 0} عنصر) للزوار بنجاح!`);
      refetch();
    },
    onError: (err) => toast.error(err.message || "فشل نشر التعديلات"),
  });

  // Filtered overrides
  const filteredOverrides = useMemo(() => {
    return allOverrides.filter((item: any) => {
      const matchesPage = selectedPage === "all" || item.pagePath === selectedPage;
      const matchesTag = tagFilter === "all" || item.elementTag === tagFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.elementId.toLowerCase().includes(query) ||
        (item.contentText && item.contentText.toLowerCase().includes(query)) ||
        (item.pagePath && item.pagePath.toLowerCase().includes(query));
      return matchesPage && matchesTag && matchesQuery;
    });
  }, [allOverrides, selectedPage, tagFilter, searchQuery]);

  // Export JSON
  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allOverrides, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `alaqeeq-visual-overrides-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("تم تنزيل النسخة الاحتياطية بنجاح");
    } catch {
      toast.error("فشل تصدير التعديلات");
    }
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          let count = 0;
          for (const item of parsed) {
            if (item.pagePath && item.elementId) {
              await saveMutation.mutateAsync({
                pagePath: item.pagePath,
                elementId: item.elementId,
                elementTag: item.elementTag || "text",
                contentText: item.contentText ?? null,
                mediaUrl: item.mediaUrl ?? null,
                linkUrl: item.linkUrl ?? null,
              });
              count++;
            }
          }
          toast.success(`تم استيراد وحفظ ${count} تعديل بنجاح`);
          refetch();
        }
      } catch {
        toast.error("الملف غير صالح أو التنسيق غير متوافق");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const startEditing = (item: any) => {
    setEditingId(item.elementId);
    setEditText(item.contentText || "");
    setEditMedia(item.mediaUrl || "");
    setEditLink(item.linkUrl || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveInlineEdit = (item: any) => {
    saveMutation.mutate({
      pagePath: item.pagePath,
      elementId: item.elementId,
      elementTag: item.elementTag,
      contentText: editText || null,
      mediaUrl: editMedia || null,
      linkUrl: editLink || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
          dark
            ? "border-white/10 bg-gradient-to-br from-[#12141a] via-[#0d0f14] to-[#0a0a0d] text-white"
            : "border-black/5 bg-gradient-to-br from-white via-slate-50 to-amber-50/30 text-slate-900 shadow-slate-200/50"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black bg-amber-400/10 text-amber-500 border border-amber-400/20">
              <Sparkles size={14} />
              <span>مركز التحكم في التعديلات المرئية المباشرة</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-['Tajawal']">
              لوحة التعديلات المرئية (Visual Overrides Hub)
            </h3>
            <p className={`text-xs sm:text-sm font-bold max-w-2xl leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
              تحكم كامل ومباشر في جميع النصوص، الأزرار، الصور، والشعارات التي تم تعديلها عبر المحرر المرئي الذكي على كامل صفحات الموقع. يمكنك التعديل الفوري، الاسترجاع، أو النشر للعامة بنقرة واحدة.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <label
              className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black cursor-pointer transition ${
                dark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
              title="استيراد ملف نسخة احتياطية من التعديلات"
            >
              <Upload size={15} />
              <span>استيراد JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleExportJson}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black transition ${
                dark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <Download size={15} />
              <span>تصدير JSON</span>
            </button>

            <button
              type="button"
              onClick={() => publishAllMutation.mutate()}
              disabled={publishAllMutation.isPending || allOverrides.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-5 py-2.5 text-xs font-black text-black hover:bg-yellow-400 transition shadow-lg shadow-[#f8ca14]/20 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{publishAllMutation.isPending ? "جاري النشر..." : "اعتماد ونشر لجميع الزوار 🚀"}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-6 border-current/10">
          <div className={`p-4 rounded-2xl border ${dark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-white"}`}>
            <span className="text-[11px] font-bold text-slate-400">إجمالي العناصر المعدلة</span>
            <p className="text-2xl font-black mt-1 text-amber-500">{allOverrides.length}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${dark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-white"}`}>
            <span className="text-[11px] font-bold text-slate-400">النصوص المعدلة</span>
            <p className="text-2xl font-black mt-1 text-sky-500">
              {allOverrides.filter((o: any) => o.elementTag === "text" || !o.elementTag).length}
            </p>
          </div>
          <div className={`p-4 rounded-2xl border ${dark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-white"}`}>
            <span className="text-[11px] font-bold text-slate-400">الصور والشعارات</span>
            <p className="text-2xl font-black mt-1 text-emerald-500">
              {allOverrides.filter((o: any) => o.elementTag === "image").length}
            </p>
          </div>
          <div className={`p-4 rounded-2xl border ${dark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-white"}`}>
            <span className="text-[11px] font-bold text-slate-400">الأزرار والروابط</span>
            <p className="text-2xl font-black mt-1 text-purple-500">
              {allOverrides.filter((o: any) => o.elementTag === "button").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${
          dark ? "border-white/10 bg-[#12141a]" : "border-black/5 bg-white"
        }`}
      >
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الكود، أو النص..."
            className={`w-full rounded-xl border pr-10 pl-4 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              dark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-black/10 bg-slate-50 text-slate-900"
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Page Filter */}
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
              dark ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-slate-50 text-slate-800"
            }`}
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className={dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <div className="flex items-center gap-1">
            {[
              { tag: "all", label: "الكل" },
              { tag: "text", label: "نصوص" },
              { tag: "image", label: "صور" },
              { tag: "button", label: "أزرار" },
            ].map(({ tag, label }) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  tagFilter === tag
                    ? "bg-amber-400 text-black font-black"
                    : dark
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
              dark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-slate-50 hover:bg-slate-100"
            }`}
            title="تحديث القائمة"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : "text-slate-400"} />
          </button>
        </div>
      </div>

      {/* Table of Overrides */}
      {filteredOverrides.length === 0 ? (
        <div
          className={`rounded-3xl border p-12 text-center space-y-3 ${
            dark ? "border-white/10 bg-[#12141a]/50 text-slate-400" : "border-black/5 bg-slate-50 text-slate-500"
          }`}
        >
          <AlertCircle size={40} className="mx-auto text-amber-400 opacity-60" />
          <h4 className="text-base font-black">لا توجد تعديلات مرئية مطابقة للبحث</h4>
          <p className="text-xs">
            {allOverrides.length === 0
              ? "لم تقم بتعديل أي عنصر بعد عبر المحرر المرئي. يمكنك النقر على أيقونة المحرر في الموقع لتعديل النصوص والصور مباشرة."
              : "جرب تغيير فلتر الصفحة أو كلمة البحث أعلاه."}
          </p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-3xl border shadow-lg ${
            dark ? "border-white/10 bg-[#12141a]" : "border-black/5 bg-white"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50/70"}`}>
                  <th className="p-4 font-black">العنصر والمعرف (ID)</th>
                  <th className="p-4 font-black">الصفحة</th>
                  <th className="p-4 font-black">النوع</th>
                  <th className="p-4 font-black">القيمة المعدلة</th>
                  <th className="p-4 font-black">الحالة</th>
                  <th className="p-4 font-black text-left">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/5">
                {filteredOverrides.map((item: any) => {
                  const isCurrentlyEditing = editingId === item.elementId;
                  return (
                    <tr
                      key={`${item.pagePath}::${item.elementId}`}
                      className={`transition ${dark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                    >
                      {/* ID */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-amber-500 text-[11px]">{item.elementId}</div>
                        {item.altText && <span className="text-[10px] text-slate-400 block mt-0.5">{item.altText}</span>}
                      </td>

                      {/* Page */}
                      <td className="p-4">
                        <span className={`inline-block rounded-lg px-2 py-1 text-[10px] font-black ${
                          dark ? "bg-white/5 text-slate-300 border border-white/10" : "bg-slate-100 text-slate-700 border border-black/5"
                        }`}>
                          {item.pagePath}
                        </span>
                      </td>

                      {/* Tag */}
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          {item.elementTag === "image" ? (
                            <>
                              <ImageIcon size={13} className="text-emerald-400" />
                              <span>صورة</span>
                            </>
                          ) : item.elementTag === "button" ? (
                            <>
                              <MousePointerClick size={13} className="text-purple-400" />
                              <span>زر</span>
                            </>
                          ) : (
                            <>
                              <Type size={13} className="text-sky-400" />
                              <span>نص</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Content Value */}
                      <td className="p-4 max-w-md">
                        {isCurrentlyEditing ? (
                          <div className="space-y-2">
                            {item.elementTag === "image" ? (
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">رابط الصورة (URL):</label>
                                <input
                                  type="text"
                                  value={editMedia}
                                  onChange={(e) => setEditMedia(e.target.value)}
                                  className={`w-full rounded-lg border p-2 text-xs font-mono ${
                                    dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                                  }`}
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">النص المعدل:</label>
                                <textarea
                                  rows={2}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className={`w-full rounded-lg border p-2 text-xs ${
                                    dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                                  }`}
                                />
                              </div>
                            )}

                            {(item.elementTag === "button" || item.linkUrl) && (
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">رابط الزر (URL):</label>
                                <input
                                  type="text"
                                  value={editLink}
                                  onChange={(e) => setEditLink(e.target.value)}
                                  className={`w-full rounded-lg border p-2 text-xs font-mono ${
                                    dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                                  }`}
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => saveInlineEdit(item)}
                                disabled={saveMutation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-black text-white hover:bg-emerald-600 transition"
                              >
                                <Save size={12} />
                                <span>حفظ التعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-[11px] font-bold text-slate-400 hover:text-white transition"
                              >
                                <span>إلغاء</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {item.elementTag === "image" ? (
                              <div className="flex items-center gap-3">
                                {item.mediaUrl && (
                                  <img
                                    src={item.mediaUrl}
                                    alt="معاينة"
                                    className="h-10 w-14 rounded-lg object-cover border border-white/10"
                                  />
                                )}
                                <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs block">
                                  {item.mediaUrl || "بدون رابط"}
                                </span>
                              </div>
                            ) : (
                              <p className="font-bold line-clamp-2 text-slate-300">{item.contentText || "—"}</p>
                            )}

                            {item.linkUrl && (
                              <span className="text-[10px] text-sky-400 font-mono block mt-1">
                                الرابط: {item.linkUrl}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black ${
                            item.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                          }`}
                        >
                          {item.status === "published" ? "منشور حي 🌐" : "مسودة 📝"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-left">
                        <div className="inline-flex items-center gap-1.5">
                          {!isCurrentlyEditing && (
                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              className={`rounded-lg p-1.5 transition ${
                                dark ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                              title="تعديل القيمة"
                            >
                              <Type size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من استعادة التصميم الأصلي للعنصر (${item.elementId})؟`)) {
                                resetMutation.mutate({ pagePath: item.pagePath, elementId: item.elementId });
                              }
                            }}
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition"
                            title="استعادة الأصل (حذف التعديل)"
                          >
                            <RotateCcw size={13} />
                          </button>

                          <a
                            href={`${item.pagePath}?edit=1`}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-lg p-1.5 transition ${
                              dark ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                            title="فتح الصفحة والتعديل بالواجهة"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
