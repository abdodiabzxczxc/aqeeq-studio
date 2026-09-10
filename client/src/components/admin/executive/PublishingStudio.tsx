import React, { useState } from "react";
import {
  BookOpen,
  Camera,
  Clapperboard,
  Newspaper,
  Mic,
  Palette,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Layers,
  Sparkles,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackdropsManager } from "@/components/BackdropsManager";

interface MasterContentItem {
  id: number | string;
  type: "journal" | "album" | "showcase" | "article" | "podcast";
  title: string;
  subtitle?: string;
  category?: string;
  publishedAt?: any;
  status?: string;
  coverUrl?: string | null;
  linkUrl?: string;
}

interface ArticleItem {
  id: number;
  title: string;
  authorName: string;
  authorRole: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  coverUrl?: string | null;
  content?: string;
}

interface PublishingStudioProps {
  dark: boolean;
  masterContent: MasterContentItem[];
  pendingArticles: ArticleItem[];
  onApproveArticle?: (id: number) => Promise<void> | void;
  onRejectArticle?: (id: number) => Promise<void> | void;
  onDeleteContentItem?: (type: string, id: number | string) => Promise<void> | void;
  onNavigate: (path: string) => void;
  orchestrationForm: any;
  setOrchestrationForm: any;
  onSaveOrchestration: () => Promise<void> | void;
  isSaving: boolean;
}

export function PublishingStudio({
  dark,
  masterContent = [],
  pendingArticles = [],
  onApproveArticle,
  onRejectArticle,
  onDeleteContentItem,
  onNavigate,
  orchestrationForm,
  setOrchestrationForm,
  onSaveOrchestration,
  isSaving,
}: PublishingStudioProps) {
  const [subTab, setSubTab] = useState<"master" | "articles" | "backdrops">("master");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const pendingCount = pendingArticles.filter((a) => a.status === "pending").length;

  const filteredMaster = masterContent.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q));
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Studio Top Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">أجنحة النشر والمكتبة الرقمية</h2>
            <p className="text-xs text-slate-400 font-bold">
              إدارة وتوثيق المجلات التفاعلية، ألبومات الفعاليات، واعتماد مقالات المعلمين والطلاب
            </p>
          </div>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setSubTab("master")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "master"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>الجدول الموحد الشامل 📑</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{masterContent.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("articles")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "articles"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>مراجعة المقالات ✍️</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-black px-1.5 py-0.2 text-[10px] font-black animate-pulse">
                {pendingCount} معلق
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab("backdrops")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "backdrops"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            خلفيات الأقسام 🖼️
          </button>
        </div>
      </div>

      {/* Dedicated Studio Launchers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="p-3.5 rounded-2xl border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/15 text-right transition group cursor-pointer"
        >
          <Palette size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">المحرر البصري</h4>
          <p className="text-[10px] text-slate-400">تعديل حي على الموقع</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/journal/manage")}
          className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
        >
          <BookOpen size={20} className="text-yellow-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">استوديو المجلات</h4>
          <p className="text-[10px] text-slate-400">الأعداد الدورية 3D</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/albums/manage")}
          className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
        >
          <Camera size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">استوديو الألبومات</h4>
          <p className="text-[10px] text-slate-400">توثيق الفعاليات</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/offers/manage")}
          className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
        >
          <Clapperboard size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">الأخبار والعروض</h4>
          <p className="text-[10px] text-slate-400">فيديوهات وتغطيات</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/articles/manage")}
          className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
        >
          <Newspaper size={20} className="text-blue-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">استوديو المقالات</h4>
          <p className="text-[10px] text-slate-400">كتابة ونشر مقال</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("/podcast/manage")}
          className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
        >
          <Mic size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-xs font-black">استوديو البودكاست</h4>
          <p className="text-[10px] text-slate-400">أثير العقيق الصوتي</p>
        </button>
      </div>

      {/* SUBTAB 1: UNIFIED MASTER TABLE */}
      {subTab === "master" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 w-full sm:w-72 ${
              dark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"
            }`}>
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في كافة العناوين والإصدارات..."
                className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${
                dark ? "border-white/10 bg-[#12161f] text-white" : "border-black/10 bg-white text-slate-800"
              }`}
            >
              <option value="all">كافة أنواع المحتوى</option>
              <option value="journal">المجلات 3D</option>
              <option value="album">ألبومات الصور</option>
              <option value="showcase">الأخبار والعروض</option>
              <option value="article">المقالات</option>
              <option value="podcast">البودكاست</option>
            </select>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-current/10 bg-black/20 text-slate-400 font-black">
                    <th className="p-4">نوع المحتوى</th>
                    <th className="p-4">العنوان والإصدار</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/5">
                  {filteredMaster.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد إصدارات مطابقة لمعايير البحث
                      </td>
                    </tr>
                  ) : (
                    filteredMaster.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-white/5 border-current/10">
                            {item.type === "journal" && "مجلة 3D 📖"}
                            {item.type === "album" && "ألبوم صور 📷"}
                            {item.type === "showcase" && "خبر وعرض 🎬"}
                            {item.type === "article" && "مقال ✍️"}
                            {item.type === "podcast" && "بودكاست 🎙️"}
                          </span>
                        </td>
                        <td className="p-4 font-black">
                          <div className="flex items-center gap-2">
                            {item.coverUrl && (
                              <img
                                src={item.coverUrl}
                                alt=""
                                className="h-7 w-7 rounded-lg object-cover border border-current/10 shrink-0"
                              />
                            )}
                            <span className="line-clamp-1">{item.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 font-bold">{item.category || "عام"}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            {item.linkUrl && (
                              <a
                                href={item.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-current/10 hover:bg-white/10 text-slate-300"
                                title="معاينة"
                              >
                                <Eye size={13} />
                              </a>
                            )}
                            {onDeleteContentItem && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) {
                                    onDeleteContentItem(item.type, item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ARTICLES MODERATION */}
      {subTab === "articles" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs font-bold text-amber-400">
            هنا تظهر مسودات ومقالات الطلاب والمعلمين الواردة للمراجعة قبل نشرها على الموقع الرسمي.
          </div>

          {pendingArticles.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${dark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-slate-50"}`}>
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-60" />
              <h4 className="text-sm font-black">كافة المقالات مراجعة ومعتمدة!</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">لا توجد مقالات معلقة بانتظار الاعتماد حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingArticles.map((art) => (
                <div
                  key={art.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black">{art.title}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        الكاتب: {art.authorName} ({art.authorRole})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      معلق للمراجعة
                    </span>
                  </div>

                  {art.content && (
                    <p className="text-xs text-slate-300 font-medium line-clamp-3 bg-white/[0.02] p-3 rounded-xl border border-current/5">
                      {art.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-current/10">
                    {onApproveArticle && (
                      <Button
                        type="button"
                        onClick={() => onApproveArticle(art.id)}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-1.5 gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>اعتماد ونشر المقال</span>
                      </Button>
                    )}
                    {onRejectArticle && (
                      <Button
                        type="button"
                        onClick={() => onRejectArticle(art.id)}
                        variant="outline"
                        className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-black text-xs py-1.5 gap-1.5"
                      >
                        <XCircle size={13} />
                        <span>رفض</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: BACKDROPS MANAGER */}
      {subTab === "backdrops" && (
        <BackdropsManager
          orchestrationForm={orchestrationForm}
          setOrchestrationForm={setOrchestrationForm}
          onSave={onSaveOrchestration}
          isSaving={isSaving}
          dark={dark}
        />
      )}
    </div>
  );
}
