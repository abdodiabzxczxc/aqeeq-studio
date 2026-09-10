import { Palette, RotateCcw, X, Sun, Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Tokens = {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorGreen: string;
  fontBody: string;
  fontHeading: string;
};

const DEFAULT_TOKENS: Tokens = {
  colorPrimary: "#085187",
  colorSecondary: "#ab1d22",
  colorAccent: "#d9bd26",
  colorGreen: "#155439",
  fontBody: "Cairo",
  fontHeading: "Cairo",
};

const OCCASION_THEMES: { id: string; label: string; emoji: string; tokens: Tokens }[] = [
  {
    id: "alaqeeq",
    label: "هوية العقيق",
    emoji: "🏫",
    tokens: { colorPrimary: "#085187", colorSecondary: "#ab1d22", colorAccent: "#d9bd26", colorGreen: "#155439", fontBody: "Cairo", fontHeading: "Cairo" },
  },
  {
    id: "ramadan",
    label: "رمضان كريم",
    emoji: "🌙",
    tokens: { colorPrimary: "#1a0a3d", colorSecondary: "#8b6914", colorAccent: "#f0c040", colorGreen: "#1a3d2a", fontBody: "Cairo", fontHeading: "Cairo" },
  },
  {
    id: "national",
    label: "اليوم الوطني",
    emoji: "🇸🇦",
    tokens: { colorPrimary: "#006c35", colorSecondary: "#006c35", colorAccent: "#ffffff", colorGreen: "#004d26", fontBody: "Cairo", fontHeading: "Cairo" },
  },
  {
    id: "newYear",
    label: "العام الدراسي",
    emoji: "🎒",
    tokens: { colorPrimary: "#1e3a5f", colorSecondary: "#c0392b", colorAccent: "#f39c12", colorGreen: "#27ae60", fontBody: "Cairo", fontHeading: "Cairo" },
  },
  {
    id: "graduation",
    label: "التخرج",
    emoji: "🎓",
    tokens: { colorPrimary: "#2c1654", colorSecondary: "#b8860b", colorAccent: "#ffd700", colorGreen: "#1a472a", fontBody: "Cairo", fontHeading: "Cairo" },
  },
  {
    id: "dark",
    label: "الليلي الداكن",
    emoji: "🌑",
    tokens: { colorPrimary: "#0d0d0d", colorSecondary: "#1a1a2e", colorAccent: "#e94560", colorGreen: "#16213e", fontBody: "Cairo", fontHeading: "Cairo" },
  },
];

const FONTS = ["Cairo", "Tajawal", "Almarai", "IBM Plex Arabic", "Noto Kufi Arabic", "Scheherazade New"];

const STORAGE_KEY = "alaqeeq-design-tokens";

function applyTokens(tokens: Tokens) {
  const root = document.documentElement;
  root.style.setProperty("--aq-primary", tokens.colorPrimary);
  root.style.setProperty("--aq-secondary", tokens.colorSecondary);
  root.style.setProperty("--aq-accent", tokens.colorAccent);
  root.style.setProperty("--aq-green", tokens.colorGreen);
}

export default function VisualDesignTokensPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tokens, setTokens] = useState<Tokens>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_TOKENS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_TOKENS;
  });
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  useEffect(() => {
    applyTokens(tokens);
  }, [tokens]);

  function update(patch: Partial<Tokens>) {
    setTokens((t) => {
      const next = { ...t, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setActiveTheme(null);
  }

  function applyTheme(theme: (typeof OCCASION_THEMES)[0]) {
    setTokens(theme.tokens);
    setActiveTheme(theme.id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(theme.tokens)); } catch {}
    applyTokens(theme.tokens);
    toast.success(`✓ تم تطبيق ثيم "${theme.label}"`);
  }

  function reset() {
    setTokens(DEFAULT_TOKENS);
    setActiveTheme("alaqeeq");
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOKENS)); } catch {}
    applyTokens(DEFAULT_TOKENS);
    toast.message("تمت استعادة هوية العقيق الأصلية");
  }

  if (!open) return null;

  return (
    <aside
      data-aq-editor-panel="design-tokens"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-x-0 bottom-0 z-[340] flex h-[76svh] flex-col rounded-t-[1.75rem] border-t border-amber-400/25 bg-[#080808]/[0.98] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[min(400px,100vw)] md:rounded-none md:border-r"
      dir="rtl"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 pb-4 pt-5">
        <div>
          <div className="text-[10px] font-black tracking-widest text-amber-300">التصميم العام</div>
          <h2 className="mt-0.5 text-base font-black text-white">هوية الموقع والألوان</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">تغيير شامل لألوان وخطوط الموقع</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={reset} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-amber-300" title="استعادة الأصل">
            <RotateCcw size={16} />
          </button>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-5">

        {/* Live Preview Strip */}
        <div
          className="rounded-2xl p-4 text-center text-sm font-black transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${tokens.colorPrimary}, ${tokens.colorSecondary})`, color: tokens.colorAccent }}
        >
          <div style={{ fontFamily: tokens.fontHeading }} className="text-lg">مدرسة العقيق</div>
          <div style={{ fontFamily: tokens.fontBody, color: "#fff", fontSize: "0.75rem", marginTop: "0.25rem", opacity: 0.85 }}>معاينة حية للهوية البصرية</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: tokens.colorPrimary }} />
            <span className="h-3 w-3 rounded-full" style={{ background: tokens.colorSecondary }} />
            <span className="h-3 w-3 rounded-full" style={{ background: tokens.colorAccent }} />
            <span className="h-3 w-3 rounded-full" style={{ background: tokens.colorGreen }} />
          </div>
        </div>

        {/* Occasion Themes */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black text-amber-300">
            <Sparkles size={13} />
            ثيمات المناسبات
          </div>
          <div className="grid grid-cols-3 gap-2">
            {OCCASION_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => applyTheme(theme)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center text-[10px] font-black transition duration-200 ${
                  activeTheme === theme.id
                    ? "border-amber-400/60 bg-amber-400/10 text-amber-200"
                    : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-amber-400/30 hover:text-white"
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ background: `linear-gradient(135deg, ${theme.tokens.colorPrimary}, ${theme.tokens.colorSecondary})` }}
                />
                <span>{theme.emoji} {theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div>
          <div className="mb-3 text-[11px] font-black text-slate-300">الألوان المخصصة</div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "colorPrimary" as const, label: "اللون الرئيسي", hint: "الخلفيات والعناوين" },
              { key: "colorSecondary" as const, label: "اللون الثانوي", hint: "الأزرار والتمييز" },
              { key: "colorAccent" as const, label: "لون التأكيد", hint: "الذهبي والبارز" },
              { key: "colorGreen" as const, label: "اللون الأخضر", hint: "الحالة والتأكيد" },
            ]).map(({ key, label, hint }) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400">{label}</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
                  <input
                    type="color"
                    value={tokens[key]}
                    onChange={(e) => update({ [key]: e.target.value })}
                    className="h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-slate-200">{tokens[key].toUpperCase()}</div>
                    <div className="text-[9px] text-slate-600">{hint}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Font Pickers */}
        <div>
          <div className="mb-3 text-[11px] font-black text-slate-300">الخطوط</div>
          <div className="space-y-2">
            {([
              { key: "fontHeading" as const, label: "خط العناوين" },
              { key: "fontBody" as const, label: "خط النصوص" },
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-[11px] font-black text-slate-400">{label}</span>
                <select
                  value={tokens[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/60 px-3 py-2 text-[11px] font-bold text-white outline-none focus:border-amber-400/60"
                  style={{ fontFamily: tokens[key] }}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
