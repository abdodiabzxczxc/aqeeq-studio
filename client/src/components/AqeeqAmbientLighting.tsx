import React from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";

interface AqeeqAmbientLightingProps {
  className?: string;
}

/**
 * AqeeqAmbientLighting
 * محرك إضاءة محيطية سينمائية عالمية فائقة الفخامة:
 * - انسياب طبيعي 100% بدون أي حواف، قص، أو فواصل خطية
 * - تنفس حي وهادئ للأضواء عبر GPU Acceleration (صفر Repaint)
 * - استجابة ذكية وحية للثيمات:
 *   1. الوضع الداكن الرسمي (أزرق ملكي ياقوتي + ذهبي كوني + عقيق أحمر خافت)
 *   2. الوضع الفاتح الرسمي (أبيض نقي صافٍ + ضباب ياقوتي ناعم + إشراقة صباحية ذهبية خفيفة)
 *   3. الوضع الداكن لليوم الوطني (زمرد سعودي ملكي + ذهب برّاق + أخضر الراية)
 *   4. الوضع الفاتح لليوم الوطني (أبيض لؤلؤي + نسيم زمردي منعش + توهج ذهبي خفيف)
 */
export function AqeeqAmbientLighting({ className = "" }: AqeeqAmbientLightingProps) {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    >
      {/* ── الطبقة 1: التدرجات الكونية العريضة الممتدة (Multi-Stop Ambient Field) ── */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: isNationalDay
            ? dark
              ? `
                radial-gradient(ellipse 90% 55% at 50% -10%, rgba(0, 90, 54, 0.48) 0%, transparent 72%),
                radial-gradient(ellipse 70% 50% at 88% 20%, rgba(212, 175, 55, 0.22) 0%, transparent 65%),
                radial-gradient(ellipse 75% 55% at 12% 75%, rgba(90, 186, 28, 0.18) 0%, transparent 65%),
                radial-gradient(ellipse 80% 50% at 50% 110%, rgba(0, 90, 54, 0.40) 0%, transparent 70%)
              `
              : `
                radial-gradient(ellipse 90% 55% at 50% -10%, rgba(0, 90, 54, 0.09) 0%, transparent 72%),
                radial-gradient(ellipse 70% 50% at 88% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 65%),
                radial-gradient(ellipse 75% 55% at 12% 75%, rgba(90, 186, 28, 0.06) 0%, transparent 65%),
                radial-gradient(ellipse 80% 50% at 50% 110%, rgba(0, 90, 54, 0.07) 0%, transparent 70%)
              `
            : dark
            ? `
              radial-gradient(ellipse 90% 55% at 28% -10%, rgba(8, 70, 125, 0.42) 0%, transparent 72%),
              radial-gradient(ellipse 70% 50% at 85% 25%, rgba(248, 202, 20, 0.20) 0%, transparent 65%),
              radial-gradient(ellipse 60% 45% at 12% 70%, rgba(222, 25, 30, 0.12) 0%, transparent 65%),
              radial-gradient(ellipse 65% 50% at 88% 85%, rgba(14, 165, 233, 0.18) 0%, transparent 70%),
              radial-gradient(ellipse 80% 50% at 50% 110%, rgba(8, 70, 125, 0.35) 0%, transparent 70%)
            `
            : `
              radial-gradient(ellipse 90% 55% at 28% -10%, rgba(8, 70, 125, 0.09) 0%, transparent 72%),
              radial-gradient(ellipse 70% 50% at 85% 25%, rgba(248, 202, 20, 0.09) 0%, transparent 65%),
              radial-gradient(ellipse 60% 45% at 12% 70%, rgba(222, 25, 30, 0.035) 0%, transparent 65%),
              radial-gradient(ellipse 65% 50% at 88% 85%, rgba(14, 165, 233, 0.06) 0%, transparent 70%),
              radial-gradient(ellipse 80% 50% at 50% 110%, rgba(8, 70, 125, 0.07) 0%, transparent 70%)
            `,
        }}
      />

      {/* ── الطبقة 2: كرات الضوء الدائرية الحية العريضة (Breathing Soft Orbs - Zero Hard Edges) ── */}
      {/* Orb 1: الهالة العلوية الرئيسية */}
      <div
        className="aq-aura-orb-1 absolute -top-[12%] -left-[10%] w-[520px] h-[520px] sm:w-[750px] sm:h-[750px] rounded-full blur-[140px] sm:blur-[180px] pointer-events-none"
        style={{
          background: isNationalDay
            ? dark
              ? "radial-gradient(circle, rgba(0, 90, 54, 0.50) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0, 90, 54, 0.09) 0%, transparent 70%)"
            : dark
            ? "radial-gradient(circle, rgba(8, 70, 125, 0.45) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(8, 70, 125, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Orb 2: الهالة الذهبية الجانبية */}
      <div
        className="aq-aura-orb-2 absolute top-[28%] -right-[12%] w-[480px] h-[480px] sm:w-[680px] sm:h-[680px] rounded-full blur-[140px] sm:blur-[180px] pointer-events-none"
        style={{
          background: isNationalDay
            ? dark
              ? "radial-gradient(circle, rgba(212, 175, 55, 0.26) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(212, 175, 55, 0.09) 0%, transparent 70%)"
            : dark
            ? "radial-gradient(circle, rgba(248, 202, 20, 0.22) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(248, 202, 20, 0.09) 0%, transparent 70%)",
        }}
      />

      {/* Orb 3: الهالة السفلية الحية */}
      <div
        className="aq-aura-orb-3 absolute -bottom-[15%] left-[25%] w-[550px] h-[550px] sm:w-[800px] sm:h-[800px] rounded-full blur-[150px] sm:blur-[200px] pointer-events-none"
        style={{
          background: isNationalDay
            ? dark
              ? "radial-gradient(circle, rgba(90, 186, 28, 0.22) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(90, 186, 28, 0.07) 0%, transparent 70%)"
            : dark
            ? "radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(56, 189, 248, 0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── الطبقة 3: نجوم ذهبية عائمة لليوم الوطني ── */}
      {isNationalDay && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {[
            { char: "★", left: "5%", dur: "9s", delay: "0s", size: "12px" },
            { char: "☆", left: "18%", dur: "13s", delay: "2s", size: "9px" },
            { char: "★", left: "32%", dur: "11s", delay: "4.5s", size: "15px" },
            { char: "☆", left: "48%", dur: "8s", delay: "1s", size: "10px" },
            { char: "★", left: "63%", dur: "14s", delay: "3s", size: "8px" },
            { char: "☆", left: "77%", dur: "10s", delay: "6s", size: "13px" },
            { char: "★", left: "91%", dur: "12s", delay: "0.5s", size: "11px" },
          ].map((p, i) => (
            <span
              key={i}
              className="aq-star"
              style={{
                left: p.left,
                animationDuration: p.dur,
                animationDelay: p.delay,
                fontSize: p.size,
              }}
            >
              {p.char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
