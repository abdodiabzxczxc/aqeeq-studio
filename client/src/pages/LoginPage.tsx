import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { LoginAmbientBackdrop } from "@/components/ui/login-ambient-backdrop";
import { SignInCard2 } from "@/components/ui/sign-in-card-2";
import { toast } from "sonner";
import { Sun, Moon, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading, login } = useAuth();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleSubmit = async (
    e: React.FormEvent,
    data: { username: string; password: string; rememberMe: boolean }
  ) => {
    if (!data.username.trim() || !data.password) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setSubmitting(true);
    try {
      await login({
        username: data.username.trim(),
        password: data.password,
      });
      toast.success("تم تسجيل الدخول بنجاح", {
        description: "مرحبًا بك في بوابة إدارة مدارس العقيق الأهلية والدولية",
      });
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "بيانات الدخول غير صحيحة", {
        description: "تأكد من اسم المستخدم وكلمة المرور ثم أعد المحاولة.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir="rtl"
      className={`fixed inset-0 z-50 flex min-h-screen w-screen flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-8 transition-colors duration-700 select-none ${
        dark ? "bg-[#04070c] text-white" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* 1. Dynamic Auto-moving Ambient Backdrop with Very Low Opacity */}
      <LoginAmbientBackdrop dark={dark} />

      {/* 2. Top Minimal Bar (Theme Switcher + Quick Portal Return) */}
      <div className="absolute top-4 inset-x-0 mx-auto max-w-5xl px-5 sm:px-8 flex items-center justify-between z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black backdrop-blur-md border transition-all ${
            dark
              ? "border-white/10 bg-white/5 text-slate-300 hover:text-amber-300 hover:border-white/20 hover:bg-white/10"
              : "border-slate-200 bg-white/80 text-slate-600 hover:text-[#08467d] hover:border-slate-300 hover:bg-white"
          }`}
        >
          <ArrowRight size={14} />
          <span>بوابة العقيق</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={dark ? "التبديل إلى الوضع النهاري (Light Mode)" : "التبديل إلى الوضع الليلي (Dark Mode)"}
          className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all ${
            dark
              ? "border-white/10 bg-white/5 text-amber-300 hover:bg-white/10 hover:border-amber-300/40"
              : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:text-[#08467d]"
          }`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* 3. Luxury 3D Sign In Card */}
      <div className="relative z-10 w-full flex justify-center items-center my-auto">
        <SignInCard2
          dark={dark}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </div>

      {/* 4. Bottom School Identity Note */}
      <div className="relative z-10 text-center mt-3 text-[11px] font-bold text-slate-500 pointer-events-none">
        <p>مدارس العقيق الأهلية والدولية بالمدينة المنورة · جميع الحقوق محفوظة © 2026</p>
      </div>
    </main>
  );
}
