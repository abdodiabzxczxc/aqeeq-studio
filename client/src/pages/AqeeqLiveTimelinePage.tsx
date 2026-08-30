import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Radio,
  Heart,
  Flame,
  Sparkles,
  Award,
  Clock,
  Send,
  Plus,
  Video,
  Share2,
  Calendar,
  Eye,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AqeeqLiveTimelinePage({ slug }: { slug?: string }) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const { data: event, isLoading, refetch } = trpc.liveEvents.getCurrent.useQuery(
    { slug },
    { refetchInterval: 10000 } // Auto refresh live moments every 10s
  );

  const [isAddMomentOpen, setIsAddMomentOpen] = useState(false);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentContent, setMomentContent] = useState("");
  const [momentMediaUrl, setMomentMediaUrl] = useState("");
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; left: number; emoji: string }[]>([]);

  const reactMutation = trpc.liveEvents.react.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const addMomentMutation = trpc.liveEvents.addMoment.useMutation({
    onSuccess: () => {
      toast.success("🔴 تم نشر اللحظة الحية على البث المباشر فوراً!");
      setIsAddMomentOpen(false);
      setMomentTitle("");
      setMomentContent("");
      setMomentMediaUrl("");
      void refetch();
    },
  });

  const triggerReaction = (type: "hearts" | "claps" | "stars" | "fires", emoji: string, momentId?: number) => {
    if (!event) return;
    reactMutation.mutate({ eventId: event.id, type, momentId });

    // Spawn floating flying emoji animation
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 80) + 10;
    setFlyingHearts((prev) => [...prev, { id, left, emoji }]);
    setTimeout(() => {
      setFlyingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `تابعوا معنا التغطية الحية المباشرة لفعاليات مدارس العقيق دقيقة بدقيقة! 🔴\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-[#06080d] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir="rtl">
      {/* Flying Reactions Animation Container */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {flyingHearts.map((h) => (
          <span
            key={h.id}
            style={{ left: `${h.left}%` }}
            className="absolute bottom-12 text-3xl sm:text-4xl animate-bounce transition-all duration-1000 transform -translate-y-96 opacity-0"
          >
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Site Header */}
      <AlaqeeqStudioSiteHeader title="البث الحي المباشر" active="studio" />

      {/* Live Hero Header */}
      <section className="relative overflow-hidden border-b border-red-500/20 bg-gradient-to-b from-[#1c080b] via-[#0f0608] to-[#06080d] pt-12 pb-16 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl text-center space-y-4">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-1.5 text-xs font-black text-red-300 backdrop-blur-md shadow-lg shadow-red-500/20">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <span>بث حي ومباشر الآن 🔴</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {event?.title || "التغطية الحية المباشرة لفعاليات مدارس العقيق 🎓"}
          </h1>

          <p className="mx-auto max-w-xl text-xs sm:text-sm font-bold text-slate-400 leading-6">
            {event?.description || "متابعة لحظة بلحظة لكافة فقرات الحفل والتكريم وتتويج الخريجين."}
          </p>

          {/* Realtime Floating Reaction Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => triggerReaction("hearts", "❤️")}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-black text-rose-300 hover:scale-105 transition shadow-lg"
            >
              <Heart size={16} className="fill-rose-500" />
              <span>تبريكات وفخر ({event?.totalReactions?.hearts || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => triggerReaction("claps", "👏")}
              className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs font-black text-amber-300 hover:scale-105 transition shadow-lg"
            >
              <span>👏</span>
              <span>تصفيق حار ({event?.totalReactions?.claps || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => triggerReaction("stars", "⭐")}
              className="flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/15 px-4 py-2 text-xs font-black text-yellow-300 hover:scale-105 transition shadow-lg"
            >
              <span>⭐</span>
              <span>تميز ({event?.totalReactions?.stars || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => triggerReaction("fires", "🔥")}
              className="flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-xs font-black text-orange-300 hover:scale-105 transition shadow-lg"
            >
              <Flame size={16} className="text-orange-400" />
              <span>حماس ({event?.totalReactions?.fires || 0})</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/50 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 transition shadow-lg"
            >
              <Share2 size={14} />
              <span>مشاركة الرابط</span>
            </button>

            {isAdmin && (
              <Button
                type="button"
                onClick={() => setIsAddMomentOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs h-10 px-5 rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2"
              >
                <Plus size={16} />
                <span>+ نشر لحظة حية جديدة 🔴</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Timeline Section */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Clock size={18} className="text-red-400" />
            <span>مجريات الفعالية بالدقائق واللحظات ({event?.moments?.length || 0})</span>
          </h2>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            يتم التحديث تلقائياً
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative border-r-2 border-amber-400/30 pr-6 space-y-8 mr-2 sm:mr-4">
          {event?.moments?.map((m) => (
            <div key={m.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -right-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 ring-4 ring-black shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Moment Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0f1422] p-5 sm:p-6 shadow-xl space-y-4 hover:border-amber-400/50 transition">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300 font-mono">
                    {m.minuteMarker}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(m.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {m.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-bold leading-6 whitespace-pre-wrap">
                  {m.content}
                </p>

                {m.mediaUrl && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black max-h-80">
                    <img src={m.mediaUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Reactions on this moment */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerReaction("hearts", "❤️", m.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 transition"
                    >
                      <Heart size={13} className="fill-rose-500" />
                      <span>{m.reactions?.hearts || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReaction("claps", "👏", m.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 transition"
                    >
                      <span>👏</span>
                      <span>{m.reactions?.claps || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Admin Add Moment Modal */}
      {isAdmin && (
        <Dialog open={isAddMomentOpen} onOpenChange={setIsAddMomentOpen}>
          <DialogContent className="max-w-md rounded-3xl border border-red-500/40 bg-[#0c0d14] p-6 text-right text-white shadow-2xl" dir="rtl">
            <DialogHeader className="text-right border-b border-white/10 pb-3">
              <DialogTitle className="text-base font-black text-red-400 flex items-center gap-2">
                <Radio size={18} />
                <span>نشر لحظة وتحديث حي على البث 🔴</span>
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!event || !momentTitle.trim() || !momentContent.trim()) return;
                addMomentMutation.mutate({
                  eventId: event.id,
                  title: momentTitle.trim(),
                  content: momentContent.trim(),
                  mediaUrl: momentMediaUrl.trim() || undefined,
                });
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-black text-amber-200 mb-1.5">عنوان اللحظة *</label>
                <input
                  type="text"
                  required
                  value={momentTitle}
                  onChange={(e) => setMomentTitle(e.target.value)}
                  placeholder="مثال: بدء كلمة عميد الكلية والتكريم..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-bold outline-none focus:border-red-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-amber-200 mb-1.5">تفاصيل اللحظة *</label>
                <textarea
                  required
                  rows={4}
                  value={momentContent}
                  onChange={(e) => setMomentContent(e.target.value)}
                  placeholder="صف ما يحدث الآن في الحفل..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs leading-5 font-bold outline-none focus:border-red-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 mb-1.5">رابط صورة (اختياري)</label>
                <input
                  type="url"
                  value={momentMediaUrl}
                  onChange={(e) => setMomentMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs font-mono outline-none focus:border-red-400 transition"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddMomentOpen(false)} className="text-xs text-slate-400">
                  إلغاء
                </Button>
                <Button type="submit" disabled={addMomentMutation.isPending} className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 h-10 shadow-lg">
                  {addMomentMutation.isPending ? "جاري النشر..." : "نشر الآن 🔴"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
