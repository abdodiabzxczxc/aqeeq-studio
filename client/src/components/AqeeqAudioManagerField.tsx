import { AQEEQ_AUDIO_PRESETS, AudioPreset } from "@/lib/aqeeqAudioPresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Music2, Pause, Play, Trash2, Upload, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = trpc.visualEditor.media.upload.useMutation({
    onSuccess: (result) => {
      setIsUploading(false);
      onChange(result.url);
      toast.success("تم رفع المقطع الصوتي بنجاح");
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

  const selectPreset = (preset: AudioPreset) => {
    onChange(preset.url);
    if (audioRef.current) {
      audioRef.current.src = preset.url;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    toast.success(`تم اختيار "${preset.title}"`);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Music2 size={18} className="text-amber-400" />
          <Label className={`text-xs font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>{label}</Label>
        </div>
        {value ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200 transition hover:bg-amber-300 hover:text-black"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "إيقاف المعاينة" : "استماع"}</span>
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="grid h-7 w-7 place-items-center rounded-lg border border-rose-300/30 text-rose-300 transition hover:bg-rose-500/20"
              title="إزالة المقطع الصوتي"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Preset tracks selector */}
      <div className="mt-3 space-y-2">
        <p className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>مكتبة نغمات العقيق الملكية (جاهزة للاستخدام):</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AQEEQ_AUDIO_PRESETS.map((preset) => {
            const isSelected = value === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-right transition ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40"
                    : dark
                      ? "border-white/10 bg-black/20 text-slate-300 hover:border-white/20 hover:bg-black/30"
                      : "border-slate-900/10 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate text-xs font-black">{preset.title}</p>
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

      {/* Direct Upload or Custom URL */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`text-xs font-black ${dark ? "border-white/15 bg-black/30 text-amber-200 hover:bg-black/50" : "border-slate-300 bg-white text-slate-800"}`}
          >
            {isUploading ? <Loader2 size={14} className="ml-1.5 animate-spin" /> : <Upload size={14} className="ml-1.5" />}
            <span>رفع ملف MP3 من جهازك</span>
          </Button>

          <span className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"}`}>أو ضع رابطاً صوتياً:</span>
        </div>

        <div className="mt-2 flex gap-2">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="https://example.com/soundtrack.mp3"
            dir="ltr"
            className={`text-xs font-mono ${dark ? "border-white/10 bg-black/40 text-white" : "border-slate-300 bg-white text-black"}`}
          />
        </div>
      </div>
    </div>
  );
}
