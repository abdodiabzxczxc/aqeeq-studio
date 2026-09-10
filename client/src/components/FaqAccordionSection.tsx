import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DEFAULT_FAQS, FaqItem } from "@/components/admin/content/FaqContentManager";
import { HelpCircle, ChevronDown, Search, Sparkles, MessageCircleQuestion } from "lucide-react";

interface FaqAccordionSectionProps {
  dark?: boolean;
  defaultCategory?: "all" | "admissions" | "academics" | "services" | "general";
  title?: string;
  subtitle?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  all: "جميع الأسئلة ✦",
  admissions: "القبول والرسوم 💰",
  academics: "المسارات والاعتمادات 🎓",
  services: "الخدمات والمواصلات 🚌",
  general: "أسئلة عامة ℹ️",
};

export function FaqAccordionSection({
  dark = true,
  defaultCategory = "all",
  title = "الأسئلة الشائعة والمكررة",
  subtitle = "كل ما تود معرفته عن التسجيل، المسارات التعليمية، والخدمات بمدارس العقيق",
}: FaqAccordionSectionProps) {
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const faqsList: FaqItem[] =
    (orchestration as any)?.faqs && (orchestration as any).faqs.length > 0
      ? (orchestration as any).faqs
      : DEFAULT_FAQS;

  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [faqsList[0]?.id || "faq-1"]: true,
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleFaqs = faqsList
    .filter((f) => f.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredFaqs = visibleFaqs.filter((f) => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (visibleFaqs.length === 0) return null;

  return (
    <section
      dir="rtl"
      id="faq-section"
      className={`relative w-full py-16 px-4 sm:px-6 md:px-8 transition-colors duration-300 font-['Tajawal',sans-serif] ${
        dark ? "text-white" : "text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1080px]">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3 mb-10">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black shadow-xs ${
              dark
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
            }`}
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span>إجابات فورية ومعتمدة</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            {title}
          </h2>

          <p
            className={`text-xs sm:text-sm font-medium max-w-xl mx-auto ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Categories Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10 w-full sm:w-auto scrollbar-none">
            {Object.entries(CATEGORY_NAMES).map(([catKey, catLabel]) => {
              const count =
                catKey === "all"
                  ? visibleFaqs.length
                  : visibleFaqs.filter((f) => f.category === catKey).length;
              if (count === 0 && catKey !== "all") return null;

              const isSelected = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? dark
                        ? "bg-[#f8ca14] text-black shadow-sm"
                        : "bg-[#08467d] text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ابحث في الأسئلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl border pr-10 pl-4 py-2 text-xs font-bold transition outline-none ${
                dark
                  ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-amber-400/50"
                  : "border-black/10 bg-white text-slate-900 placeholder-slate-400 focus:border-[#08467d]"
              }`}
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div
              className={`p-10 rounded-3xl border text-center space-y-2 ${
                dark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-slate-50"
              }`}
            >
              <MessageCircleQuestion
                size={36}
                className="mx-auto opacity-30 text-amber-400 mb-2"
              />
              <p className="text-sm font-bold text-slate-400">
                لا توجد نتائج مطابقة لبحثك في هذا القسم
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? dark
                        ? "border-amber-400/30 bg-white/[0.04] shadow-lg shadow-black/40"
                        : "border-[#08467d]/30 bg-white shadow-md"
                      : dark
                      ? "border-white/10 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]"
                      : "border-black/10 bg-white hover:border-black/20 hover:bg-slate-50/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition ${
                          isOpen
                            ? dark
                              ? "bg-amber-400 text-black"
                              : "bg-[#08467d] text-white"
                            : dark
                            ? "bg-white/10 text-slate-400"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        س
                      </div>
                      <span className="text-sm sm:text-base font-black leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 border-amber-400/40 text-amber-400"
                          : "border-current/10 text-slate-400"
                      }`}
                    >
                      <ChevronDown size={15} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className={`px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                        dark
                          ? "border-white/10 text-slate-300"
                          : "border-black/5 text-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 pt-2">
                        <span className="font-black text-emerald-500 text-xs mt-0.5 shrink-0">
                          الإجابة:
                        </span>
                        <p className="font-medium whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
