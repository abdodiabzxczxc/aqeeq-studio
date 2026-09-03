import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Camera, ArrowUpLeft } from "lucide-react";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useLocation } from "wouter";

interface MemoryEntry {
  id: string;
  title: string;
  label: string;
  imageUrl: string | null;
  onOpen: () => void;
}

interface AqeeqMemoryWallSectionProps {
  dark: boolean;
  isNationalDay: boolean;
  memoryEntries: MemoryEntry[];
}

export function AqeeqMemoryWallSection({
  dark,
  isNationalDay,
  memoryEntries,
}: AqeeqMemoryWallSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Multi-speed Anti-Gravity Parallax Physics
  // Column 0 moves downward smoothly
  const rawCol0 = useTransform(scrollYProgress, [0, 1], [55, -55]);
  // Column 1 (Center) moves UPWARD in Counter-Gravity!
  const rawCol1 = useTransform(scrollYProgress, [0, 1], [-75, 75]);
  // Column 2 moves downward with an offset cadence
  const rawCol2 = useTransform(scrollYProgress, [0, 1], [85, -45]);

  const col0Y = useSpring(rawCol0, { stiffness: 75, damping: 20 });
  const col1Y = useSpring(rawCol1, { stiffness: 75, damping: 20 });
  const col2Y = useSpring(rawCol2, { stiffness: 75, damping: 20 });

  return (
    <VisualEditable
      id="studio-memory-section"
      tag="section"
      label="قسم ذاكرة العقيق"
      as="section"
      className={"border-b py-16 md:py-24 " + (
        isNationalDay
          ? dark ? "border-[#f8ca14]/8 snd-section-dark" : "border-[#005A36]/8 snd-section-light"
          : dark ? "border-white/[0.05] bg-transparent" : "border-black/[0.04] bg-transparent"
      )}
    >
      <div ref={sectionRef} className="mx-auto max-w-[1340px] px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-center">
          <div className="text-right">
            <div className="mb-2">
              <VisualEditable
                id="studio-memory-kicker"
                tag="text"
                label="شارة ذاكرة العقيق"
                defaultText={isNationalDay ? "🇸🇦 أرشيف ذاكرة الوطن" : "VISUAL MEMORY · SPOTLIGHT"}
                as="span"
                className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase mb-3 " + (
                  isNationalDay
                    ? "snd-kicker-badge border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                    : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                )}
              >
                {(text) => (
                  <>
                    <Camera size={12} />
                    {text}
                  </>
                )}
              </VisualEditable>
            </div>
            <VisualEditable
              id="studio-memory-title"
              tag="text"
              label="عنوان قسم ذاكرة العقيق"
              defaultText="ذاكرة العقيق الحية"
              as="h2"
              className={"text-2xl sm:text-4xl lg:text-5xl font-black font-cairo " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 140 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-1 rounded-full mt-3 mb-2 ${dark ? "bg-gradient-to-l from-[#f8ca14] to-transparent" : "bg-gradient-to-l from-[#08467d] to-transparent"}`}
            />
            <VisualEditable
              id="studio-memory-body"
              tag="text"
              label="وصف ذاكرة العقيق"
              defaultText="كل عدد يوثّق قصة، وكل ألبوم يحفظ لحظة. لقطات حقيقية من أرشيف مدارس العقيق المتجدد بتدفق بصري حر."
              as="p"
              className={"mt-2 max-w-md text-xs sm:text-sm leading-relaxed " + (dark ? "text-slate-400" : isNationalDay ? "text-emerald-900/80" : "text-slate-600")}
            />
            <VisualEditable
              id="studio-memory-action"
              tag="button"
              label="زر استكشاف الأرشيف"
              defaultText="استكشف الأرشيف الكامل"
              as="button"
              onAction={() => navigate("/journal")}
              className={"mt-6 inline-flex items-center gap-2 border-b-2 pb-1.5 text-sm font-black transition active:scale-95 " + (
                dark ? "border-[#f8ca14] text-[#f8ca14] hover:opacity-80" : isNationalDay ? "border-[#005A36] text-[#005A36] hover:opacity-80" : "border-[#08467d] text-[#08467d] hover:opacity-80"
              )}
            >
              {(text) => (
                <>
                  {text} <ArrowUpLeft size={16} />
                </>
              )}
            </VisualEditable>
          </div>

          {/* 3-Column Anti-Gravity Parallax Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center">
            {memoryEntries.map((entry, index) => {
              const ySpring = index === 0 ? col0Y : index === 1 ? col1Y : col2Y;
              return (
                <motion.div
                  key={entry.id}
                  style={{ y: ySpring }}
                  className="will-change-transform"
                >
                  <VisualEditable
                    id={"studio-memory-" + entry.id}
                    tag="section"
                    label={"بطاقة ذاكرة " + entry.title}
                    as="button"
                    onAction={entry.onOpen}
                    className={"group relative w-full overflow-hidden rounded-[1.8rem] sm:rounded-[2.2rem] border text-right transition duration-500 hover:-translate-y-2 shadow-2xl " + (
                      index === 1 ? "h-[300px] sm:h-[420px] mt-4" : "h-[240px] sm:h-[340px]"
                    ) + " " + (
                      dark
                        ? "border-white/[0.12] bg-[#10121a] shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:border-[#f8ca14]/70 hover:shadow-[0_0_50px_rgba(248,202,20,0.25)]"
                        : isNationalDay
                        ? "border-emerald-500/20 bg-white shadow-[0_20px_40px_rgba(0,90,54,0.1)] hover:border-[#005A36]/60"
                        : "border-slate-200 bg-white shadow-[0_20px_40px_rgba(8,70,125,0.08)] hover:border-[#08467d]/60 hover:shadow-[0_0_45px_rgba(8,70,125,0.15)]"
                    )}
                  >
                    <VisualImage
                      id={"studio-memory-" + entry.id + "-image"}
                      label={"صورة بطاقة ذاكرة " + entry.title}
                      src={entry.imageUrl || "/og-preview.png"}
                      alt={entry.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-right z-10">
                      <span className="text-[10px] font-black tracking-wider text-[#f8ca14] block mb-1">
                        {entry.label}
                      </span>
                      <h4 className="text-xs sm:text-base font-black text-white line-clamp-2 leading-snug drop-shadow-md font-cairo">
                        {entry.title}
                      </h4>
                    </div>
                  </VisualEditable>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualEditable>
  );
}
