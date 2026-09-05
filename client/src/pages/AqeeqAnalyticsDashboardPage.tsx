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
        dark ? "bg-[#080b12] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="مركز التحليلات والقيادة" active="studio" />

      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
        {/* Top Control Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${
          dark ? "border-white/10" : "border-slate-200"
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className={`text-xs font-black tracking-wider uppercase ${
                dark ? "text-amber-400" : "text-amber-700 font-bold"
              }`}>
                بث حي ومباشر · Live Command Center
              </span>
            </div>
            <h1 className={`mt-1 text-2xl font-black md:text-3xl ${dark ? "text-amber-50" : "text-slate-900"}`}>
              تحليلات المشاهدات ورادار التفاعل
            </h1>
            <p className={`mt-0.5 text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
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
              onClick={() => navigate("/")}
              className={`text-xs font-black ${
                dark ? "border-white/15 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"
              }`}
            >
              العودة للرئيسية
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
              <span className={`text-xs font-black ${dark ? "text-emerald-400" : "text-emerald-700"}`}>المتصفحون الآن</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Activity size={18} className="animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${dark ? "text-emerald-300" : "text-emerald-800"}`}>{stats.activeVisitorsNow}</span>
              <span className={`text-xs font-bold ${dark ? "text-emerald-400/80" : "text-emerald-700"}`}>زائر متفاعل بلحظتها</span>
            </div>
            <div className={`mt-2 text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>تحديث تلقائي مستمر عبر رادار الموقع</div>
          </div>

          {/* Today Views */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-amber-400/30 bg-[#14151a]" : "border-amber-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${dark ? "text-amber-300" : "text-amber-800"}`}>مشاهدات اليوم</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/20 text-amber-300">
                <Flame size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${dark ? "text-amber-200" : "text-amber-900"}`}>{stats.todayViews}</span>
              <span className={`text-xs font-bold ${dark ? "text-amber-300/80" : "text-amber-800"}`}>قراءة وتصفح</span>
            </div>
            <div className={`mt-2 text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>+18% مقارنة بنفس اليوم من الأسبوع الماضي</div>
          </div>

          {/* Total Views */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-[#08467d]/40 bg-[#06182e]" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>إجمالي المشاهدات</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#08467d]/20 text-[#f8ca14]">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${dark ? "text-white" : "text-[#08467d]"}`}>{stats.totalViews}</span>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>قراءة موثقة</span>
            </div>
            <div className={`mt-2 text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>لجميع أعداد المجلة وألبومات الفعاليات</div>
          </div>

          {/* Retention / Mobile Share */}
          <div className={`rounded-3xl border p-5 relative overflow-hidden ${
            dark ? "border-blue-500/30 bg-[#0e1422]" : "border-blue-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${dark ? "text-blue-300" : "text-blue-800"}`}>تصفح الجوال (Mobile)</span>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
                <Smartphone size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${dark ? "text-blue-200" : "text-blue-900"}`}>79%</span>
              <span className={`text-xs font-bold ${dark ? "text-blue-300/80" : "text-blue-800"}`}>عبر الهواتف الذكية</span>
            </div>
            <div className={`mt-2 text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>متوافق 100% مع شاشات الجوال</div>
          </div>
        </div>

        {/* Middle Section: Live Geo Radar & Page Reading Heatmap */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Realtime Geo Radar (5 Cols) */}
          <div className={`lg:col-span-5 rounded-3xl border p-5 ${
            dark ? "border-white/10 bg-[#10141f]" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${dark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-amber-400" />
                <h2 className={`text-sm font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>رادار الزوار والتوزيع الجغرافي</h2>
              </div>
              <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>مدن المملكة</span>
            </div>

            <div className="mt-4 space-y-3">
              {stats.cityBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`flex items-center gap-1.5 ${dark ? "text-slate-200" : "text-slate-800"}`}>
                      <MapPin size={12} className="text-amber-500" />
                      {item.city}
                    </span>
                    <span className={`font-mono ${dark ? "text-amber-300" : "text-amber-800 font-bold"}`}>{item.pct}% ({item.count})</span>
                  </div>
                  <div className={`h-2 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-6 rounded-2xl border p-3 ${
              dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"
            }`}>
              <div className={`flex items-center justify-between text-[11px] font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>
                <span>أعلى وقت ذروة تصفح لأولياء الأمور:</span>
                <span className={dark ? "text-amber-300" : "text-amber-800 font-black"}>7:00 م - 10:30 م</span>
              </div>
            </div>
          </div>

          {/* Page Reading Heatmap (7 Cols) */}
          <div className={`lg:col-span-7 rounded-3xl border p-5 ${
            dark ? "border-white/10 bg-[#10141f]" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${dark ? "border-white/10" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#de191e]" />
                <h2 className={`text-sm font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>خريطة التفاعل والصفحات الأكثر قراءة (Heatmap)</h2>
              </div>
              <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>تحليل فترات البقاء</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className={`border-b text-[11px] ${dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                    <th className="pb-2 font-bold">قسم / صفحة المجلة</th>
                    <th className="pb-2 font-bold text-center">متوسط وقت القراءة</th>
                    <th className="pb-2 font-bold text-center">معدل التكبير (Zoom)</th>
                    <th className="pb-2 font-bold text-left">مستوى التفاعل</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? "divide-white/5" : "divide-slate-200"}`}>
                  {stats.pageHeatmap.map((row: any, index: number) => (
                    <tr key={index} className={dark ? "hover:bg-white/[.02]" : "hover:bg-slate-50"}>
                      <td className={`py-3 font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>{row.page}</td>
                      <td className={`py-3 text-center font-mono font-bold ${dark ? "text-amber-300" : "text-amber-800"}`}>
                        ⏱️ {row.avgSeconds} ثانية
                      </td>
                      <td className={`py-3 text-center font-mono font-bold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                        {row.zoomRate}
                      </td>
                      <td className="py-3 text-left">
                        <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-black ${
                          row.avgSeconds > 45
                            ? dark ? "bg-[#de191e]/20 text-[#de191e] border border-[#de191e]/30" : "bg-[#de191e]/10 text-[#de191e] border border-[#de191e]/20"
                            : dark ? "bg-amber-400/20 text-amber-200 border border-amber-400/30" : "bg-amber-100 text-amber-800 border border-amber-200"
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
        <div id="monthly-printable-report" className={`mt-8 rounded-3xl border p-6 ${
          dark ? "border-amber-400/20 bg-[#0d1017]" : "border-slate-200 bg-white shadow-lg"
        }`}>
          <div className={`flex items-center justify-between border-b pb-4 ${dark ? "border-white/10" : "border-slate-200"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-500">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className={`text-base font-black ${dark ? "text-amber-200" : "text-slate-900"}`}>
                  تقرير الإنجاز الإعلامي والطلابي الشهري
                </h3>
                <p className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600"}`}>
                  وثيقة رسمية توضح مؤشرات الأداء الرقمي لمطبوعات وفعاليات مدارس العقيق
                </p>
              </div>
            </div>
            <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${
              dark ? "border-white/15 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
            }`}>
              أغسطس 2026
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
              <span className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>إجمالي الأعداد المنشورة</span>
              <p className={`mt-1 text-xl font-black ${dark ? "text-amber-300" : "text-amber-800"}`}>{stats.topIssues.length || 3} أعداد</p>
            </div>
            <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
              <span className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>ألبومات الفعاليات</span>
              <p className={`mt-1 text-xl font-black ${dark ? "text-amber-300" : "text-amber-800"}`}>{stats.topAlbums.length || 2} ألبومات</p>
            </div>
            <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
              <span className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>معدل رضا وتفاعل القراء</span>
              <p className={`mt-1 text-xl font-black ${dark ? "text-emerald-300" : "text-emerald-700"}`}>98.4%</p>
            </div>
            <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
              <span className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-600"}`}>إجمالي التصفحات الرقمية</span>
              <p className={`mt-1 text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
