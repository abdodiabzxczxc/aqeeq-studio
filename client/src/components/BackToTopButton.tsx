import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

export function BackToTopButton() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة للأعلى"
      className={`fixed bottom-[130px] left-4 sm:bottom-6 sm:left-6 z-50 grid h-11 w-11 place-items-center rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 active:scale-95 animate-in fade-in slide-in-from-bottom-4 ${
        dark
          ? "border-[#f8ca14]/30 bg-black/80 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14]"
          : "border-[#08467d]/20 bg-white/90 text-[#08467d] hover:bg-[#08467d] hover:text-white"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
