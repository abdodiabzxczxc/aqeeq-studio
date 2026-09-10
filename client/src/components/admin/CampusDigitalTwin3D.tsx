import React, { useEffect, useRef, useState } from "react";
import { Layers, Sparkles, Building2, Eye, Compass, Sun, Moon, Maximize2, Users, Trophy, Clapperboard, ArrowUpRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CampusBuilding {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  studentsCount: number;
  supervisor: string;
  recentEvent: string;
  color: string;
  x: number; // grid position
  z: number;
  w: number;
  h: number;
  d: number;
}

export function CampusDigitalTwin3D({ dark = true }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "night" | "blueprint">("night");
  const [rotAngle, setRotAngle] = useState(0.75); // camera rotation angle

  const buildings: CampusBuilding[] = [
    {
      id: "boys",
      name: "مجمع البنين الأكاديمي",
      category: "المراحل المتوسطة والثانوية",
      description: "صرح تعليمي متكامل يضم 36 قاعة دراسية مجهزة، 4 مختبرات علمية، ومكتبة رقمية حديثة.",
      capacity: 850,
      studentsCount: 720,
      supervisor: "أ. عبدالرحمن القحطاني",
      recentEvent: "معرض الابتكار العلمي السنوي",
      color: "#3b82f6",
      x: -40,
      z: -20,
      w: 36,
      h: 28,
      d: 24,
    },
    {
      id: "girls",
      name: "مجمع البنات ورياض الأطفال",
      category: "التمهيدي، الابتدائي، والثانوي",
      description: "مبنى نموذجي مخصص لمدارس البنات وروضة العقيق العالمية، بحدائق داخلية وملاعب مغلقة.",
      capacity: 900,
      studentsCount: 785,
      supervisor: "د. هدى الشريف",
      recentEvent: "احتفالية يوم التأسيس والتراث",
      color: "#ec4899",
      x: 40,
      z: -20,
      w: 38,
      h: 26,
      d: 24,
    },
    {
      id: "theater",
      name: "المسرح المدرسي الملكي",
      category: "الاحتفالات والمؤتمرات الكبرى",
      description: "مسرح فندقي يتسع لأكثر من 600 مقعد، مجهز بأحدث أنظمة الصوت والشاشات السينمائية الرقمية.",
      capacity: 650,
      studentsCount: 650,
      supervisor: "إدارة الفعاليات والتطوير",
      recentEvent: "حفل تخريج الدفعة الـ 18",
      color: "#eab308",
      x: 0,
      z: -45,
      w: 28,
      h: 20,
      d: 22,
    },
    {
      id: "sports",
      name: "المجمع الرياضي والمسبح الأولمبي",
      category: "اللياقة البدنية والأنشطة الرياضية",
      description: "مسبح نصف أولمبي مغطى بنظام تدفئة، صالة متعددة الأغراض لكرة السلة والطائرة، وملعب عشب صناعي.",
      capacity: 400,
      studentsCount: 320,
      supervisor: "ك. وليد الصاعدي",
      recentEvent: "بطولة العقيق للسباحة المدرسية",
      color: "#10b981",
      x: -45,
      z: 35,
      w: 32,
      h: 16,
      d: 30,
    },
    {
      id: "stem",
      name: "واحة الابتكار والروبوتيكس",
      category: "الذكاء الاصطناعي والبرمجة",
      description: "معامل الذكاء الاصطناعي والروبوت، طابعات ثلاثية الأبعاد، واستوديو إنتاج الميديا المدرسية.",
      capacity: 250,
      studentsCount: 210,
      supervisor: "م. ماجد الحربي",
      recentEvent: "تصفيات تحدي الروبوت الوطني",
      color: "#06b6d4",
      x: 35,
      z: 35,
      w: 26,
      h: 22,
      d: 24,
    },
  ];

  // Set default selected building
  useEffect(() => {
    if (!selectedBuilding) {
      setSelectedBuilding(buildings[0]);
    }
  }, []);

  // 3D Isometric Rendering Engine via Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + 30;

      ctx.clearRect(0, 0, w, h);

      // Background Sky
      if (viewMode === "night") {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, "#070a12");
        bgGrad.addColorStop(1, "#111827");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (viewMode === "day") {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, "#e0f2fe");
        bgGrad.addColorStop(1, "#f8fafc");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Blueprint mode
        ctx.fillStyle = "#0c1b33";
        ctx.fillRect(0, 0, w, h);
      }

      // Isometric Projection Helper
      const cosA = Math.cos(rotAngle);
      const sinA = Math.sin(rotAngle);

      const project = (x: number, y: number, z: number) => {
        const rx = x * cosA - z * sinA;
        const rz = x * sinA + z * cosA;
        const isoX = cx + rx * 2.2;
        const isoY = cy + rz * 1.1 - y * 1.8;
        return { x: isoX, y: isoY, depth: rz };
      };

      // 1. Campus Ground Grid
      const gridSize = 110;
      ctx.lineWidth = 1;
      ctx.strokeStyle =
        viewMode === "night"
          ? "rgba(248, 202, 20, 0.08)"
          : viewMode === "blueprint"
          ? "rgba(56, 189, 248, 0.25)"
          : "rgba(0, 0, 0, 0.06)";

      for (let g = -gridSize; g <= gridSize; g += 22) {
        const p1 = project(-gridSize, 0, g);
        const p2 = project(gridSize, 0, g);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(g, 0, -gridSize);
        const p4 = project(g, 0, gridSize);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // 2. Central Courtyard / Plaza
      const plazaR = 24;
      const pl1 = project(-plazaR, 0, -plazaR);
      const pl2 = project(plazaR, 0, -plazaR);
      const pl3 = project(plazaR, 0, plazaR);
      const pl4 = project(-plazaR, 0, plazaR);

      ctx.fillStyle = viewMode === "night" ? "rgba(248, 202, 20, 0.06)" : "rgba(8, 70, 125, 0.08)";
      ctx.beginPath();
      ctx.moveTo(pl1.x, pl1.y);
      ctx.lineTo(pl2.x, pl2.y);
      ctx.lineTo(pl3.x, pl3.y);
      ctx.lineTo(pl4.x, pl4.y);
      ctx.closePath();
      ctx.fill();

      // Sort buildings by depth (Painter's algorithm)
      const sorted = [...buildings].sort((a, b) => {
        const depthA = a.x * sinA + a.z * cosA;
        const depthB = b.x * sinA + b.z * cosA;
        return depthA - depthB;
      });

      // 3. Draw 3D Buildings
      sorted.forEach((b) => {
        const isSelected = selectedBuilding?.id === b.id;
        const hw = b.w / 2;
        const hd = b.d / 2;
        const h = b.h;

        // 8 vertices of bounding cuboid
        const v = [
          project(b.x - hw, 0, b.z - hd), // 0: bottom-back-left
          project(b.x + hw, 0, b.z - hd), // 1: bottom-back-right
          project(b.x + hw, 0, b.z + hd), // 2: bottom-front-right
          project(b.x - hw, 0, b.z + hd), // 3: bottom-front-left
          project(b.x - hw, h, b.z - hd), // 4: top-back-left
          project(b.x + hw, h, b.z - hd), // 5: top-back-right
          project(b.x + hw, h, b.z + hd), // 6: top-front-right
          project(b.x - hw, h, b.z + hd), // 7: top-front-left
        ];

        // Draw shadow on ground
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        ctx.lineTo(v[1].x, v[1].y);
        ctx.lineTo(v[2].x, v[2].y);
        ctx.lineTo(v[3].x, v[3].y);
        ctx.closePath();
        ctx.fill();

        // Facets styles
        let frontColor = b.color;
        let sideColor = b.color;
        let topColor = b.color;

        if (viewMode === "night") {
          frontColor = isSelected ? "#ffd700" : b.color;
          sideColor = isSelected ? "#cca000" : "#1e293b";
          topColor = isSelected ? "#fff275" : "#334155";
        } else if (viewMode === "day") {
          frontColor = isSelected ? "#3b82f6" : "#cbd5e1";
          sideColor = isSelected ? "#2563eb" : "#94a3b8";
          topColor = isSelected ? "#60a5fa" : "#e2e8f0";
        } else {
          // Blueprint
          frontColor = "rgba(14, 165, 233, 0.35)";
          sideColor = "rgba(14, 165, 233, 0.2)";
          topColor = "rgba(56, 189, 248, 0.5)";
        }

        // Left/Front Face (v3 -> v2 -> v6 -> v7)
        ctx.fillStyle = frontColor;
        ctx.beginPath();
        ctx.moveTo(v[3].x, v[3].y);
        ctx.lineTo(v[2].x, v[2].y);
        ctx.lineTo(v[6].x, v[6].y);
        ctx.lineTo(v[7].x, v[7].y);
        ctx.closePath();
        ctx.fill();

        // Right/Side Face (v2 -> v1 -> v5 -> v6)
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(v[2].x, v[2].y);
        ctx.lineTo(v[1].x, v[1].y);
        ctx.lineTo(v[5].x, v[5].y);
        ctx.lineTo(v[6].x, v[6].y);
        ctx.closePath();
        ctx.fill();

        // Top Roof Face (v7 -> v6 -> v5 -> v4)
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(v[7].x, v[7].y);
        ctx.lineTo(v[6].x, v[6].y);
        ctx.lineTo(v[5].x, v[5].y);
        ctx.lineTo(v[4].x, v[4].y);
        ctx.closePath();
        ctx.fill();

        // Edges outline
        ctx.strokeStyle = isSelected ? "#ffffff" : viewMode === "blueprint" ? "#38bdf8" : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.beginPath();
        [
          [3, 2], [2, 1], [1, 0], [0, 3],
          [7, 6], [6, 5], [5, 4], [4, 7],
          [3, 7], [2, 6], [1, 5], [0, 4]
        ].forEach(([p1, p2]) => {
          ctx.moveTo(v[p1].x, v[p1].y);
          ctx.lineTo(v[p2].x, v[p2].y);
        });
        ctx.stroke();

        // Floating Title Beacon Pin above building
        const topCenter = project(b.x, b.h + 8, b.z);
        ctx.fillStyle = isSelected ? "#ffd700" : "#ffffff";
        ctx.beginPath();
        ctx.arc(topCenter.x, topCenter.y, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Building Label Tag
        ctx.font = isSelected ? "bold 12px Cairo, sans-serif" : "bold 10px Cairo, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = isSelected ? "#ffd700" : "rgba(255, 255, 255, 0.85)";
        ctx.fillText(b.name, topCenter.x, topCenter.y - 8);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rotAngle, viewMode, selectedBuilding]);

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
            <Sparkles size={18} className="text-[#f8ca14]" />
            <span className="text-xs font-black tracking-widest text-[#f8ca14]">التوأم الرقمي ثلاثي الأبعاد (3D DIGITAL TWIN)</span>
          </div>
          <h3 className="text-xl font-black mt-1">مركز قيادة صروح مدارس العقيق التفاعلي</h3>
        </div>

        {/* View mode buttons & rotation controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRotAngle((a) => a - 0.25)}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold transition"
            title="تدوير الكاميرا يميناً"
          >
            ↻ تدوير
          </button>

          <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
            <button
              onClick={() => setViewMode("night")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${viewMode === "night" ? "bg-amber-400 text-black" : "text-slate-400"}`}
              title="الوضع الليلي المتوهج"
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${viewMode === "day" ? "bg-amber-400 text-black" : "text-slate-400"}`}
              title="الوضع النهاري"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setViewMode("blueprint")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${viewMode === "blueprint" ? "bg-amber-400 text-black" : "text-slate-400"}`}
              title="المخطط الهندسي"
            >
              <Compass size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 3D Canvas + Building Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-center">
        {/* 3D Canvas Viewport */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={620}
            height={380}
            className="w-full h-auto max-h-[380px] object-cover cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startRot = rotAngle;
              const onMove = (me: MouseEvent) => {
                setRotAngle(startRot + (me.clientX - startX) * 0.01);
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />

          {/* Canvas Floating Quick Switcher */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuilding(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  selectedBuilding?.id === b.id
                    ? "bg-[#f8ca14] text-black shadow-lg scale-105"
                    : "bg-black/60 backdrop-blur-md text-white border border-white/10 hover:border-amber-400/50"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Building Detail Inspector */}
        {selectedBuilding && (
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              dark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                {selectedBuilding.category}
              </span>
              <h4 className="text-lg font-black text-white mt-0.5">{selectedBuilding.name}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedBuilding.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">الطاقة الاستيعابية</span>
                <span className="text-base font-black text-white mt-1 block">
                  {selectedBuilding.studentsCount} / {selectedBuilding.capacity} طالب
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">المشرف المسؤول</span>
                <span className="text-xs font-black text-amber-300 mt-1 block truncate">
                  {selectedBuilding.supervisor}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Clapperboard size={12} /> آخر فعالية موثقة في هذا الصرح
              </span>
              <span className="text-xs font-bold text-white mt-1 block">
                {selectedBuilding.recentEvent}
              </span>
            </div>

            <button
              onClick={() => {
                toast.success(`تم فتح استوديو إدارة ${selectedBuilding.name} والتعديل الفوري!`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black text-xs transition flex items-center justify-center gap-2"
            >
              <span>تعديل بيانات ومرافق الصرح 🏛️</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
