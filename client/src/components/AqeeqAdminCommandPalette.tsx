import { useState, useEffect, useMemo } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  Palette,
  Compass,
  Megaphone,
  BookOpen,
  Camera,
  Radio,
  Share2,
  TrendingUp,
  Database,
  Rocket,
  ArrowRight,
  ExternalLink,
  UserCheck,
  X
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  shortcut?: string;
  action: () => void;
}

interface AqeeqAdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: any, subTab?: string) => void;
  onTriggerDeploy?: () => void;
  admissionsList?: any[];
}

export function AqeeqAdminCommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerDeploy,
  admissionsList = [],
}: AqeeqAdminCommandPaletteProps) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query on open
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  // Core system commands
  const commands: CommandItem[] = useMemo(() => [
    {
      id: "cmd-radar",
      title: "رادار العقيق ونبض المدرسة (KPIs)",
      category: "لوحات التحكم الأساسية",
      icon: LayoutDashboard,
      action: () => { onSelectTab("radar"); onClose(); },
    },
    {
      id: "cmd-admissions-inbox",
      title: "طلبات القبول والتسجيل (الوارد والفرز)",
      category: "شؤون القبول والتسجيل",
      icon: GraduationCap,
      action: () => { onSelectTab("admissions", "inbox"); onClose(); },
    },
    {
      id: "cmd-fees-matrix",
      title: "مصفوفة الرسوم الدراسية وحاسبة الخصومات",
      category: "شؤون القبول والتسجيل",
      icon: DollarSign,
      action: () => { onSelectTab("admissions", "fees"); onClose(); },
    },
    {
      id: "cmd-visual-overrides",
      title: "لوحة التعديلات المرئية المباشرة (Overrides Hub)",
      category: "المحرر المرئي وهندسة الموقع",
      icon: Palette,
      shortcut: "Alt+V",
      action: () => { onSelectTab("orchestration", "visual_overrides"); onClose(); },
    },
    {
      id: "cmd-header-nav",
      title: "إدارة الهيدر وروابط التنقل الـ 9 وشريط الطوارئ",
      category: "المحرر المرئي وهندسة الموقع",
      icon: Compass,
      action: () => { onSelectTab("orchestration", "header_nav"); onClose(); },
    },
    {
      id: "cmd-hero-occasions",
      title: "أغلفة الهيرو ومناسبات الموقع (اليوم الوطني / التأسيس)",
      category: "المحرر المرئي وهندسة الموقع",
      icon: Palette,
      action: () => { onSelectTab("orchestration", "hero"); onClose(); },
    },
    {
      id: "cmd-emergency-banner",
      title: "شريط التنبيهات والأخبار العاجلة الفوري",
      category: "التواصل والإعلام",
      icon: Megaphone,
      action: () => { onSelectTab("broadcast", "broadcast"); onClose(); },
    },
    {
      id: "cmd-articles",
      title: "إدارة المقالات والمدونة المدرسية",
      category: "المحتوى والإعلام",
      icon: BookOpen,
      action: () => { onSelectTab("articles"); onClose(); },
    },
    {
      id: "cmd-albums",
      title: "ألبومات الصور ومعارض الفعاليات",
      category: "المحتوى والإعلام",
      icon: Camera,
      action: () => { onSelectTab("content"); onClose(); },
    },
    {
      id: "cmd-podcasts",
      title: "بودكاست العقيق والاستوديو الصوتي",
      category: "المحتوى والإعلام",
      icon: Radio,
      action: () => { onSelectTab("podcast"); onClose(); },
    },
    {
      id: "cmd-whatsapp",
      title: "حملات ورسائل الواتساب وQR",
      category: "التواصل والإعلام",
      icon: Share2,
      action: () => { onSelectTab("whatsapp"); onClose(); },
    },
    {
      id: "cmd-marketing",
      title: "أكواد بكسل الإعلانات (سناب شات، ميتا، تيك توك، جوجل)",
      category: "التسويق وSEO",
      icon: TrendingUp,
      action: () => { onSelectTab("orchestration", "marketing"); onClose(); },
    },
    {
      id: "cmd-backup",
      title: "النسخ الاحتياطي الشامل واستعادة النظام (Backup & Restore)",
      category: "أمان واستقرار النظام",
      icon: Database,
      action: () => { onSelectTab("orchestration", "backup"); onClose(); },
    },
    {
      id: "cmd-deploy-live",
      title: "🚀 نشر الموقع المباشر وتحديث السيرفر (Deploy to Live)",
      category: "إجراءات فورية",
      icon: Rocket,
      action: () => {
        onClose();
        if (onTriggerDeploy) onTriggerDeploy();
      },
    },
  ], [onSelectTab, onClose, onTriggerDeploy]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Filter student leads
  const matchingStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return admissionsList
      .filter(
        (lead: any) =>
          (lead.studentName && lead.studentName.toLowerCase().includes(q)) ||
          (lead.guardianName && lead.guardianName.toLowerCase().includes(q)) ||
          (lead.phone && lead.phone.includes(q)) ||
          (lead.referenceNo && lead.referenceNo.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [admissionsList, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all ${
          dark
            ? "border-white/10 bg-[#0d1017] text-white shadow-black/80"
            : "border-black/10 bg-white text-slate-900 shadow-slate-400/30"
        }`}
      >
        {/* Search Header */}
        <div className="relative flex items-center border-b border-current/10 px-5 py-4">
          <Search size={20} className="text-amber-400 ml-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن أي إعداد، صفحة، أمر، أو اسم طالب مسجل..."
            className="w-full bg-transparent text-sm sm:text-base font-bold outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={16} />
            </button>
          )}
          <span className="hidden sm:inline-block mr-2 rounded-lg border border-current/20 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            ESC للإغلاق
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Matching Students (if any) */}
          {matchingStudents.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-black text-emerald-400 px-3 block">
                🎓 طلاب مطابقون للبحث ({matchingStudents.length}):
              </span>
              {matchingStudents.map((lead: any) => (
                <button
                  key={lead.id}
                  onClick={() => {
                    onSelectTab("admissions", "inbox");
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-right ${
                    dark ? "hover:bg-white/5" : "hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 font-black">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{lead.studentName}</h4>
                      <p className="text-[10px] text-slate-400">
                        ولي الأمر: {lead.guardianName} · {lead.gradeLevel || "غير محدد"} · {lead.phone}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 rotate-180" />
                </button>
              ))}
            </div>
          )}

          {/* Commands List */}
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-right group ${
                      dark ? "hover:bg-white/5" : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10 text-amber-500 group-hover:scale-105 transition">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{cmd.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold">{cmd.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cmd.shortcut && (
                        <span className="rounded-md border border-current/20 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                          {cmd.shortcut}
                        </span>
                      )}
                      <ArrowRight size={14} className="text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : matchingStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              لا توجد أوامر أو بيانات مطابقة لـ "{query}"
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-current/10 px-5 py-2.5 text-[11px] font-bold text-slate-400 bg-current/[0.02]">
          <span>قمرة القيادة الذكية · مدارس العقيق</span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <span>التنقل بـ</span>
            <kbd className="rounded border px-1 py-0.5 border-current/20">↑</kbd>
            <kbd className="rounded border px-1 py-0.5 border-current/20">↓</kbd>
            <kbd className="rounded border px-1 py-0.5 border-current/20">Enter</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
