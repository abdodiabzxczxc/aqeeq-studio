import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Radio, Volume2, VolumeX, Users, MapPin, ArrowUpRight, GraduationCap } from "lucide-react";

interface LeadPing {
  id: string;
  name: string;
  grade: string;
  city: string;
  x: number; // percentage on radar
  y: number;
  time: string;
  color: string;
}

export function LiveHolographicRadar({ dark = true }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activePings, setActivePings] = useState<LeadPing[]>([
    { id: "1", name: "ريان الحربي", grade: "أول ثانوي", city: "المدينة المنورة", x: 48, y: 42, time: "منذ دقيقتين", color: "#10b981" },
    { id: "2", name: "سارة الشريف", grade: "تمهيدي (KG2)", city: "المدينة المنورة", x: 55, y: 58, time: "منذ 8 دقائق", color: "#f59e0b" },
    { id: "3", name: "فيصل المطيري", grade: "رابع ابتدائي", city: "الرياض", x: 72, y: 35, time: "منذ 15 دقيقة", color: "#3b82f6" },
  ]);

  const [selectedPing, setSelectedPing] = useState<LeadPing | null>(activePings[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark glowing background
      ctx.fillStyle = dark ? "rgba(10, 15, 24, 0.95)" : "rgba(240, 244, 250, 0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Radar Rings
      [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
        ctx.strokeStyle = dark ? `rgba(248, 202, 20, ${0.1 + ratio * 0.15})` : `rgba(8, 70, 125, ${0.15 + ratio * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 3. Crosshairs
      ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.stroke();

      // 4. Radar Sweep Beam (360 deg)
      angle += 0.025;
      const sweepGrad = ctx.createConicGradient(angle, cx, cy);
      sweepGrad.addColorStop(0, dark ? "rgba(248, 202, 20, 0.35)" : "rgba(8, 70, 125, 0.3)");
      sweepGrad.addColorStop(0.12, "transparent");
      sweepGrad.addColorStop(1, "transparent");

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // 5. Draw Active Pings
      activePings.forEach((ping) => {
        const px = (ping.x / 100) * w;
        const py = (ping.y / 100) * h;

        // Outer beacon wave
        const now = Date.now() * 0.003;
        const waveR = 4 + (Math.sin(now + parseInt(ping.id)) + 1) * 6;

        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, waveR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing dot
        ctx.fillStyle = ping.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dark, activePings]);

  return (
    <div
      className={`rounded-3xl border p-6 shadow-2xl relative overflow-hidden transition-all ${
        dark
          ? "bg-[#0b0f19] border-white/10 text-white shadow-black/40"
          : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest text-[#f8ca14]">رادار القيادة الحي (HOLOGRAPHIC RADAR)</span>
          </div>
          <h3 className="text-xl font-black mt-1">نبضات القبول والزوار لحظياً</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition ${
              soundEnabled
                ? "bg-amber-400/15 border-amber-400 text-amber-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title={soundEnabled ? "كتم صوت النبضات" : "تشغيل صوت النبضات"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio size={13} className="animate-pulse" /> متصل بالقمر الصناعي
          </span>
        </div>
      </div>

      {/* Grid: Radar Canvas + Live Stream Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-center">
        {/* Radar Graphic View */}
        <div className="relative flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="w-full max-w-[360px] aspect-square rounded-full shadow-inner"
          />

          {/* Compass labels */}
          <span className="absolute top-2 font-mono text-[10px] text-slate-500 font-bold">شمال N</span>
          <span className="absolute bottom-2 font-mono text-[10px] text-slate-500 font-bold">جنوب S</span>
          <span className="absolute left-2 font-mono text-[10px] text-slate-500 font-bold">غرب W</span>
          <span className="absolute right-2 font-mono text-[10px] text-slate-500 font-bold">شرق E</span>
        </div>

        {/* Real-Time Leads Feed */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} /> آخر نبضات التسجيل الملتقطة
          </h4>

          <div className="space-y-2">
            {activePings.map((ping) => {
              const isSelected = selectedPing?.id === ping.id;
              return (
                <div
                  key={ping.id}
                  onClick={() => setSelectedPing(ping)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? dark
                        ? "bg-[#f8ca14]/10 border-[#f8ca14]/40"
                        : "bg-[#08467d]/10 border-[#08467d]/40"
                      : dark
                      ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.07]"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: ping.color }} />
                      {ping.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{ping.time}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} /> {ping.grade}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ping.city}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Card for Selected Lead */}
          {selectedPing && (
            <div
              className={`mt-4 p-4 rounded-2xl border ${
                dark ? "bg-black/30 border-white/10" : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">إجراء فوري للطالب</span>
                <span className="text-[11px] font-bold text-emerald-400">جاهز للتواصل</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إرسال كشف الرسوم الإلكتروني المخصص لمرحلة {selectedPing.grade} عبر واتساب مباشرة.
              </p>
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`أهلاً بك ولي أمر الطالب ${selectedPing.name}، يسعدنا تواصلك مع مدارس العقيق بخصوص التسجيل في ${selectedPing.grade}.`)}`, "_blank");
                }}
                className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition flex items-center justify-center gap-2"
              >
                <span>مراسلة ولي الأمر الآن 💬</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
