import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowUpLeft, Sparkles, Volume2, X } from "lucide-react";
import { useState } from "react";

export function AqeeqBroadcastBanner() {
  const { data: broadcast } = trpc.executiveAdmin.getBroadcast.useQuery(undefined, {
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  const [dismissed, setDismissed] = useState(false);

  if (!broadcast?.enabled || !broadcast.message || dismissed) {
    return null;
  }

  const isUrgent = broadcast.type === "urgent";
  const isCelebration = broadcast.type === "celebration";

  return (
    <div
      dir="rtl"
      className={"relative z-50 w-full px-4 py-2.5 transition-all duration-300 text-xs sm:text-sm font-bold shadow-md " + (
        isUrgent
          ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white"
          : isCelebration
          ? "bg-gradient-to-r from-[#d4af37] via-[#f8ca14] to-[#c59b27] text-black"
          : "bg-gradient-to-r from-[#08467d] via-[#0b5c9e] to-[#08467d] text-white"
      )}
    >
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={"grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs " + (
            isUrgent
              ? "bg-white/20 text-white animate-pulse"
              : isCelebration
              ? "bg-black/15 text-black"
              : "bg-white/15 text-[#f8ca14]"
          )}>
            {isUrgent ? <AlertCircle size={14} /> : isCelebration ? <Sparkles size={14} /> : <Volume2 size={14} />}
          </span>

          <span className={"rounded-md px-1.5 py-0.5 text-[10px] font-black shrink-0 " + (
            isUrgent
              ? "bg-black/25 text-white"
              : isCelebration
              ? "bg-black/10 text-black"
              : "bg-white/10 text-white"
          )}>
            {isUrgent ? "تنبيه عاجل" : isCelebration ? "إعلان تهنئة" : "إشعار هام"}
          </span>

          <p className="truncate text-xs sm:text-sm font-black">{broadcast.message}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {broadcast.link ? (
            <a
              href={broadcast.link}
              target="_blank"
              rel="noreferrer"
              className={"inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition " + (
                isUrgent
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : isCelebration
                  ? "bg-black text-[#f8ca14] hover:bg-black/80"
                  : "bg-white text-[#08467d] hover:bg-white/90"
              )}
            >
              <span>{broadcast.linkText || "عرض التفاصيل"}</span>
              <ArrowUpLeft size={13} />
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid h-6 w-6 place-items-center rounded-full opacity-70 hover:opacity-100 transition"
            title="إغلاق التنبيه"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
