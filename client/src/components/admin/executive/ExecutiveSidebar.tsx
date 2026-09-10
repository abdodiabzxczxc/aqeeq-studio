import React from "react";
import {
  Users,
  Globe,
  BookOpen,
  Sliders,
  LogOut,
  Sparkles,
  ChevronLeft,
  GraduationCap,
  Layers,
  ShieldAlert,
} from "lucide-react";

export type ExecutivePillar = "operations" | "content" | "publishing" | "system";

interface ExecutiveSidebarProps {
  dark: boolean;
  activePillar: ExecutivePillar;
  setActivePillar: (pillar: ExecutivePillar) => void;
  pendingLeadsCount?: number;
  pendingArticlesCount?: number;
  user?: any;
  onLogout?: () => void;
}

export function ExecutiveSidebar({
  dark,
  activePillar,
  setActivePillar,
  pendingLeadsCount = 0,
  pendingArticlesCount = 0,
  user,
  onLogout,
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
      id: "operations",
      title: "العمليات والقبول",
      subtitle: "طلبات التسجيل وحاسبة الرسوم",
      icon: GraduationCap,
      badge: pendingLeadsCount > 0 ? pendingLeadsCount : undefined,
      badgeColor: "bg-amber-500 text-black",
    },
    {
      id: "content",
      title: "محتوى صفحات الموقع",
      subtitle: "الرئيسية · مدارسنا · الاعتمادات",
      icon: Globe,
    },
    {
      id: "publishing",
      title: "أجنحة النشر والمكتبة",
      subtitle: "المجلات · الألبومات · المقالات",
      icon: BookOpen,
      badge: pendingArticlesCount > 0 ? pendingArticlesCount : undefined,
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "system",
      title: "الهوية والمنظومة",
      subtitle: "الهيدر · البوابات · التسويق",
      icon: Sliders,
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
      <div className="space-y-6">
        {/* Pillar Selection Rail */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            مراكز القيادة والمحاور الأربعة
          </p>
          <nav className="space-y-1.5">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activePillar === pillar.id;

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillar(pillar.id)}
                  className={`w-full group flex items-center justify-between rounded-2xl p-3 text-right transition-all duration-200 cursor-pointer ${
                    isActive
                      ? dark
                        ? "bg-gradient-to-r from-amber-500/15 via-white/[0.04] to-transparent text-white border border-amber-500/30 shadow-md shadow-amber-500/5"
                        : "bg-white text-slate-900 border border-black/10 shadow-sm"
                      : dark
                      ? "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? dark
                            ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                            : "bg-[#08467d] text-white shadow-md shadow-[#08467d]/20"
                          : dark
                          ? "bg-white/5 text-slate-400 group-hover:text-white"
                          : "bg-slate-200/60 text-slate-600 group-hover:text-slate-900"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black tracking-tight">{pillar.title}</h4>
                        {pillar.badge !== undefined && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${pillar.badgeColor}`}
                          >
                            {pillar.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 line-clamp-1">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronLeft
                    size={14}
                    className={`transition-transform duration-200 ${
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
