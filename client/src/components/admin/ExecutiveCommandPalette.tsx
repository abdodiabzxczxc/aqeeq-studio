import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Sparkles, ArrowRight, Layers, FileText, Camera, Mic, Settings, Users, Palette, Image } from "lucide-react";
import { useLocation } from "wouter";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  action: () => void;
}

export function ExecutiveCommandPalette({
  open,
  onOpenChange,
  onSelectTab,
  onOpenMediaVault,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTab: (tab: string, subTab?: string) => void;
  onOpenMediaVault: () => void;
}) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const commands: CommandItem[] = [
    {
      id: "radar",
      title: "رادار العقيق والتحليلات الحية",
      category: "التنقل السريع",
      icon: Sparkles,
      action: () => onSelectTab("radar"),
    },
    {
      id: "media-vault",
      title: "مكتبة الوسائط المركزية (Media Vault)",
      category: "الأدوات التنفيذية",
      icon: Image,
      action: () => onOpenMediaVault(),
    },
    {
      id: "admissions",
      title: "إدارة طلبات القبول والتسجيل والرسوم",
      category: "التنقل السريع",
      icon: Users,
      action: () => onSelectTab("admissions"),
    },
    {
      id: "fees",
      title: "جداول الرسوم المدرسية والخصومات",
      category: "القبول والتسجيل",
      icon: FileText,
      action: () => onSelectTab("admissions", "fees"),
    },
    {
      id: "articles",
      title: "استوديو المقالات والأخبار",
      category: "إدارة المحتوى",
      icon: FileText,
      action: () => onSelectTab("content", "articles"),
    },
    {
      id: "albums",
      title: "استوديو الألبومات وتوثيق الفعاليات",
      category: "إدارة المحتوى",
      icon: Camera,
      action: () => setLocation("/albums/manage"),
    },
    {
      id: "podcasts",
      title: "استوديو بودكاست وأثير العقيق",
      category: "إدارة المحتوى",
      icon: Mic,
      action: () => setLocation("/podcast/manage"),
    },
    {
      id: "visual-editor",
      title: "فتح المحرر البصري الحي على الرئيسية",
      category: "المحرر البصري",
      icon: Palette,
      action: () => setLocation("/"),
    },
    {
      id: "system-settings",
      title: "إعدادات الهيدر والفوتر والتواصل",
      category: "أوركسترا النظام",
      icon: Settings,
      action: () => onSelectTab("system", "header_footer"),
    },
    {
      id: "campuses",
      title: "صروح ومجمعات مدارس العقيق (بنين وبنات)",
      category: "أوركسترا النظام",
      icon: Layers,
      action: () => onSelectTab("system", "campuses"),
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 rounded-3xl overflow-hidden bg-[#0d121c] border-white/10 text-white shadow-2xl" dir="rtl">
        {/* Search Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search size={18} className="text-amber-400" />
          <input
            type="text"
            placeholder="اكتب أمرك أو ابحث في كل صفحات وإعدادات المنصة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-bold outline-none text-white placeholder-slate-500"
            autoFocus
          />
          <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
            ESC للإغلاق
          </span>
        </div>

        {/* Command Results */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              لا توجد أوامر أو شاشات تطابق البحث
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.06] text-right transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{item.category}</span>
                    </div>
                  </div>

                  <ArrowRight size={14} className="rotate-180 text-slate-500 group-hover:text-amber-400 transition" />
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
