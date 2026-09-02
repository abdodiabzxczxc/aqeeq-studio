import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, Sparkles, User } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setSubmitting(true);
    try {
      await login({
        username: username.trim(),
        password,
      });
      toast.success("تم تسجيل الدخول بنجاح", {
        description: "مرحبًا بك في بوابة مدارس العقيق الأهلية والدولية",
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
      className="relative flex min-h-screen items-center justify-center bg-[#07090f] p-4 text-slate-100"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle_at_50% 20%, rgba(214,185,106,0.12), transparent 45%), radial-gradient(circle_at_80% 80%, rgba(22,86,119,0.18), transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-amber-200"
          >
            <ArrowRight size={15} />
            العودة إلى بوابة مدارس العقيق
          </button>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300/80">
            <Sparkles size={13} />
            نظام المصادقة الآمن
          </span>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[2rem] border border-amber-300/25 bg-[#0e131f]/90 p-7 shadow-[0_32px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-9">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-300/20 to-amber-500/10 text-amber-200 shadow-inner">
              <Lock size={26} />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-amber-50">
              تسجيل الدخول
            </h1>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم وإدارة المنصة.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/40 py-3 pl-3 pr-10 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-amber-300/80 focus:ring-1 focus:ring-amber-300/50"
                />
                <User
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300">
                كلمة المرور
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/40 py-3 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-amber-300/80 focus:ring-1 focus:ring-amber-300/50"
                />
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !username.trim() || !password}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-300/20 transition duration-200 hover:bg-amber-200 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري تسجيل الدخول…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Helper hint for default admin */}
          <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-3 text-center text-[10px] leading-5 text-slate-400">
            <span className="font-bold text-amber-200">ملاحظة المدير:</span> يتم
            إنشاء الحساب الإداري الافتراضي تلقائيًا عند بدء التشغيل إذا تم تعيينه
            في متغيرات البيئة.
          </div>
        </div>
      </div>
    </main>
  );
}
