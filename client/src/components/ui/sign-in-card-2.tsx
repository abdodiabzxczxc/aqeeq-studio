import React, { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInCard2Props {
  dark?: boolean;
  onSubmit: (e: React.FormEvent, data: { username: string; password: string; rememberMe: boolean }) => void;
  isLoading?: boolean;
}

export function SignInCard2({ dark = true, onSubmit, isLoading = false }: SignInCard2Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"username" | "password" | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, { username, password, rememberMe });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[440px] relative z-10 p-2 sm:p-4"
    >
      {/* ── Outer Light Beam Wrapper (Tight 1.5px Precision Border Beam) ── */}
      <div className="relative rounded-[2.2rem] p-[1.5px] overflow-hidden shadow-2xl">
        {/* 1. Ambient Glow behind the rotating beam */}
        <div
          className="absolute inset-[-150%] animate-[spin_5.5s_linear_infinite] pointer-events-none blur-md opacity-60"
          style={{
            background: dark
              ? "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, rgba(248, 202, 20, 0.6) 330deg, rgba(255, 255, 255, 0.9) 360deg)"
              : "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, rgba(8, 70, 125, 0.5) 330deg, rgba(248, 202, 20, 0.95) 360deg)",
          }}
        />

        {/* 2. Sharp Travelling Border Beam Line */}
        <div
          className="absolute inset-[-150%] animate-[spin_5.5s_linear_infinite] pointer-events-none"
          style={{
            background: dark
              ? "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 285deg, rgba(248, 202, 20, 0.7) 335deg, #ffffff 360deg)"
              : "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 285deg, rgba(8, 70, 125, 0.7) 335deg, #f8ca14 360deg)",
          }}
        />

        {/* ── 3. Subtle Glassmorphism Card Body ── */}
        <div
          className={cn(
            "relative rounded-[calc(2.2rem-1.5px)] p-7 sm:p-9 transition-colors duration-500 overflow-hidden",
            dark
              ? "bg-[#070b12]/75 backdrop-blur-xl border border-white/10 text-slate-100 shadow-black/80"
              : "bg-white/75 backdrop-blur-xl border border-white/70 text-slate-900 shadow-slate-300/40"
          )}
        >
          {/* Subtle inner card sheen */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(135deg, ${dark ? "#fff" : "#000"} 0.5px, transparent 0.5px), linear-gradient(45deg, ${dark ? "#fff" : "#000"} 0.5px, transparent 0.5px)`,
              backgroundSize: "26px 26px",
            }}
          />

          {/* Card Header & Branding */}
          <div className="text-center relative z-10 mb-6">
            {/* Free-Floating Larger Logo (No box) */}
            <div className="mx-auto flex justify-center items-center mb-3">
              <img
                src="/alaqeeq-logo.png"
                alt="مدارس العقيق"
                className={cn(
                  "h-20 sm:h-24 w-auto object-contain drop-shadow-md select-none transition-transform duration-300 hover:scale-105",
                  dark ? "brightness-110" : ""
                )}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-2.5 border backdrop-blur-md shadow-xs bg-amber-400/10 border-amber-400/25 text-amber-500 dark:text-amber-300">
              <ShieldCheck size={12} />
              <span>نظام المصادقة المشفر · مدارس العقيق</span>
            </div>

            <h1
              className={cn(
                "text-2xl font-black tracking-tight",
                dark ? "text-white" : "text-slate-900"
              )}
            >
              تسجيل الدخول
            </h1>
            <p
              className={cn(
                "text-xs mt-1.5 leading-relaxed font-bold",
                dark ? "text-slate-400" : "text-slate-500"
              )}
            >
              بوابة إدارة المنصة والمعارض والمجلات وأنشطة العقيق
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-right">
            {/* Username / Email Field */}
            <div className="space-y-1.5">
              <label
                className={cn(
                  "block text-xs font-black",
                  dark ? "text-slate-300" : "text-slate-700"
                )}
              >
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div
                className={cn(
                  "relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden",
                  dark
                    ? focusedInput === "username"
                      ? "border-amber-300/80 ring-2 ring-amber-400/20 bg-[#0d1420]/80"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                    : focusedInput === "username"
                    ? "border-[#08467d] ring-2 ring-[#08467d]/20 bg-white"
                    : "border-slate-200 bg-white/60 hover:border-slate-300"
                )}
              >
                <div className="pr-3.5 pl-2 text-slate-400 pointer-events-none">
                  <User size={17} className={focusedInput === "username" ? (dark ? "text-amber-300" : "text-[#08467d]") : ""} />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput("username")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="مثال: admin أو البريد الإلكتروني"
                  className={cn(
                    "w-full h-11 bg-transparent pr-1 pl-3 text-xs sm:text-sm font-bold outline-none placeholder:text-slate-400/70",
                    dark ? "text-white" : "text-slate-900"
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                className={cn(
                  "block text-xs font-black",
                  dark ? "text-slate-300" : "text-slate-700"
                )}
              >
                كلمة المرور
              </label>
              <div
                className={cn(
                  "relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden",
                  dark
                    ? focusedInput === "password"
                      ? "border-amber-300/80 ring-2 ring-amber-400/20 bg-[#0d1420]/80"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                    : focusedInput === "password"
                    ? "border-[#08467d] ring-2 ring-[#08467d]/20 bg-white"
                    : "border-slate-200 bg-white/60 hover:border-slate-300"
                )}
              >
                <div className="pr-3.5 pl-2 text-slate-400 pointer-events-none">
                  <Lock size={17} className={focusedInput === "password" ? (dark ? "text-amber-300" : "text-[#08467d]") : ""} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="أدخل كلمة المرور"
                  className={cn(
                    "w-full h-11 bg-transparent pr-1 pl-10 text-xs sm:text-sm font-bold outline-none placeholder:text-slate-400/70",
                    dark ? "text-white" : "text-slate-900"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Security Note */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={cn(
                    "h-4 w-4 rounded cursor-pointer transition-all",
                    dark
                      ? "bg-white/10 border-white/20 checked:bg-amber-400 checked:border-amber-400 text-black focus:ring-0"
                      : "bg-slate-100 border-slate-300 checked:bg-[#08467d] checked:border-[#08467d] text-white focus:ring-0"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-bold",
                    dark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  تذكر تسجيل الدخول
                </span>
              </label>

              <span
                className={cn(
                  "text-[11px] font-bold flex items-center gap-1",
                  dark ? "text-slate-400" : "text-slate-500"
                )}
              >
                <Sparkles size={11} className="text-amber-400" />
                اتصال مشفر 256-bit
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full relative group/btn mt-4 h-12 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center overflow-hidden shadow-lg active:scale-[0.985]",
                dark
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/35"
                  : "bg-gradient-to-r from-[#08467d] via-[#0a589c] to-[#08467d] text-white shadow-[#08467d]/20 hover:shadow-[#08467d]/35"
              )}
            >
              {/* Button dynamic shimmer stripe */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 pointer-events-none"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>جارٍ التحقق والمصادقة...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>دخول إلى لوحة الإدارة</span>
                    <ArrowRight size={16} className="rotate-180 group-hover/btn:-translate-x-1 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Back to Portal */}
            <div className="pt-3 text-center">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-black transition-colors hover:underline",
                  dark ? "text-slate-400 hover:text-amber-300" : "text-slate-500 hover:text-[#08467d]"
                )}
              >
                <ArrowRight size={13} />
                <span>العودة إلى بوابة العقيق الرئيسية</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
