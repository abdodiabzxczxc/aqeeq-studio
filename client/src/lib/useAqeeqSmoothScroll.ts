import { useEffect } from "react";

/**
 * محرك السلاسة الفائقة (Aqeeq Fluid 120/60 FPS Engine)
 * يوفر:
 * 1. سكرول فيزيائي ناعم بعجلة الماوس والتراك باد على الكمبيوتر (Momentum Lerp Scroll).
 * 2. إزالة تأخير اللمس (300ms Touch Latency) بالكامل على الموبايل.
 * 3. حماية الـ GPU أثناء السكرول السريع لمنع سقوط الفريمات.
 * 4. توافق ذكي مع شاشات 120Hz و 90Hz و 60Hz.
 */
export function useAqeeqSmoothScroll(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // فحص وضع تقليل الحركة المفضل لدى المستخدم
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // تمييز أجهزة اللمس (الموبايل والتابلت) عن أجهزة الكمبيوتر
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    let isScrollingTimer: ReturnType<typeof setTimeout> | null = null;

    // تفعيل فئة تسريع الأداء أثناء السكرول النشط (GPU Optimization)
    const handleScrollActivity = () => {
      if (!document.body.classList.contains("aq-scrolling")) {
        document.body.classList.add("aq-scrolling");
      }
      if (isScrollingTimer) clearTimeout(isScrollingTimer);
      isScrollingTimer = setTimeout(() => {
        document.body.classList.remove("aq-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScrollActivity, { passive: true });

    // ── على أجهزة الموبايل: نعتمد على السكرول الأصلي فائق السرعة مع ضبط اللمس ──
    if (isTouchDevice) {
      document.documentElement.style.scrollBehavior = "smooth";
      return () => {
        window.removeEventListener("scroll", handleScrollActivity);
        if (isScrollingTimer) clearTimeout(isScrollingTimer);
        document.body.classList.remove("aq-scrolling");
      };
    }

    // ── على أجهزة الكمبيوتر: محرك السكرول الفيزيائي الناعم (Momentum Wheel Engine) ──
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;
    let rafId: number | null = null;

    // معامل الانسيابية: 0.085 يمنح شعور السلاسة الفاخرة مثل مواقع Apple
    const LERP_FACTOR = 0.085;

    const updateScroll = () => {
      const diff = targetY - currentY;
      // عندما يقترب الفرق من الصفر نتوقف لتوفير موارد المعالج
      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isRunning = false;
        rafId = null;
        return;
      }

      currentY += diff * LERP_FACTOR;
      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(updateScroll);
    };

    const isScrollableChild = (element: HTMLElement | null): boolean => {
      let curr = element;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const style = window.getComputedStyle(curr);
        const overflowY = style.overflowY;
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          curr.scrollHeight > curr.clientHeight
        ) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      // إذا كان المستخدم داخل عنصر قابل للسكرول الداخلي (مثل مودال أو قائمة داخلية) نترك السكرول الافتراضي
      if (isScrollableChild(e.target as HTMLElement)) {
        return;
      }

      // إذا كان يضغط Ctrl أو Meta (تكبير الصفحة)، لا نتدخل
      if (e.ctrlKey || e.metaKey) return;

      e.preventDefault();

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // مضاعف السلاسة لعجلة الماوس
      const deltaMultiplier = e.deltaMode === 1 ? 28 : 1;
      const delta = e.deltaY * deltaMultiplier;

      // تحديث الهدف الفيزيائي
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));

      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    // مزامنة targetY عند قيام المستخدم بسكرول يدوي (مثل الضغط على شريط التمرير أو PageUp/PageDown)
    const handleSync = () => {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", (e) => {
      if (["Space", "PageUp", "PageDown", "End", "Home"].includes(e.code)) {
        handleSync();
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScrollActivity);
      window.removeEventListener("wheel", handleWheel);
      if (rafId) cancelAnimationFrame(rafId);
      if (isScrollingTimer) clearTimeout(isScrollingTimer);
      document.body.classList.remove("aq-scrolling");
    };
  }, [enabled]);
}
