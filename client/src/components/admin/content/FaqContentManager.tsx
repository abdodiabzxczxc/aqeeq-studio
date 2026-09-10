import React, { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, HelpCircle, Save, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "admissions" | "academics" | "services" | "general";
  visible: boolean;
  order: number;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "متى يبدأ موعد التقديم للعام الدراسي الجديد؟",
    answer: "يبدأ التسجيل المبكر مع بداية الفصل الدراسي الثالث ويستمر حتى اكتمال الطاقة الاستيعابية المحددة لكل مرحلة دراسية.",
    category: "admissions",
    visible: true,
    order: 1,
  },
  {
    id: "faq-2",
    question: "ما هي متطلبات واختبارات القبول في المسار الدولي؟",
    answer: "يشترط اجتياز اختبار تحديد المستوى في مادتي اللغة الإنجليزية والرياضيات، بالإضافة إلى المقابلة الشخصية مع المرشد الأكاديمي.",
    category: "academics",
    visible: true,
    order: 2,
  },
  {
    id: "faq-3",
    question: "هل تتوفر خدمات النقل المدرسي المكيف لجميع أحياء المدينة؟",
    answer: "نعم، تمتلك مدارس العقيق أسطولاً مدرسياً حديثاً ومجهزاً بأنظمة التتبع الذكي ومكيفاً بالكامل يغطي معظم الأحياء بالمدينة المنورة.",
    category: "services",
    visible: true,
    order: 3,
  },
  {
    id: "faq-4",
    question: "ما هي التسهيلات وأنظمة التقسيط المتاحة لسداد الرسوم؟",
    answer: "نوفر أنظمة سداد مرنة وميسرة تشمل السداد الفصلي على 3 دفعات، مع خصم السداد النقدي الكامل، وخصم 10% تلقائي للأشقاء.",
    category: "admissions",
    visible: true,
    order: 4,
  },
  {
    id: "faq-5",
    question: "ما هي الاعتمادات الدولية المعتمدة لشهادة خريجي العقيق؟",
    answer: "خريجو مدارس العقيق يحصلون على شهادة معتمدة من وزارة التعليم بالإضافة إلى اعتماد كوجنيا الأمريكي الدولي (Cognia) بتقييم 99.2%.",
    category: "general",
    visible: true,
    order: 5,
  },
];

interface FaqContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function FaqContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: FaqContentManagerProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>(
    orchestration?.faqs && orchestration.faqs.length > 0 ? orchestration.faqs : DEFAULT_FAQS
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState<FaqItem["category"]>("admissions");

  const CATEGORY_LABELS: Record<FaqItem["category"], string> = {
    admissions: "القبول والرسوم 💰",
    academics: "المناهج والأكاديميا 🎓",
    services: "الخدمات والنقل 🚌",
    general: "أسئلة عامة 🏛️",
  };

  const handleToggleVisibility = (id: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const list = [...faqs];
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) return;
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setFaqs(list.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handleDelete = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i + 1 })));
    toast.success("تم حذف السؤال من القائمة");
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("يرجى كتابة السؤال والإجابة");
      return;
    }
    const newF: FaqItem = {
      id: "faq-" + Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      visible: true,
      order: faqs.length + 1,
    };
    setFaqs([...faqs, newF]);
    setNewQuestion("");
    setNewAnswer("");
    setIsAdding(false);
    toast.success("تمت إضافة السؤال بنجاح ➕");
  };

  const handleSaveAll = async () => {
    try {
      await onSave({
        ...orchestration,
        faqs,
      });
      toast.success("✅ تم حفظ محتوى الأسئلة الشائعة ونشرها للزوار بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-base font-black">محرك الأسئلة الشائعة التفاعلي ({faqs.length} سؤال)</h3>
            <p className="text-xs text-slate-400 font-bold">
              إدارة الأسئلة والإجابات الأكثر تكراراً لتظهر للزوار وأولياء الأمور في صفحات القبول ومدارسنا
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs gap-1.5 rounded-xl cursor-pointer"
          >
            <Plus size={14} />
            <span>إضافة سؤال جديد ➕</span>
          </Button>

          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs gap-1.5 rounded-xl px-5 cursor-pointer"
          >
            <Save size={13} />
            <span>{isSaving ? "جارِ الحفظ..." : "حفظ الأسئلة 💾"}</span>
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-400">إضافة سؤال شائع جديد</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-400 hover:text-white">إلغاء ✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">السؤال</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="مثال: هل يتوفر نقل مدرسي في المساء؟"
                className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">الإجابة الشافية</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={3}
                placeholder="اكتب الإجابة المفصلة التي ستظهر لولي الأمر..."
                className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none bg-white/5 resize-none"
              />
            </div>
            <div className="w-full sm:w-60">
              <label className="text-[11px] font-bold text-slate-300 block mb-1">التصنيف</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
              >
                <option value="admissions">القبول والرسوم 💰</option>
                <option value="academics">المناهج والأكاديميا 🎓</option>
                <option value="services">الخدمات والنقل 🚌</option>
                <option value="general">أسئلة عامة 🏛️</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleAddFaq}
              className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-6 rounded-xl cursor-pointer"
            >
              إدراج السؤال في القائمة ➕
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "admissions", "academics", "services", "general"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-400 text-black"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "جميع الأسئلة" : CATEGORY_LABELS[cat as FaqItem["category"]]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الأسئلة..."
            className="w-full rounded-xl border pr-8 pl-3 py-1.5 text-xs font-bold outline-none bg-white/5"
          />
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => (
          <div
            key={faq.id}
            className={`p-4 rounded-2xl border transition-all space-y-2 ${
              faq.visible
                ? dark ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-slate-50 border-black/10"
                : "opacity-40 bg-black/20 border-dashed border-current/10"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-black text-amber-400 mt-0.5">#{idx + 1}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white">{faq.question}</h4>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {CATEGORY_LABELS[faq.category]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(faq.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="تحريك لأعلى"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(faq.id, "down")}
                  disabled={idx === filteredFaqs.length - 1}
                  className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="تحريك لأسفل"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(faq.id)}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    faq.visible ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-500 hover:bg-white/5"
                  }`}
                  title={faq.visible ? "إخفاء من الموقع" : "إظهار في الموقع"}
                >
                  {faq.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(faq.id)}
                  className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="حذف السؤال"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1 pr-6 border-t border-current/5">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
