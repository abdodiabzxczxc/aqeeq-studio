import { AQEEQ_AUDIO_PRESETS, AudioPreset, getAqeeqDefaultBackgroundAudio, setAqeeqDefaultBackgroundAudio } from "@/lib/aqeeqAudioPresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Check, Cloud, Loader2, Music2, Pause, Play, Sparkles, Star, Trash2, Upload, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  dark?: boolean;
  label?: string;
};

export function AqeeqAudioManagerField({ value, onChange, dark = true, label = "الموسيقى والخلفية الصوتية" }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"uploaded" | "presets" | "upload">("uploaded");
  const [defaultAudio, setDefaultAudio] = useState<string | null>(() => getAqeeqDefaultBackgroundAudio());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const utils = trpc.useUtils();
  const mediaListQuery = trpc.visualEditor.media.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const uploadedAudioList = (mediaListQuery.data || []).filter(
    (item) => item.kind === "audio" || (item.mimeType && item.mimeType.startsWith("audio/"))
  );

  const uploadMutation = trpc.visualEditor.media.upload.useMutation({
    onSuccess: (result) => {
      setIsUploading(false);
      onChange(result.url);
      void utils.visualEditor.media.list.invalidate();
      toast.success("تم رفع وحفظ المقطع الصوتي في سحابة الموقع");
      if (audioRef.current) {
        audioRef.current.src = result.url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    },
    onError: (err) => {
      setIsUploading(false);
      toast.error(err.message || "تعذر رفع الملف الصوتي");
    },
  });

  const togglePreview = () => {
    if (!value) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(value);
      audioRef.current.volume = volume;
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (audioRef.current.src !== value) {
      audioRef.current.src = value;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/") && !file.name.endsWith(".mp3") && !file.name.endsWith(".wav") && !file.name.endsWith(".m4a")) {
      toast.error("يرجى اختيار ملف صوتي بصيغة MP3 أو WAV أو M4A");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("الحد الأقصى لحجم الملف الصوتي هو 25 ميجابايت");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      uploadMutation.mutate({
        fileName: file.name,
        mimeType: file.type || "audio/mpeg",
        base64: String(reader.result),
        altText: file.name.replace(/\.[^.]+$/, ""),
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("فشل قراءة الملف الصوتي");
    };
    reader.readAsDataURL(file);
  };

  const selectAudio = (url: string, title?: string) => {
    onChange(url);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    toast.success(`تم اختيار: ${title || "المقطع الصوتي"}`);
  };

  const handleSetAsDefault = () => {
    if (!value) return;
    setAqeeqDefaultBackgroundAudio(value);
    setDefaultAudio(value);
    toast.success("⭐ تم تعيين هذا المقطع كالموسيقى الافتراضية لكل الألبومات والمجلات الجديدة");
  };

  const clearAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onChange(null);
    toast.message("تم إلغاء الموسيقى الخلفية");
  };

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${
      dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-slate-50"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Music2 size={18} className="text-amber-400" />
          <Label className={`text-xs font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>{label}</Label>
        </div>
        {value ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetAsDefault}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold transition ${
                defaultAudio === value
                  ? "border-amber-400 bg-amber-400 text-black font-black"
                  : "border-amber-300/40 bg-amber-300/10 text-amber-200 hover:bg-amber-300 hover:text-black"
              }`}
              title="تعيين كموسيقى افتراضية لكل الألبومات والمجلات الجديدة"
            >
              <Star size={13} className={defaultAudio === value ? "fill-black" : ""} />
              <span>{defaultAudio === value ? "الموسيقى الافتراضية ⭐" : "تعيين كافتراضية"}</span>
            </button>
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200 transition hover:bg-amber-300 hover:text-black"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "إيقاف" : "استماع"}</span>
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="grid h-7 w-7 place-items-center rounded-lg border border-rose-300/30 text-rose-300 transition hover:bg-rose-500/20"
              title="إلغاء المقطع الصوتي"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1.5 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("uploaded")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "uploaded"
              ? "bg-amber-400 text-slate-950 font-black shadow-sm"
              : dark
                ? "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Cloud size={14} />
          <span>مرفوعاتك السابقة ({uploadedAudioList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "presets"
              ? "bg-amber-400 text-slate-950 font-black shadow-sm"
              : dark
                ? "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles size={14} />
          <span>مقطوعات العقيق الملكية</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "upload"
              ? "bg-amber-400 text-slate-950 font-black shadow-sm"
              : dark
                ? "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Upload size={14} />
          <span>رفع مقطع جديد</span>
        </button>
      </div>

      {/* Tab 1: Uploaded Audio Library (Previous uploads) */}
      {activeTab === "uploaded" ? (
        <div className="mt-3 space-y-2">
          {uploadedAudioList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
              <Music2 size={24} className="mx-auto text-amber-400/60" />
              <p className={`mt-2 text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                لم تقم برفع مقاطع صوتية بعد
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs font-black text-amber-300 border-amber-400/30"
              >
                <Upload size={13} className="ml-1.5" />
                رفع أول مقطع صوتي
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
              {uploadedAudioList.map((item) => {
                const isSelected = value === item.url;
                const isDefault = defaultAudio === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectAudio(item.url, item.fileName)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-right transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40"
                        : dark
                          ? "border-white/10 bg-black/20 text-slate-300 hover:border-white/20 hover:bg-black/30"
                          : "border-slate-900/10 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-black">{item.fileName}</p>
                        {isDefault ? <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" /> : null}
                      </div>
                      <p className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        مرفوع على الموقع · {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : "صوت"}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-950">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <Music2 size={14} className="shrink-0 text-slate-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 2: Built-in Royal Presets */}
      {activeTab === "presets" ? (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AQEEQ_AUDIO_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              const isDefault = defaultAudio === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectAudio(preset.url, preset.title)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-right transition ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40"
                      : dark
                        ? "border-white/10 bg-black/20 text-slate-300 hover:border-white/20 hover:bg-black/30"
                        : "border-slate-900/10 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-black">{preset.title}</p>
                      {isDefault ? <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" /> : null}
                    </div>
                    <p className={`truncate text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>{preset.subtitle}</p>
                  </div>
                  {isSelected ? (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-950">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <Music2 size={14} className="shrink-0 text-slate-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Tab 3: Upload from Device or URL */}
      {activeTab === "upload" ? (
        <div className="mt-3 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-amber-400/40 bg-amber-400/[.03] p-5 text-center transition hover:bg-amber-400/[.08]"
          >
            {isUploading ? (
              <Loader2 size={24} className="animate-spin text-amber-400" />
            ) : (
              <Upload size={24} className="text-amber-400" />
            )}
            <span className="mt-2 text-xs font-black text-amber-100">
              {isUploading ? "جارٍ الرفع والحفظ في السحابة…" : "اضغط لاختيار ملف MP3 أو WAV من جهازك"}
            </span>
            <span className="mt-0.5 text-[10px] text-slate-500">
              سيتم حفظ الملف في سحابة الموقع لاستخدامه في أي وقت لاحقاً
            </span>
          </button>

          <div>
            <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>أو ضع رابط ملف صوتي مباشر:</span>
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              placeholder="https://example.com/soundtrack.mp3"
              dir="ltr"
              className={`mt-1 text-xs font-mono ${dark ? "border-white/10 bg-black/40 text-white" : "border-slate-300 bg-white text-black"}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
