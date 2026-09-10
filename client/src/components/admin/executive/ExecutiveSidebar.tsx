import React from "react";
import {
  Globe,
  BookOpen,
  LogOut,
  ChevronLeft,
  GraduationCap,
  Calculator,
  HelpCircle,
  Share2,
  Megaphone,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/** Mini KPI badge rendered at the top of the sidebar */
function KpiMini({ label, value, trend, color }: { label: string; value: number | string; trend?: "up" | "down" | "flat"; color: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <span className="text-[10px] font-bold text-slate-400 truncate">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-black ${color}`}>{value}</span>
        {trend === "up" && <TrendingUp size={10} className="text-emerald-400 shrink-0" />}
        {trend === "down" && <TrendingDown size={10} className="text-rose-400 shrink-0" />}
      </div>
    </div>
  );
}

export type ExecutivePillar =
  | "admissions"
  | "finance"
  | "pages"
  | "media"
  | "community"
  | "channels"
  | "alerts"
  | "operations"
  | "content"
  | "publishing"
  | "system";

interface ExecutiveSidebarProps {
  dark: boolean;
  activePillar: ExecutivePillar;
  setActivePillar: (pillar: ExecutivePillar) => void;
  pendingLeadsCount?: number;
  pendingArticlesCount?: number;
  user?: any;
  onLogout?: () => void;
  kpiData?: {
    totalAdmissions?: number;
    pendingAdmissions?: number;
    totalArticles?: number;
    pendingArticles?: number;
    totalIssues?: number;
    totalAlbums?: number;
  };
}

export function ExecutiveSidebar({
  dark,
  activePillar,
  setActivePillar,
  pendingLeadsCount = 0,
  pendingArticlesCount = 0,
  user,
  onLogout,
  kpiData,
}: ExecutiveSidebarProps) {

  const PILLARS: Array<{
    id: ExecutivePillar;
    title: string;
    subtitle: string;
    icon: any;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: "admissions",
      title: "1. القبول والتسجيل",
      subtitle: "طلبات أولياء الأمور وواتساب",
      icon: GraduationCap,
      badge: pendingLeadsCount > 0 ? pendingLeadsCount : undefined,
      badgeColor: "bg-amber-500 text-black",
    },
    {
      id: "finance",
      title: "2. الرسوم الدراسية",
      subtitle: "مصفوفة الرسوم وحاسبة الأقساط",
      icon: Calculator,
    },
    {
      id: "pages",
      title: "3. صفحات الموقع",
      subtitle: "الرئيسية · مدارسنا · الاعتمادات",
      icon: Globe,
    },
    {
      id: "media",
      title: "4. المركز الإعلامي",
      subtitle: "المجلات · الألبومات · المقالات",
      icon: BookOpen,
      badge: pendingArticlesCount > 0 ? pendingArticlesCount : undefined,
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "community",
      title: "5. الأسئلة والشركاء",
      subtitle: "بنك FAQs · شركاء النجاح",
      icon: HelpCircle,
    },
    {
      id: "channels",
      title: "6. القنوات والربط",
      subtitle: "السوشيال ميديا · البوابات · الفوتر",
      icon: Share2,
    },
    {
      id: "alerts",
      title: "7. الإعلانات والمواسم",
      subtitle: "النافذة المنبثقة · العطلات · اليوم الوطني",
      icon: Megaphone,
    },
  ];

  return (
    <aside
      className={`w-full lg:w-72 shrink-0 border-l transition-colors duration-200 flex flex-col justify-between p-4 ${
        dark
          ? "border-white/[0.08] bg-[#070b10] text-white"
          : "border-black/[0.06] bg-slate-50/70 text-slate-900"
      }`}
    >
      <div className="space-y-4">
        {/* Live KPI Mini-Stats */}
        {kpiData && (
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              نبض المنصة الآن 📊
            </p>
            <div className="space-y-1.5">
              {kpiData.totalAdmissions !== undefined && (
                <KpiMini
                  label="طلبات القبول"
                  value={kpiData.totalAdmissions}
                  trend={kpiData.pendingAdmissions && kpiData.pendingAdmissions > 0 ? "up" : "flat"}
                  color="text-amber-300"
                />
              )}
              {kpiData.totalArticles !== undefined && (
                <KpiMini
                  label="المقالات"
                  value={kpiData.totalArticles}
                  trend={kpiData.pendingArticles && kpiData.pendingArticles > 0 ? "up" : "flat"}
                  color="text-sky-300"
                />
              )}
              {kpiData.totalIssues !== undefined && (
                <KpiMini label="أعداد المجلة" value={kpiData.totalIssues} color="text-emerald-300" />
              )}
              {kpiData.totalAlbums !== undefined && (
                <KpiMini label="الألبومات" value={kpiData.totalAlbums} color="text-purple-300" />
              )}
            </div>
          </div>
        )}

        {/* Pillar Selection Rail */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            مراكز الإدارة والتنظيم (7 أقسام تخصصية) 🏛️
          </p>
          <nav className="space-y-1">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isActive =
                activePillar === pillar.id ||
                (pillar.id === "admissions" && activePillar === "operations") ||
                (pillar.id === "pages" && activePillar === "content") ||
                (pillar.id === "media" && activePillar === "publishing") ||
                (pillar.id === "channels" && activePillar === "system");

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillar(pillar.id)}
                  className={`w-full group flex items-center justify-between rounded-2xl p-2.5 text-right transition-all duration-200 cursor-pointer ${
                    isActive
                      ? dark
                        ? "bg-gradient-to-r from-amber-500/15 via-white/[0.04] to-transparent text-white border border-amber-500/30 shadow-md shadow-amber-500/5"
                        : "bg-white text-slate-900 border border-black/10 shadow-sm"
                      : dark
                      ? "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? dark
                            ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                            : "bg-[#08467d] text-white shadow-md shadow-[#08467d]/20"
                          : dark
                          ? "bg-white/5 text-slate-400 group-hover:text-white"
                          : "bg-slate-200/60 text-slate-600 group-hover:text-slate-900"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black tracking-tight truncate">{pillar.title}</h4>
                        {pillar.badge !== undefined && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[8px] font-black shrink-0 ${pillar.badgeColor}`}
                          >
                            {pillar.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronLeft
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "text-amber-400 -translate-x-1" : "text-transparent group-hover:text-slate-400"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Profile & Logout Footer */}
      <div className={`pt-4 border-t ${dark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
        <div className="flex items-center justify-between p-2 rounded-2xl bg-black/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs shadow-xs">
              {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <p className="text-xs font-black line-clamp-1">{user?.name || user?.username || "مدير النظام"}</p>
              <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <span>●</span>
                <span>صلاحيات عليا</span>
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={`p-2 rounded-xl text-slate-400 transition hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer`}
              title="تسجيل الخروج"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
