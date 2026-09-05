import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { Edit3, Pin, X, ExternalLink, Sparkles } from "lucide-react";

export interface HoverPreviewState {
  visible: boolean;
  imageUrl?: string | null;
  title?: string;
  badge?: string;
  itemId?: string;
  targetUrl?: string;
  forceHide?: boolean;
  onEdit?: () => void;
  isFrozen?: boolean;
}

let setGlobalHover: ((state: HoverPreviewState) => void) | null = null;

export function triggerCursorPreview(state: HoverPreviewState) {
  if (setGlobalHover) {
    setGlobalHover(state);
  }
}

const CARD_W = 260; // px — preview card width
const CARD_H = 220; // px — approximate preview card height
const OFFSET = 20;  // distance from cursor

/**
 * AqeeqCursorHoverPreview — Smart Positioning Wellington-Style Cursor Preview
 * يدعم التثبيت التلقائي (Auto-Freeze FX) والتعديل المباشر (Inline Edit)
 * محمي من اعتراض نقرات المحرر عبر [data-no-visual-edit] و [data-interactive-fx]
 */
export function AqeeqCursorHoverPreview() {
  const [preview, setPreview] = useState<HoverPreviewState>({ visible: false });
  const [isFrozen, setIsFrozen] = useState(false);
  const [isMouseOverCard, setIsMouseOverCard] = useState(false);
  const mousePos = useRef({ x: -500, y: -500 });

  const springConfig = { damping: 18, stiffness: 180, mass: 0.3 };
  const cursorX = useSpring(-500, springConfig);
  const cursorY = useSpring(-500, springConfig);

  useEffect(() => {
    setGlobalHover = (incoming: HoverPreviewState) => {
      if (incoming.forceHide) {
        setIsFrozen(false);
        setIsMouseOverCard(false);
        setPreview({ visible: false });
        return;
      }

      setPreview((prev) => {
        // If already frozen or mouse is currently over card, reject automatic hide
        if ((isFrozen || isMouseOverCard) && !incoming.visible) {
          return prev;
        }

        // Automatic freeze if incoming.isFrozen is true
        if (incoming.isFrozen !== undefined) {
          setIsFrozen(incoming.isFrozen);
        }

        return {
          ...incoming,
          // Retain onEdit callback if not explicitly provided in hide event
          onEdit: incoming.onEdit || prev.onEdit,
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Do not shift card if frozen or when user is interacting with card
      if (isFrozen || isMouseOverCard) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mx = e.clientX;
      const my = e.clientY;

      mousePos.current = { x: mx, y: my };

      // Smart X: if cursor is in right half → card goes LEFT of cursor
      const goLeft = mx > vw * 0.55;
      const targetX = goLeft
        ? mx - CARD_W - OFFSET
        : mx + OFFSET;

      // Smart Y: if cursor is near bottom → card goes UP
      const goUp = my > vh * 0.65;
      const targetY = goUp
        ? my - CARD_H - OFFSET
        : my - 40;

      cursorX.set(targetX);
      cursorY.set(targetY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      setGlobalHover = null;
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY, isFrozen, isMouseOverCard]);

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFrozen(false);
    setIsMouseOverCard(false);
    setPreview({ visible: false });
  };

  const handleToggleFreeze = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFrozen((prev) => !prev);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview.onEdit) {
      preview.onEdit();
    }
  };

  return (
    <AnimatePresence>
      {preview.visible && preview.imageUrl && (
        <motion.div
          key="cursor-preview"
          data-no-visual-edit="true"
          data-interactive-fx="true"
          data-hover-preview="true"
          style={{ x: cursorX, y: cursorY }}
          initial={{ opacity: 0, scale: 0.75, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 z-[9999] hidden lg:block pointer-events-none"
        >
          <div
            data-no-visual-edit="true"
            data-interactive-fx="true"
            data-hover-preview="true"
            onMouseEnter={() => setIsMouseOverCard(true)}
            onMouseLeave={() => {
              setIsMouseOverCard(false);
              if (!isFrozen) {
                setPreview({ visible: false });
              }
            }}
            onClick={preview.onEdit ? handleCardClick : undefined}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-300 ${
              preview.onEdit ? "cursor-pointer" : ""
            } ${
              isFrozen
                ? "ring-2 ring-[#f8ca14] shadow-[0_0_35px_rgba(248,202,20,0.45)]"
                : preview.onEdit
                ? "ring-2 ring-[#f8ca14]/80 shadow-[0_0_25px_rgba(248,202,20,0.3)]"
                : ""
            }`}
            style={{ width: CARD_W }}
            dir="rtl"
          >
            {/* If in edit mode: Top Banner prompting click to edit */}
            {preview.onEdit && (
              <div
                data-no-visual-edit="true"
                className="bg-[#f8ca14] px-3 py-1.5 text-black flex items-center justify-between text-[11px] font-black border-b border-black/15 shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Edit3 size={13} />
                  <span>انقر للتعديل المباشر ✏️</span>
                </span>
                <span className="bg-black text-[#f8ca14] px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                  {isFrozen ? "مثبت تلقائياً ❄️" : "عنصر تفاعلي ⚡"}
                </span>
              </div>
            )}

            {/* Top Interactive Controls Bar */}
            <div
              data-no-visual-edit="true"
              className="absolute top-8 inset-x-2 z-30 flex items-center justify-between gap-1 pointer-events-auto"
            >
              <div className="flex items-center gap-1.5">
                {/* Freeze Status Button */}
                <button
                  type="button"
                  data-no-visual-edit="true"
                  onClick={handleToggleFreeze}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black shadow-md backdrop-blur-md transition cursor-pointer ${
                    isFrozen
                      ? "bg-[#08467d] text-white hover:bg-[#063560]"
                      : "bg-black/75 text-[#f8ca14] border border-[#f8ca14]/40 hover:bg-black"
                  }`}
                  title={isFrozen ? "إلغاء التثبيت" : "تثبيت البطاقة على الشاشة"}
                >
                  <Pin size={11} className={isFrozen ? "rotate-45" : ""} />
                  <span>{isFrozen ? "مثبت 📌" : "تثبيت ❄️"}</span>
                </button>

                {/* Edit Button */}
                {preview.onEdit && (
                  <button
                    type="button"
                    data-no-visual-edit="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      preview.onEdit?.();
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-black/80 hover:bg-black text-[#f8ca14] border border-[#f8ca14]/50 px-2 py-0.5 text-[10px] font-black shadow-md transition cursor-pointer"
                    title="تعديل هذا العنصر التفاعلي"
                  >
                    <Edit3 size={11} />
                    <span>تعديل</span>
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                data-no-visual-edit="true"
                onClick={handleClose}
                className="rounded-lg bg-black/80 hover:bg-[#de191e] text-white p-1 shadow-md transition cursor-pointer"
                title="إغلاق المعاينة"
              >
                <X size={12} />
              </button>
            </div>

            {/* Image */}
            <div className="relative h-36 w-full overflow-hidden">
              <motion.img
                src={preview.imageUrl}
                alt={preview.title || "Preview"}
                className="h-full w-full object-cover"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Badge */}
              {preview.badge && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="absolute bottom-2 right-2 rounded-full bg-black/70 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14] backdrop-blur-md"
                >
                  {preview.badge}
                </motion.div>
              )}
            </div>

            {/* Footer / Title */}
            {preview.title && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/95 px-3 py-2.5 border-t border-white/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-right text-[11px] font-black text-white line-clamp-2 leading-relaxed flex-1">
                    {preview.title}
                  </p>
                  {preview.targetUrl && (
                    <span
                      data-no-visual-edit="true"
                      className="text-slate-400 p-1"
                    >
                      <ExternalLink size={12} />
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Shimmer border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/[0.12]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
