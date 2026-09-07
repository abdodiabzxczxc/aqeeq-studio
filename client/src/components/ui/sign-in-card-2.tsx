import React, { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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

  // 3D Tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, { username, password, rememberMe });
  };

  const beamColor = dark
    ? "from-transparent via-amber-300 to-transparent"
    : "from-transparent via-[#08467d] to-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md relative z-10 p-2 sm:p-4"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative group">
          {/* Card glow backdrop */}
          <motion.div
            className={cn(
              "absolute -inset-[2px] rounded-[2.2rem] transition-opacity duration-700 pointer-events-none",
              dark
                ? "opacity-40 group-hover:opacity-80 bg-gradient-to-r from-amber-500/20 via-[#08467d]/30 to-amber-500/20 blur-xl"
                : "opacity-30 group-hover:opacity-70 bg-gradient-to-r from-[#08467d]/15 via-amber-500/20 to-[#08467d]/15 blur-xl"
            )}
          />

          {/* Travelling light beam effect around the border */}
          <div className="absolute -inset-[1px] rounded-[2rem] overflow-hidden pointer-events-none z-20">
            {/* Top light beam */}
            <motion.div
              className={cn("absolute top-0 left-0 h-[2.5px] w-[50%] bg-gradient-to-r opacity-70", beamColor)}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
              }}
              transition={{
                left: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 },
                opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror" },
              }}
            />

            {/* Right light beam */}
            <motion.div
              className={cn("absolute top-0 right-0 h-[50%] w-[2.5px] bg-gradient-to-b opacity-70", beamColor)}
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
              }}
              transition={{
                top: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 0.75 },
                opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.75 },
              }}
            />

            {/* Bottom light beam */}
            <motion.div
              className={cn("absolute bottom-0 right-0 h-[2.5px] w-[50%] bg-gradient-to-r opacity-70", beamColor)}
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
              }}
              transition={{
                right: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 1.5 },
                opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.5 },
              }}
            />

            {/* Left light beam */}
            <motion.div
              className={cn("absolute bottom-0 left-0 h-[50%] w-[2.5px] bg-gradient-to-b opacity-70", beamColor)}
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
              }}
              transition={{
                bottom: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, delay: 2.25 },
                opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 2.25 },
              }}
            />

            {/* Corner ambient jewel pins */}
            <div className={cn("absolute top-1 right-1 h-1.5 w-1.5 rounded-full blur-[1px]", dark ? "bg-amber-300/60" : "bg-[#08467d]/60")} />
            <div className={cn("absolute top-1 left-1 h-1.5 w-1.5 rounded-full blur-[1px]", dark ? "bg-amber-300/60" : "bg-[#08467d]/60")} />
            <div className={cn("absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full blur-[1px]", dark ? "bg-amber-300/60" : "bg-[#08467d]/60")} />
            <div className={cn("absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full blur-[1px]", dark ? "bg-amber-300/60" : "bg-[#08467d]/60")} />
          </div>

          {/* Main Card Surface */}
          <div
            className={cn(
              "relative rounded-[2rem] p-7 sm:p-9 border shadow-2xl transition-colors duration-500 overflow-hidden",
              dark
                ? "bg-[#070b12]/85 backdrop-blur-2xl border-white/15 text-slate-100 shadow-black/80"
                : "bg-white/92 backdrop-blur-2xl border-slate-200 text-slate-900 shadow-slate-300/60"
            )}
          >
            {/* Subtle inner grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(135deg, ${dark ? "#fff" : "#000"} 0.5px, transparent 0.5px), linear-gradient(45deg, ${dark ? "#fff" : "#000"} 0.5px, transparent 0.5px)`,
                backgroundSize: "28px 28px",
              }}
            />

            {/* Card Header & Branding */}
            <div className="text-center relative z-10 mb-7">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.7 }}
                className={cn(
                  "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center p-2.5 mb-4 shadow-xl border relative overflow-hidden",
                  dark
                    ? "bg-[#0d1522] border-amber-300/30 shadow-amber-500/10"
                    : "bg-slate-50 border-slate-200 shadow-slate-200"
                )}
              >
                <img
                  src="/alaqeeq-logo.png"
                  alt="مدارس العقيق"
                  className={cn("w-full h-full object-contain drop-shadow-md", dark ? "brightness-110" : "")}
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-tr from-amber-400/15 via-transparent to-transparent opacity-80 pointer-events-none"
                  )}
                />
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-2 border backdrop-blur-md shadow-xs bg-amber-400/10 border-amber-400/25 text-amber-500 dark:text-amber-300">
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
                  "text-xs mt-1.5 leading-relaxed",
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
                <motion.div
                  className={cn(
                    "relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden",
                    dark
                      ? focusedInput === "username"
                        ? "border-amber-300/70 ring-2 ring-amber-400/20 bg-[#0d1420]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                      : focusedInput === "username"
                      ? "border-[#08467d] ring-2 ring-[#08467d]/20 bg-white"
                      : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                  )}
                  whileFocus={{ scale: 1.01 }}
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
                </motion.div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className={cn(
                      "block text-xs font-black",
                      dark ? "text-slate-300" : "text-slate-700"
                    )}
                  >
                    كلمة المرور
                  </label>
                </div>
                <motion.div
                  className={cn(
                    "relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden",
                    dark
                      ? focusedInput === "password"
                        ? "border-amber-300/70 ring-2 ring-amber-400/20 bg-[#0d1420]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                      : focusedInput === "password"
                      ? "border-[#08467d] ring-2 ring-[#08467d]/20 bg-white"
                      : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                  )}
                  whileFocus={{ scale: 1.01 }}
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
                </motion.div>
              </div>

              {/* Remember me & Security Note */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative flex items-center">
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
                  </div>
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
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full relative group/btn mt-4 h-12 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center overflow-hidden shadow-lg",
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
              </motion.button>

              {/* Back to Portal */}
              <div className="pt-4 text-center">
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
    </motion.div>
  );
}
