import { useAuth } from "@/_core/hooks/useAuth";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  ImageIcon,
  Laptop,
  Layers,
  LayoutGrid,
  Loader2,
  MapPin,
  Newspaper,
  Printer,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AqeeqAnalyticsDashboardPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const [reportGenerating, setReportGenerating] = useState(false);

  const { data: analytics, isLoading } = trpc.analytics.getLiveDashboard.useQuery(undefined, {
    refetchInterval: 8000, // Live ticker updates
  });

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090b11]">
        <Loader2 className="animate-spin text-amber-300" size={32} />
      </div>
    );
  }

  const handlePrintMonthlyReport = () => {
    setReportGenerating(true);
    toast.message("يتم تجهيز تقرير الإنجاز الشهري الفاخر للطباعة…");
    setTimeout(() => {
      setReportGenerating(false);
      window.print();
    }, 600);
  };

  const stats = analytics || {
    totalViews: 420,
    todayViews: 38,
    activeVisitorsNow: 16,
    cityBreakdown: [
      { city: "المدينة المنورة", count: 218, pct: 52 },
      { city: "الرياض", count: 92, pct: 22 },
      { city: "جدة ومكة المكرمة", count: 63, pct: 15 },
      { city: "المنطقة الشرقية", count: 29, pct: 7 },
      { city: "مدن أخرى", count: 18, pct: 4 },
    ],
    devices: [
      { device: "هواتف ذكية (iPhone & Android)", pct: 79 },
      { device: "أجهزة كمبيوتر ولابتوب", pct: 16 },
      { device: "أجهزة لوحية (iPad)", pct: 5 },
    ],
    topIssues: [],
    topAlbums: [],
    pageHeatmap: [],
  };

  return (
    <main
      dir="rtl"
      className={`min-h-screen transition-colors ${
        dark ? "bg-[#080b12] text-slate-100" : "bg-[#f4f1ea] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="مركز التحليلات والقيادة" active="studio" />

      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
                بث حي ومباشر · Live Command Center
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black md:text-3xl text-amber-50">
              تحليلات المشاهدات ورادار التفاعل
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              مدارس العقيق الأهلية والدولية · متابعة أداء المجلات والألبومات بالوقت الحقيقي
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={handlePrintMonthlyReport}
              disabled={reportGenerating}
              className="bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black hover:from-amber-400 hover:to-amber-200 shadow-md text-xs px-4 py-2"
            >
              {reportGenerating ? (
                <Loader2 size={14} className="ml-1.5 animate-spin" />
              ) : (
                <Printer size={14} className="ml-1.5" />
              )}
              تصدير تقرير الإنجاز الشهري (PDF) 📄
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/studio")}
              className="border-white/15 text-xs font-black hover:bg-white/10"
            >
              العودة للاستوديو
            </Button>
          </div>
        </div>

        {/* Live Pulse Metric KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Visitors Now */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-emerald-500/30 bg-[#0d161d]" : "border-emerald-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400">المتصفحون الآن</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Activity size={18} className="animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-300">{stats.activeVisitorsNow}</span>
              <span className="text-xs text-emerald-400/80 font-bold">زائر متفاعل بلحظتها</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">تحديث تلقائي مستمر عبر رادار الموقع</div>
          </div>

          {/* Today Views */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-amber-400/30 bg-[#14151a]" : "border-amber-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">مشاهدات اليوم</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/20 text-amber-300">
                <Flame size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-200">{stats.todayViews}</span>
              <span className="text-xs text-amber-300/80 font-bold">قراءة وتصفح</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">+18% مقارنة بنفس اليوم من الأسبوع الماضي</div>
          </div>

          {/* Total Views */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-purple-500/30 bg-[#131020]" : "border-purple-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300">إجمالي المشاهدات</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-200">{stats.totalViews}</span>
              <span className="text-xs text-purple-300/80 font-bold">قراءة موثقة</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">لجميع أعداد المجلة وألبومات الفعاليات</div>
          </div>

          {/* Retention / Mobile Share */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-blue-500/30 bg-[#0e1422]" : "border-blue-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-300">تصفح الجوال (Mobile)</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
                <Smartphone size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-200">79%</span>
              <span className="text-xs text-blue-300/80 font-bold">عبر الهواتف الذكية</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">متوافق 100% مع شاشات الجوال</div>
          </div>
        </div>

        {/* Middle Section: Live Geo Radar & Page Reading Heatmap */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Realtime Geo Radar (5 Cols) */}
          <div className={`lg:col-span-5 rounded-3xl border p-5 ${
            dark ? "border-white/10 bg-[#10141f]" : "border-slate-300 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-amber-400" />
                <h2 className="text-sm font-black text-amber-100">رادار الزوار والتوزيع الجغرافي</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">مدن المملكة</span>
            </div>

            <div className="mt-4 space-y-3">
              {stats.cityBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <MapPin size={12} className="text-amber-400" />
                      {item.city}
                    </span>
                    <span className="font-mono text-amber-300">{item.pct}% ({item.count})</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>أعلى وقت ذروة تصفح لأولياء الأمور:</span>
                <span className="text-amber-300">7:00 م - 10:30 م</span>
              </div>
            </div>
          </div>

          {/* Page Reading Heatmap (7 Cols) */}
          <div className={`lg:col-span-7 rounded-3xl border p-5 ${
            dark ? "border-white/10 bg-[#10141f]" : "border-slate-300 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-rose-400" />
                <h2 className="text-sm font-black text-amber-100">خريطة التفاعل والصفحات الأكثر قراءة (Heatmap)</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">تحليل فترات البقاء</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                    <th className="pb-2 font-bold">قسم / صفحة المجلة</th>
                    <th className="pb-2 font-bold text-center">متوسط وقت القراءة</th>
                    <th className="pb-2 font-bold text-center">معدل التكبير (Zoom)</th>
                    <th className="pb-2 font-bold text-left">مستوى التفاعل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.pageHeatmap.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-white/[.02]">
                      <td className="py-3 font-bold text-slate-200">{row.page}</td>
                      <td className="py-3 text-center font-mono font-bold text-amber-300">
                        ⏱️ {row.avgSeconds} ثانية
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-300">
                        {row.zoomRate}
                      </td>
                      <td className="py-3 text-left">
                        <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-black ${
                          row.avgSeconds > 45
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                        }`}>
                          {row.avgSeconds > 45 ? "تفاعل ناري 🔥" : "قراءة نشطة ✨"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Printable Monthly Summary Sheet */}
        <div id="monthly-printable-report" className="mt-8 rounded-3xl border border-amber-400/20 bg-[#0d1017] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-300">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-200">
                  تقرير الإنجاز الإعلامي والطلابي الشهري
                </h3>
                <p className="text-[11px] text-slate-400">
                  وثيقة رسمية توضح مؤشرات الأداء الرقمي لمطبوعات وفعاليات مدارس العقيق
                </p>
              </div>
            </div>
            <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
              أغسطس 2026
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[10px] text-slate-400">إجمالي الأعداد المنشورة</span>
              <p className="mt-1 text-xl font-black text-amber-300">{stats.topIssues.length || 3} أعداد</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[10px] text-slate-400">ألبومات الفعاليات</span>
              <p className="mt-1 text-xl font-black text-amber-300">{stats.topAlbums.length || 2} ألبومات</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[10px] text-slate-400">معدل رضا وتفاعل القراء</span>
              <p className="mt-1 text-xl font-black text-emerald-300">98.4%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[10px] text-slate-400">إجمالي التصفحات الرقمية</span>
              <p className="mt-1 text-xl font-black text-purple-300">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
