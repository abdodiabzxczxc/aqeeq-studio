import {
  AQEEQ_AUDIO_PRESETS,
  getAqeeqDefaultBackgroundAudio,
  setAqeeqDefaultBackgroundAudio,
  parseGoogleDriveAudioUrl,
} from "@/lib/aqeeqAudioPresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Check,
  Cloud,
  FolderDown,
  Headphones,
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  dark?: boolean;
  label?: string;
};

export function AqeeqAudioManagerField({
  value,
  onChange,
  dark = true,
  label = "الموسيقى والخلفية الصوتية",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"atheer" | "uploaded" | "drive" | "presets" | "upload">("atheer");
  const [defaultAudio, setDefaultAudio] = useState<string | null>(() => getAqeeqDefaultBackgroundAudio());
  const [driveInputUrl, setDriveInputUrl] = useState("");
  const [atheerSearch, setAtheerSearch] = useState("");
  const [atheerCategory, setAtheerCategory] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const utils = trpc.useUtils();
  const mediaListQuery = trpc.visualEditor.media.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const orchestrationQuery = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const podcastsQuery = trpc.podcasts.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const uploadedAudioList = (mediaListQuery.data || []).filter(
    (item) => item.kind === "audio" || (item.mimeType && item.mimeType.startsWith("audio/"))
  );

  const schoolSongs = useMemo(() => {
    const raw = (orchestrationQuery.data as any)?.schoolSongs;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s: any, idx: number) => ({
        id: s.id || `atheer-song-${idx}`,
        title: s.title || "نشيد العقيق",
        artist: s.artist || "مدارس العقيق الأهلية",
        category: s.category || "النشيد المدرسي",
        mediaUrl: s.mediaUrl || "",
        coverUrl: s.coverUrl || "",
        kind: "song" as const,
      }));
    }
    return [];
  }, [orchestrationQuery.data]);

  const podcastAudioTracks = useMemo(() => {
    const raw = podcastsQuery.data || [];
    return raw
      .filter((p) => p.mediaType === "audio" && Boolean(p.mediaUrl))
      .map((p) => ({
        id: `podcast-${p.id}`,
        title: p.title,
        artist: p.hostName || "استوديو أثير العقيق 🎙️",
        category: p.category || "بودكاست أثير",
        mediaUrl: p.mediaUrl,
        coverUrl: p.coverUrl || p.thumbnailUrl || "",
        kind: "podcast" as const,
      }));
  }, [podcastsQuery.data]);

  const allAtheerTracks = useMemo(() => {
    return [...schoolSongs, ...podcastAudioTracks];
  }, [schoolSongs, podcastAudioTracks]);

  const atheerCategories = useMemo(() => {
    const set = new Set<string>();
    allAtheerTracks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ["all", ...Array.from(set)];
  }, [allAtheerTracks]);

  const filteredAtheerTracks = useMemo(() => {
    return allAtheerTracks.filter((track) => {
      if (atheerCategory !== "all" && track.category !== atheerCategory) return false;
      if (!atheerSearch.trim()) return true;
      const q = atheerSearch.trim().toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.category.toLowerCase().includes(q)
      );
    });
  }, [allAtheerTracks, atheerCategory, atheerSearch]);

  const matchedTrackInfo = useMemo(() => {
    if (!value) return null;
    const cleanVal = value.trim();

    // 1. Check Atheer tracks
    const atheerMatch = allAtheerTracks.find((t) => {
      if (!t.mediaUrl) return false;
      const cleanUrl = t.mediaUrl.trim();
      if (cleanVal === cleanUrl) return true;
      const id1 = cleanVal.match(/\/api\/drive-audio-proxy\/([a-zA-Z0-9_-]+)/)?.[1];
      const id2 =
        cleanUrl.match(/\/api\/drive-audio-proxy\/([a-zA-Z0-9_-]+)/)?.[1] ||
        cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      return Boolean(id1 && id2 && id1 === id2);
    });
    if (atheerMatch) return { ...atheerMatch, sourceBadge: "أثير العقيق 🎙️" };

    // 2. Check uploaded tracks
    const uploadedMatch = uploadedAudioList.find((u) => u.url === cleanVal);
    if (uploadedMatch)
      return {
        title: uploadedMatch.fileName,
        artist: "مرفوعاتك",
        sourceBadge: "سحابة الموقع ☁️",
        mediaUrl: uploadedMatch.url,
      };

    // 3. Check presets
    const presetMatch = AQEEQ_AUDIO_PRESETS.find((p) => p.url === cleanVal);
    if (presetMatch)
      return {
        title: presetMatch.title,
        artist: presetMatch.subtitle,
        sourceBadge: "نغمات ملكية ✨",
        mediaUrl: presetMatch.url,
      };

    // 4. Fallback Google Drive
    if (cleanVal.includes("/api/drive-audio-proxy/")) {
      return { title: "مقطع من Google Drive", artist: "بث صوتي مباشر", sourceBadge: "Google Drive 📁", mediaUrl: cleanVal };
    }

    return { title: "مقطع صوتي", artist: "رابط مباشر", sourceBadge: "رابط صوتي 🔗", mediaUrl: cleanVal };
  }, [value, allAtheerTracks, uploadedAudioList]);

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

  const deleteMutation = trpc.visualEditor.media.delete.useMutation({
    onSuccess: () => {
      void utils.visualEditor.media.list.invalidate();
      toast.success("تم حذف الملف الصوتي من السحابة بنجاح");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حذف الملف الصوتي");
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

  const previewSingleAudio = (url: string) => {
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.onended = () => setIsPlaying(false);
    }
    const currentSrc = audioRef.current.src || "";
    if (!currentSrc.includes(url) && !url.includes(currentSrc)) {
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.type.startsWith("audio/") &&
      !file.name.endsWith(".mp3") &&
      !file.name.endsWith(".wav") &&
      !file.name.endsWith(".m4a")
    ) {
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
    toast.success(`تم اختيار «${title || "المقطع الصوتي"}» كخلفية صوتية بنجاح 🎵`);
  };

  const handleImportDriveAudio = () => {
    if (!driveInputUrl.trim()) {
      toast.error("يرجى إدخال رابط ملف Google Drive أولاً");
      return;
    }
    const proxyUrl = parseGoogleDriveAudioUrl(driveInputUrl);
    if (!proxyUrl) {
      toast.error("تعذر استخراج معرّف الملف من رابط Google Drive. تأكد أن الرابط عام وصحيح");
      return;
    }
    onChange(proxyUrl);
    if (audioRef.current) {
      audioRef.current.src = proxyUrl;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    toast.success("✅ تم ربط وتشغيل مقطع Google Drive بنجاح (بث مباشر دون استهلاك مساحة الموقع)");
  };

  const handleDeleteUploadedFile = (id: number, fileName: string, fileUrl: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الملف الصوتي "${fileName}" من السحابة؟`)) {
      if (audioRef.current && audioRef.current.src === fileUrl) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      if (value === fileUrl) {
        onChange(null);
      }
      if (defaultAudio === fileUrl) {
        setAqeeqDefaultBackgroundAudio(null);
        setDefaultAudio(null);
      }
      deleteMutation.mutate({ id });
    }
  };

  const handleSetAsDefault = () => {
    if (!value) return;
    setAqeeqDefaultBackgroundAudio(value);
    setDefaultAudio(value);
    toast.success("⭐ تم تعيين هذا المقطع كالموسيقى الافتراضية لكل الألبومات والمجلات");
  };

  const clearAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onChange(null);
    toast.message("تم إلغاء الموسيقى الخلفية");
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-slate-50"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Music2 size={18} className="text-amber-400" />
          <Label className={`text-xs font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>
            {label}
          </Label>
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
              title="تعيين كموسيقى افتراضية لكل الألبومات والمجلات"
            >
              <Star size={13} className={defaultAudio === value ? "fill-black" : ""} />
              <span>{defaultAudio === value ? "الموسيقى الرئيسية ⭐" : "تعيين كرئيسية"}</span>
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
              className="grid h-7 w-7 place-items-center rounded-lg border border-[#de191e]/30 text-[#de191e] transition hover:bg-[#de191e]/20"
              title="إلغاء المقطع الصوتي"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Active Selected Audio Banner */}
      {value ? (
        <div
          className={`mt-3 flex items-center justify-between gap-3 rounded-xl border p-2.5 transition ${
            dark ? "border-amber-400/30 bg-amber-400/[0.08]" : "border-amber-500/30 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-black text-sm shrink-0 shadow-sm">
              {matchedTrackInfo?.sourceBadge?.includes("أثير") ? "🎙️" : "🎵"}
            </span>
            <div className="min-w-0">
              <p className={`text-xs font-black truncate ${dark ? "text-white" : "text-black"}`}>
                المقطع الفعال: <span className="text-amber-400">«{matchedTrackInfo?.title || "مقطع مخصص"}»</span>
              </p>
              <p className={`text-[10px] truncate ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {matchedTrackInfo ? `${matchedTrackInfo.sourceBadge} · ${matchedTrackInfo.artist || ""}` : "رابط صوتي مباشر"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={togglePreview}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                isPlaying
                  ? "border-amber-400 bg-amber-400 text-black font-black"
                  : dark
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black"
                    : "border-amber-500/40 bg-amber-100 text-amber-900 hover:bg-amber-400 hover:text-black"
              }`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? "إيقاف" : "معاينة"}</span>
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="grid h-7 w-7 place-items-center rounded-lg border border-[#de191e]/30 text-[#de191e] transition hover:bg-[#de191e]/20"
              title="إلغاء المقطع الصوتي (صامت)"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="mt-3 flex flex-wrap gap-1.5 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("atheer")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "atheer"
              ? "bg-amber-400 text-slate-950 font-black shadow-sm"
              : dark
                ? "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Radio size={14} />
          <span>أثير العقيق 🎙️ ({allAtheerTracks.length})</span>
        </button>

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
          <span>مرفوعاتك ({uploadedAudioList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("drive")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "drive"
              ? "bg-amber-400 text-slate-950 font-black shadow-sm"
              : dark
                ? "text-slate-400 hover:text-amber-200 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FolderDown size={14} />
          <span>من Google Drive 📁</span>
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
          <span>نغمات ملكية</span>
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
          <span>رفع ملف جديد</span>
        </button>
      </div>

      {/* Tab 0: Atheer Songs & Anthems */}
      {activeTab === "atheer" ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              <Input
                value={atheerSearch}
                onChange={(e) => setAtheerSearch(e.target.value)}
                placeholder="ابحث في أناشيد وأغاني أثير (مثال: احنا العقيق، حلم، صرح، ضوء...)"
                className={`pr-8 text-xs ${
                  dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-500" : "border-slate-300 bg-white text-black"
                }`}
              />
            </div>

            {atheerCategories.length > 2 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide shrink-0">
                {atheerCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAtheerCategory(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition shrink-0 ${
                      atheerCategory === cat
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : dark
                          ? "bg-white/5 text-slate-300 hover:bg-white/10"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {cat === "all" ? `الكل (${allAtheerTracks.length})` : cat}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {filteredAtheerTracks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
              <Radio size={24} className="mx-auto text-amber-400/60" />
              <p className={`mt-2 text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                لم يتم العثور على أناشيد مطابقة في أثير
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
              {filteredAtheerTracks.map((item) => {
                const cleanVal = value?.trim();
                const cleanUrl = item.mediaUrl.trim();
                const isSelected = Boolean(
                  cleanVal &&
                    (cleanVal === cleanUrl ||
                      (cleanVal.includes("/api/drive-audio-proxy/") &&
                        cleanUrl.includes("/api/drive-audio-proxy/") &&
                        cleanVal.split("?")[0] === cleanUrl.split("?")[0]))
                );
                const isPreviewPlaying = Boolean(
                  isPlaying &&
                    audioRef.current?.src &&
                    (audioRef.current.src === item.mediaUrl || audioRef.current.src.endsWith(item.mediaUrl))
                );

                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40 shadow-sm"
                        : dark
                          ? "border-white/10 bg-black/20 text-slate-300 hover:border-amber-400/40 hover:bg-black/35"
                          : "border-slate-900/10 bg-white text-slate-700 hover:border-amber-400/50"
                    }`}
                  >
                    {/* Play preview on cover */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-sm">
                      <img
                        src={item.coverUrl || (dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg")}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = dark
                            ? "/audio-default-cover-dark.svg"
                            : "/audio-default-cover-light.svg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewSingleAudio(item.mediaUrl);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/45 text-white transition hover:bg-black/60"
                        title={isPreviewPlaying ? "إيقاف المعاينة" : "استماع"}
                      >
                        {isPreviewPlaying ? (
                          <Pause size={13} className="text-amber-400" />
                        ) : (
                          <Play size={13} className="translate-x-[-0.5px]" />
                        )}
                      </button>
                    </div>

                    {/* Title and details */}
                    <button
                      type="button"
                      onClick={() => selectAudio(item.mediaUrl, item.title)}
                      className="min-w-0 flex-1 text-right"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-black">{item.title}</p>
                        {isSelected ? (
                          <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-black shrink-0">
                            مُحدد ✓
                          </span>
                        ) : null}
                      </div>
                      <p className={`mt-0.5 truncate text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {item.artist} · <span className="text-amber-300/80 font-bold">{item.category}</span>
                      </p>
                    </button>

                    {/* Select button */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => selectAudio(item.mediaUrl, item.title)}
                      className={`h-7 px-2 text-[11px] font-black shrink-0 transition ${
                        isSelected
                          ? "bg-amber-400 text-black hover:bg-amber-300"
                          : dark
                            ? "border border-white/15 bg-white/5 text-slate-200 hover:bg-amber-400 hover:text-black"
                            : "border border-slate-300 bg-slate-100 text-slate-700 hover:bg-amber-400 hover:text-black"
                      }`}
                    >
                      {isSelected ? "مُحدد" : "اختيار"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 1: Uploaded Audio Library */}
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto pr-1">
              {uploadedAudioList.map((item) => {
                const isSelected = value === item.url;
                const isDefault = defaultAudio === item.url;
                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between gap-2 rounded-xl border p-2.5 transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/40"
                        : dark
                          ? "border-white/10 bg-black/20 text-slate-300 hover:border-white/20 hover:bg-black/30"
                          : "border-slate-900/10 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectAudio(item.url, item.fileName)}
                      className="min-w-0 flex-1 text-right"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-black">{item.fileName}</p>
                        {isDefault ? <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" /> : null}
                      </div>
                      <p className={`text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        مرفوع على الموقع · {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : "صوت"}
                      </p>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected ? (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-slate-950">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUploadedFile(item.id, item.fileName, item.url);
                        }}
                        disabled={deleteMutation.isPending}
                        className="grid h-6 w-6 place-items-center rounded-lg border border-transparent text-slate-500 transition hover:border-[#de191e]/40 hover:bg-[#de191e]/20 hover:text-[#de191e]"
                        title="حذف هذا الملف نهائياً من السحابة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 2: Google Drive Audio Stream */}
      {activeTab === "drive" ? (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/[.04] p-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-200">
                بث صوتي فائق السرعة عبر Google Drive (صفر مساحة على الموقع)
              </span>
            </div>
            <p className={`mt-1 text-[11px] leading-5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
              انسخ رابط ملف MP3 أو الصوت من حساب Google Drive الخاص بك والصقه هنا. سيتولى الموقع بث المقطع مباشرة للزوار بدون استهلاك مساحة السيرفر.
            </p>
          </div>

          <div>
            <Label className={`text-[11px] font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>
              رابط ملف الصوت في Google Drive:
            </Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={driveInputUrl}
                onChange={(e) => setDriveInputUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                dir="ltr"
                className={`text-xs font-mono ${
                  dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-600" : "border-slate-300 bg-white text-black"
                }`}
              />
              <Button
                type="button"
                onClick={handleImportDriveAudio}
                className="shrink-0 bg-amber-400 px-4 text-xs font-black text-slate-950 hover:bg-amber-300"
              >
                تطبيق وتشغيل 🎵
              </Button>
            </div>
          </div>

          {value && value.includes("/api/drive-audio-proxy/") ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-emerald-200">
                  تم ربط مقطع Google Drive بنجاح وهو فعال الآن
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={togglePreview}
                className="h-7 border-emerald-400/40 text-xs font-black text-emerald-200"
              >
                {isPlaying ? <Pause size={12} className="ml-1" /> : <Play size={12} className="ml-1" />}
                {isPlaying ? "إيقاف" : "معاينة"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Tab 3: Built-in Royal Presets */}
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

      {/* Tab 4: Upload from Device or Direct URL */}
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
            <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
              أو ضع رابط ملف صوتي مباشر:
            </span>
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              placeholder="https://example.com/soundtrack.mp3"
              dir="ltr"
              className={`mt-1 text-xs font-mono ${
                dark ? "border-white/10 bg-black/40 text-white" : "border-slate-300 bg-white text-black"
              }`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
