import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PenTool, Sparkles, CheckCircle2, User, BookOpen, Send, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AqeeqArticleSubmitModal({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("طالب مبدع");
  const [category, setCategory] = useState<"تربوي" | "إبداعات الطلاب" | "إرشاد أسري" | "أنشطة وفعاليات" | "تجارب ملهمة">("إبداعات الطلاب");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const submitMutation = trpc.articles.submitGuest.useMutation({
    onSuccess: () => {
      toast.success("🎉 تم إرسال مقالك بنجاح! سيتم مراجعته من الإدارة ونشره قريباً.");
      setTitle("");
      setAuthorName("");
      setContent("");
      setCoverUrl("");
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء إرسال المقال");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim() || !content.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }
    submitMutation.mutate({
      title: title.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      category,
      content: content.trim(),
      coverUrl: coverUrl.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl overflow-hidden rounded-3xl border border-amber-400/30 bg-[#0a0d14] p-6 sm:p-8 text-right text-white shadow-2xl"
        dir="rtl"
      >
        <DialogHeader className="text-right space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <PenTool size={22} />
            <DialogTitle className="text-xl font-black text-white">
              شاركنا بمقالك وإبداعك في منصة العقيق
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-bold text-slate-400">
            نرحب بمشاركات الطلاب والمعلمين وأولياء الأمور. ستتم مراجعة المقال من إدارة التحرير واعتماده للنشر.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-amber-200 mb-1.5">عنوان المقال *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تجربتي في مسابقة الروبوت والذكاء الاصطناعي..."
              className="w-full rounded-2xl border border-white/15 bg-black/50 p-3.5 text-sm font-bold outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Author Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-amber-200 mb-1.5">اسم الكاتب أو الطالب *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="الاسم الثلاثي أو المستعار..."
                className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-bold outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-amber-200 mb-1.5">الصفة أو المرحلة</label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#121622] p-3 text-xs font-bold outline-none focus:border-amber-400 transition text-slate-200"
              >
                <option value="طالب مبدع">طالب مبدع</option>
                <option value="طالبة مبدعة">طالبة مبدعة</option>
                <option value="معلم متميز">معلم متميز</option>
                <option value="ولي أمر">ولي أمر</option>
                <option value="خريج العقيق">خريج العقيق</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-black text-amber-200 mb-1.5">تصنيف المقال</label>
            <div className="flex flex-wrap gap-2">
              {(["إبداعات الطلاب", "تربوي", "إرشاد أسري", "أنشطة وفعاليات", "تجارب ملهمة"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition border ${
                    category === cat
                      ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm shadow-amber-400/20"
                      : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-black text-amber-200 mb-1.5">نص المقال والمحتوى *</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب أفكارك ومقالك هنا بأسلوبك الجميل..."
              className="w-full rounded-2xl border border-white/15 bg-black/50 p-4 text-sm leading-6 font-bold outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Optional Cover */}
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1.5">رابط صورة الغلاف (اختياري)</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs font-mono outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-bold">
              ⚡ يتم تدقيق المقالات لغوياً والتأكد من توافقها مع القيم التربوية
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 h-10 shadow-lg shadow-amber-400/20"
              >
                <Send size={14} className="ml-1.5" />
                <span>{submitMutation.isPending ? "جاري الإرسال..." : "إرسال للمراجعة"}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
