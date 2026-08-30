import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker if supported
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.message("للتثبيت على الآيفون: اضغط زر المشاركة ثم اختر «إضافة إلى الشاشة الرئيسية» 📲");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("تم تثبيت تطبيق مدارس العقيق بنجاح 🎉");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-[#0f1422]/95 p-3.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0 text-right">
            <h4 className="text-xs font-black text-amber-100">
              تثبيت تطبيق مدارس العقيق
            </h4>
            <p className="truncate text-[10px] text-slate-400">
              تصفح فائق السرعة وإشعارات فورية بالأعداد الجديدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 active:scale-95"
          >
            <Download size={13} />
            <span>تثبيت</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
