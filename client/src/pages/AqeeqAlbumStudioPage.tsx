import { useAuth } from "@/_core/hooks/useAuth";
import AlbumPdfImporter from "@/components/AlbumPdfImporter";
import { AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import MediaLibrary from "@/components/MediaLibrary";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
import { AqeeqAudioManagerField } from "@/components/AqeeqAudioManagerField";
import { AiStoryWriterModal } from "@/components/AiStoryWriterModal";
import { getAqeeqDefaultBackgroundAudio } from "@/lib/aqeeqAudioPresets";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  CloudDownload,
  Edit3,
  FilePlus2,
  FileText,
  GripVertical,
  ImageIcon,
  ImagePlus,
  Loader2,
  Music2,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type MediaChoice = { url: string; fileName: string; mimeType?: string | null };
type MediaTarget = "cover" | "headerLogo" | "watermark" | "audio" | null;
type AlbumMode = "spread" | "scroll" | "gallery";
type AlbumPage = { mediaUrl: string; thumbnailUrl: string; fileName: string; mimeType: string; mediaType: "image"; caption: string };
const watermarkPositions = ["center", "top-right", "bottom-left", "bottom-right"] as const;
const today = () => new Date().toISOString().slice(0, 10);

function AlbumMediaReorderCard({
  item,
  index,
  total,
  dark,
  coverUrl,
  onSetCover,
  onEdit,
  onDelete,
  onJump,
  onMoveStep,
}: {
  item: any;
  index: number;
  total: number;
  dark: boolean;
  coverUrl: string | null;
  onSetCover: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onJump: (from: number, to: number) => void;
  onMoveStep: (from: number, dir: -1 | 1) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={String(item.id)}
      dragListener={false}
      dragControls={dragControls}
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
      whileDrag={{
        scale: 1.015,
        zIndex: 50,
        boxShadow: "0 20px 30px -10px rgba(0,0,0,0.45)",
      }}
      className={"group grid gap-3 rounded-2xl border p-3 sm:grid-cols-[auto_140px_1fr_auto] items-center select-none transition-colors duration-150 " + (
        dark
          ? "border-white/[0.08] bg-[#111111] text-white hover:border-[#f8ca14]/40"
          : "border-black/[0.08] bg-slate-50 text-black hover:border-[#08467d]/40"
      )}
      style={{ userSelect: "none" }}
    >
      {/* Drag Handle & Position Jump Badge + Quick 1-Step Buttons */}
      <div className="flex sm:flex-col items-center gap-1.5 justify-center shrink-0">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="p-2 rounded-lg text-slate-400 group-hover:text-amber-400 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing touch-none select-none"
          title="اضغط واسحب لإعادة الترتيب بسلاسة"
        >
          <GripVertical size={18} />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const targetPos = prompt(`الترتيب الحالي: ${index + 1}\nأدخل رقم الترتيب الجديد (من 1 إلى ${total}):`, String(index + 1));
            if (targetPos) {
              const parsed = parseInt(targetPos, 10);
              if (!isNaN(parsed) && parsed >= 1 && parsed <= total) {
                onJump(index, parsed - 1);
              }
            }
          }}
          className={`h-6 w-6 rounded-md text-[10px] font-black flex items-center justify-center border transition-colors shadow-xs cursor-pointer ${
            coverUrl === item.mediaUrl
              ? dark ? "bg-[#f8ca14] text-black border-[#f8ca14]" : "bg-[#08467d] text-white border-[#08467d]"
              : dark ? "bg-white/10 text-slate-300 border-white/10 hover:border-amber-400 hover:text-amber-300" : "bg-white text-slate-700 border-black/10 hover:border-[#08467d] hover:text-[#08467d]"
          }`}
          title="اضغط لتغيير رقم الترتيب مباشرة"
        >
          {index + 1}
        </button>
        <div className="flex sm:flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveStep(index, -1);
            }}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            title="تقديم خطوة للأعلى"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveStep(index, 1);
            }}
            disabled={index === total - 1}
            className="p-1 rounded text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            title="تأخير خطوة للأسفل"
          >
            <ArrowDown size={13} />
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 border border-white/10">
        {item.mediaType === "video" ? (
          <AqeeqVideoPoster
            sourceUrl={item.mediaUrl}
            posterUrl={item.thumbnailUrl}
            title={item.caption || item.fileName}
            playSize="compact"
          />
        ) : (
          <img
            src={getAqeeqAlbumImageSource(item)}
            alt={item.caption || item.fileName}
            className="h-full w-full object-cover pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
        )}
        {coverUrl === item.mediaUrl ? (
          <span className="absolute bottom-1 right-1 rounded bg-[#f8ca14] px-1.5 py-0.5 text-[8px] font-black text-black">
            الغلاف
          </span>
        ) : null}
      </div>

      <div className="min-w-0 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={"rounded-full border px-2 py-0.5 text-[9px] font-black " + (
            coverUrl === item.mediaUrl
              ? (dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]")
              : (dark ? "border-white/15 bg-white/5 text-slate-300" : "border-black/10 bg-white text-slate-700")
          )}>
            {coverUrl === item.mediaUrl ? "غلاف الألبوم" : item.mediaType === "video" ? "فيديو" : "صورة"}
          </span>
        </div>

        <p className={"mt-2 font-black truncate text-sm " + (dark ? "text-white" : "text-black")}>
          {item.caption || item.fileName}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {coverUrl !== item.mediaUrl && item.mediaType === "image" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onSetCover}
              className="h-7 text-[10px] font-bold cursor-pointer"
            >
              تعيين كغلاف
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:flex-col sm:justify-center shrink-0">
        <Button
          size="icon"
          variant="outline"
          onClick={onEdit}
          className={"border cursor-pointer " + (
            dark
              ? "border-[#f8ca14]/30 text-[#f8ca14] hover:bg-[#f8ca14]/10"
              : "border-[#08467d]/25 text-[#08467d] hover:bg-[#08467d]/10"
          )}
          title="تعديل وصف الوسيط"
        >
          <Edit3 size={15} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="text-[#de191e] hover:bg-[#de191e]/10 cursor-pointer"
          title="حذف الملف"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </Reorder.Item>
  );
}

export default function AqeeqAlbumStudioPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: albums = [], isLoading } = trpc.aqeeqAlbums.list.useQuery(undefined, {
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data: album } = trpc.aqeeqAlbums.album.useQuery(
    { slug: selectedSlug || "__none" },
    { enabled: Boolean(selectedSlug), refetchOnWindowFocus: false }
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("ألبوم فعالية العقيق");
  const [newDate, setNewDate] = useState(today());
  const [newDescription, setNewDescription] = useState("");
  const [newDriveUrl, setNewDriveUrl] = useState("");
  const [newReadingMode, setNewReadingMode] = useState<AlbumMode>("spread");
  const [newBackgroundAudioUrl, setNewBackgroundAudioUrl] = useState<string | null>(() => getAqeeqDefaultBackgroundAudio());

  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);
  const [albumMediaLibraryOpen, setAlbumMediaLibraryOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<{ id: number; caption: string } | null>(null);

  const [title, setTitle] = useState("ألبوم فعالية العقيق");
  const [albumDate, setAlbumDate] = useState(today());
  const [description, setDescription] = useState("");
  const [driveFolderUrl, setDriveFolderUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [backgroundAudioUrl, setBackgroundAudioUrl] = useState<string | null>(null);
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [watermarkScale, setWatermarkScale] = useState(42);
  const [watermarkOpacity, setWatermarkOpacity] = useState(12);
  const [watermarkPosition, setWatermarkPosition] = useState<(typeof watermarkPositions)[number]>("center");
  const [watermarkTint, setWatermarkTint] = useState("#f8ca14");
  const [readingMode, setReadingMode] = useState<AlbumMode>("spread");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const refresh = () => {
    void utils.aqeeqAlbums.list.invalidate();
    void utils.aqeeqAlbums.album.invalidate();
    void utils.aqeeqAlbums.publicList.invalidate();
  };

  useEffect(() => {
    const requested = new URLSearchParams(location.split("?")[1] || "").get("album");
    if (requested && requested !== selectedSlug) {
      setSelectedSlug(requested);
    } else if (!requested && albums.length > 0 && !selectedSlug) {
      setSelectedSlug(albums[0].slug);
    }
  }, [location, selectedSlug, albums]);

  useEffect(() => {
    if (!selectedSlug) return;
    const requested = new URLSearchParams(location.split("?")[1] || "").get("album");
    if (requested !== selectedSlug) navigate("/albums/manage?album=" + selectedSlug, { replace: true });
  }, [location, navigate, selectedSlug]);

  useEffect(() => {
    if (!album) return;
    setTitle(album.title);
    setAlbumDate(album.albumDate);
    setDescription(album.description || "");
    setDriveFolderUrl(album.driveFolderUrl || "");
    setCoverUrl(album.coverUrl || null);
    setHeaderLogoUrl(album.headerLogoUrl || null);
    setBackgroundAudioUrl(album.backgroundAudioUrl || null);
    setWatermarkUrl(album.watermarkUrl || null);
    setWatermarkScale(album.watermarkScale ?? 42);
    setWatermarkOpacity(album.watermarkOpacity ?? 12);
    setWatermarkPosition((album.watermarkPosition || "center") as (typeof watermarkPositions)[number]);
    setWatermarkTint(album.watermarkTint || "#f8ca14");
    setReadingMode(album.readingMode === "gallery" || album.readingMode === "scroll" ? album.readingMode : "spread");
  }, [album]);

  const create = trpc.aqeeqAlbums.create.useMutation({
    onSuccess: (created) => {
      toast.success("تم إنشاء الألبوم بنجاح");
      setCreateDialogOpen(false);
      setSelectedSlug(created.slug);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const update = trpc.aqeeqAlbums.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ تعديلات الألبوم");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const importFromDrive = trpc.aqeeqAlbums.importFromDrive.useMutation({
    onSuccess: (media) => {
      toast.success("تمت قراءة " + media.length + " ملف من Drive");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const addMedia = trpc.aqeeqAlbums.addMedia.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة المحتوى إلى الألبوم");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMedia = trpc.aqeeqAlbums.updateMedia.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ وصف الوسيط");
      setEditingMedia(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const reorderMedia = trpc.aqeeqAlbums.reorderMedia.useMutation({
    onSuccess: (updatedMedia) => {
      if (selectedSlug) {
        utils.aqeeqAlbums.album.setData({ slug: selectedSlug }, (old) => {
          if (!old) return old;
          return { ...old, media: updatedMedia as any };
        });
        utils.aqeeqAlbums.publicAlbum.setData({ slug: selectedSlug }, (old) => {
          if (!old) return old;
          return { ...old, media: updatedMedia as any };
        });
        void utils.aqeeqAlbums.publicAlbum.invalidate({ slug: selectedSlug });
      }
      void utils.aqeeqAlbums.publicList.invalidate();
      toast.success("تم حفظ وتحديث ترتيب صور الألبوم خارجياً فوراً");
    },
    onError: (error) => {
      toast.error(error.message || "تعذر حفظ الترتيب");
      if (album?.media) setMediaList(album.media);
    },
  });

  const deleteMedia = trpc.aqeeqAlbums.deleteMedia.useMutation({
    onSuccess: () => {
      toast.message("تم حذف الملف من الألبوم");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const publish = trpc.aqeeqAlbums.publish.useMutation({
    onSuccess: () => {
      toast.success("تم الحفظ والنشر بنجاح", {
        description: "الألبوم أصبح متاحًا للزوار على رف الألبومات.",
      });
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = trpc.aqeeqAlbums.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الألبوم");
      setSelectedSlug(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const chooseMedia = (asset: MediaChoice) => {
    if (!album) return;
    if (mediaTarget === "cover") setCoverUrl(asset.url);
    if (mediaTarget === "headerLogo") setHeaderLogoUrl(asset.url);
    if (mediaTarget === "watermark") {
      setWatermarkUrl(asset.url);
      update.mutate({ id: album.id, watermarkUrl: asset.url });
      toast.success("تم تحديث العلامة المائية فورًا");
    }
    if (mediaTarget === "audio") setBackgroundAudioUrl(asset.url);
    setMediaTarget(null);
  };

  const addImageFromLibrary = (asset: MediaChoice) => {
    if (!album) return;
    addMedia.mutate({
      albumId: album.id,
      media: [
        {
          mediaUrl: asset.url,
          thumbnailUrl: asset.url,
          fileName: asset.fileName,
          mimeType: asset.mimeType || "image/*",
          mediaType: "image",
          caption: asset.fileName,
        },
      ],
    });
  };

  const addPdfPages = (pages: AlbumPage[]) => {
    if (album) addMedia.mutate({ albumId: album.id, media: pages });
  };

  const saveAlbum = async () => {
    if (!album) return;
    await update.mutateAsync({
      id: album.id,
      title,
      albumDate,
      description: description || null,
      driveFolderUrl: driveFolderUrl.trim() || null,
      coverUrl,
      readingMode,
      headerLogoUrl,
      backgroundAudioUrl,
      watermarkUrl,
      watermarkScale,
      watermarkOpacity,
      watermarkPosition,
      watermarkTint,
    });
  };

  const openPreview = () => {
    if (!album) return;
    window.open("/albums/" + album.slug, "_blank", "noopener");
  };

  const [mediaList, setMediaList] = useState<any[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (album?.media && !isInteractingRef.current) {
      setMediaList(album.media);
    }
  }, [album?.media]);

  const persistReorder = (items: any[]) => {
    if (!album) return;
    const ids = items.map((m) => m.id);
    reorderMedia.mutate({ albumId: album.id, mediaIds: ids });
  };

  const handleReorderMedia = (newMedia: any[]) => {
    isInteractingRef.current = true;
    setMediaList(newMedia);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistReorder(newMedia);
      setTimeout(() => { isInteractingRef.current = false; }, 800);
    }, 450);
  };

  const jumpMediaToPosition = (fromIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= mediaList.length || fromIndex === targetIndex) return;
    isInteractingRef.current = true;
    const updated = [...mediaList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setMediaList(updated);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    persistReorder(updated);
    setTimeout(() => { isInteractingRef.current = false; }, 800);
  };

  const moveMediaStep = (fromIndex: number, direction: -1 | 1) => {
    const targetIndex = fromIndex + direction;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;
    jumpMediaToPosition(fromIndex, targetIndex);
  };

  if (authLoading || isLoading) {
    return (
      <div className={"grid min-h-screen place-items-center " + (dark ? "bg-black text-white" : "bg-white text-black")}>
        <Loader2 className="animate-spin text-[#f8ca14]" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <main dir="rtl" className={"min-h-screen aq-public-shell " + (dark ? "bg-black text-white" : "bg-white text-black")}>
      <AlaqeeqStudioSiteHeader title="استوديو ألبوم العقيق" active="albums" logoUrl={headerLogoUrl || albums[0]?.coverUrl} />

      {/* Hero Header Bar */}
      <section className={"relative overflow-hidden border-b transition " + (
        dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
      )}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(248,202,20,0.12),transparent_25%)]" />
        <div className="relative mx-auto flex max-w-[1360px] flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
              AQEEQ STUDIO · ALBUM ARCHIVE
            </p>
            <h1 className={"mt-2 text-3xl font-black md:text-4xl " + (dark ? "text-white" : "text-black")}>
              استوديو <span className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>ألبوم العقيق.</span>
            </h1>
            <p className={"mt-3 max-w-2xl text-sm leading-8 " + (dark ? "text-slate-400" : "text-slate-600")}>
              إدارة ألبومات الفعاليات، صور وفيديوهات الذكريات، والاستيراد التلقائي من Drive أو PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Album Selector Dropdown */}
            {albums.length > 0 ? (
              <select
                value={selectedSlug || ""}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className={"h-10 rounded-xl border px-3 text-xs font-black transition " + (
                  dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black shadow-sm"
                )}
              >
                {albums.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.title} ({item.albumDate})
                  </option>
                ))}
              </select>
            ) : null}

            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="outline"
              className={"border font-black transition " + (
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              )}
            >
              <FilePlus2 className="ml-2" size={16} />
              ألبوم جديد
            </Button>

            <Button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black hover:from-amber-400 hover:to-amber-200 shadow-md text-xs"
            >
              <Sparkles className="ml-1.5" size={14} />
              صياغة بالـ AI ✨
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/analytics")}
              className="border-white/15 text-xs font-black hover:bg-white/10"
            >
              التحليلات والرادار 📊
            </Button>

            {album ? (
              <>
                <span className={"rounded-full border px-3 py-1.5 text-[11px] font-black " + (
                  album.status === "published"
                    ? (dark ? "border-[#367453]/40 bg-[#367453]/15 text-[#367453]" : "border-[#367453]/30 bg-[#367453]/10 text-[#367453]")
                    : (dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]")
                )}>
                  {album.status === "published" ? "منشور للزوار" : "مسودة — اضغط حفظ ونشر"}
                </span>

                <Button
                  onClick={openPreview}
                  variant="outline"
                  className={"border font-black transition " + (
                    dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                      : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                  )}
                >
                  <Play className="ml-2" size={16} />
                  معاينة
                </Button>

                <Button
                  onClick={() => void saveAlbum().then(() => publish.mutateAsync({ id: album.id }))}
                  disabled={!album.media.length || publish.isPending || update.isPending}
                  className={"font-black shadow-lg transition active:scale-95 hover:opacity-90 " + (
                    dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                  )}
                >
                  {publish.isPending || update.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
                  حفظ ونشر
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {album ? (
        <div className="mx-auto grid max-w-[1360px] gap-6 px-5 py-10 md:px-8 xl:grid-cols-[.78fr_1.22fr]">
          {/* Column 1: Settings & Sources */}
          <section className="space-y-6">
            {/* Album Settings Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <Settings2 className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>إعدادات الألبوم</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    العنوان، تاريخ الفعالية، طريقة العرض، الغلاف والهوية.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>عنوان الفعالية</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                  />
                </div>

                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>تاريخ الفعالية</Label>
                  <Input
                    type="date"
                    value={albumDate}
                    onChange={(e) => setAlbumDate(e.target.value)}
                    className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                  />
                </div>

                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>وصف الألبوم</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={"mt-2 min-h-20 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                  />
                </div>

                {/* Mode selection */}
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>طريقة عرض الألبوم</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ["spread", "تقليب كتاب"],
                      ["scroll", "تمرير طولي"],
                      ["gallery", "شبكة معرض"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setReadingMode(id as AlbumMode)}
                        className={"rounded-xl border p-2.5 text-right transition " + (
                          readingMode === id
                            ? (dark ? "border-[#f8ca14] bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d] bg-[#08467d]/10 text-[#08467d]")
                            : (dark ? "border-white/10 text-slate-400 hover:border-white/20" : "border-black/10 text-slate-600 hover:border-black/20")
                        )}
                      >
                        <p className="text-xs font-black">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Audio Manager */}
                <AqeeqAudioManagerField
                  value={backgroundAudioUrl}
                  onChange={setBackgroundAudioUrl}
                  dark={dark}
                  label="موسيقى وخلفية الألبوم الصوتية"
                />

                {/* Album Branding & Watermark */}
                <div className={"rounded-xl border p-3 " + (dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50")}>
                  <p className={"text-[11px] font-black " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>هوية الألبوم والعلامة المائية</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {([
                      ["cover", "غلاف الألبوم", coverUrl, Camera],
                      ["headerLogo", "شعار الرأس", headerLogoUrl, ImageIcon],
                      ["watermark", "العلامة المائية", watermarkUrl, Sparkles],
                    ] as const).map(([field, label, value, Icon]) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setMediaTarget(field as MediaTarget)}
                        className={"rounded-lg border p-2 text-right transition " + (
                          dark
                            ? "border-white/10 hover:border-[#f8ca14]/40 hover:bg-[#f8ca14]/10"
                            : "border-black/10 hover:border-[#08467d]/40 hover:bg-[#08467d]/10"
                        )}
                      >
                        <span className={"flex items-center gap-2 text-[10px] font-black " + (dark ? "text-slate-200" : "text-slate-700")}>
                          <Icon size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                          {label}
                        </span>
                        <span dir="ltr" className={"mt-2 block truncate text-[9px] " + (dark ? "text-slate-400" : "text-slate-500")}>
                          {value || "اختيار من مكتبة الوسائط"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={dark ? "text-slate-200" : "text-slate-800"}>حجم العلامة</Label>
                    <Input
                      type="number"
                      value={watermarkScale}
                      onChange={(e) => setWatermarkScale(Number(e.target.value))}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>
                  <div>
                    <Label className={dark ? "text-slate-200" : "text-slate-800"}>شفافية العلامة</Label>
                    <Input
                      type="number"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={saveAlbum}
                disabled={update.isPending}
                className={"mt-6 w-full border font-black transition " + (
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                )}
              >
                {update.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <CheckCircle2 className="ml-2" size={15} />}
                حفظ الإعدادات
              </Button>
            </article>

            {/* Google Drive Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <RefreshCw className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>Google Drive</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    استيراد صور وفيديوهات الفعالية مباشرة من فولدر Google Drive.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>رابط فولدر Google Drive</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    dir="ltr"
                    placeholder="https://drive.google.com/drive/folders/..."
                    className={dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}
                  />
                  <Button
                    onClick={() => importFromDrive.mutate({ albumId: album.id, driveFolderUrl })}
                    disabled={!driveFolderUrl.trim() || importFromDrive.isPending}
                    className={"shrink-0 font-black " + (
                      dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
                    )}
                  >
                    {importFromDrive.isPending ? <Loader2 className="animate-spin" size={16} /> : <CloudDownload size={16} />}
                  </Button>
                </div>
              </div>
            </article>

            {/* PDF Importer Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <FileText className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>استيراد كتيب PDF</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    رفع كتيب الفعالية وتحويل صفحاته لصور داخل الألبوم.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <AlbumPdfImporter onImported={addPdfPages} />
              </div>
            </article>

            {/* Delete Album Action */}
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من حذف هذا الألبوم بكل وسائطه؟")) {
                  remove.mutate({ id: album.id, confirm: true });
                }
              }}
              className="w-full border-red-500/30 text-[#de191e] hover:bg-[#de191e]/10 font-black"
            >
              <Trash2 className="ml-2" size={16} />
              حذف الألبوم بالكامل
            </Button>
          </section>

          {/* Column 2: Media Queue */}
          <section className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
            dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
          )}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
                  MEDIA QUEUE
                </p>
                <h2 className={"mt-1 text-2xl font-black " + (dark ? "text-white" : "text-black")}>
                  وسائط وملفات الألبوم ({album.media.length})
                </h2>
                <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                  يمكنك تعيين أي صورة كغلاف للألبوم، أو إعادة ترتيب الوسائط بسهولة.
                </p>
              </div>

              <Button
                onClick={() => setAlbumMediaLibraryOpen(true)}
                variant="outline"
                className={"border font-black transition " + (
                  dark
                    ? "border-[#f8ca14]/35 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                )}
              >
                <ImagePlus className="ml-2" size={16} />
                إضافة وسيط
              </Button>
            </div>

            {/* Helpful Drag & Drop Hint */}
            {mediaList.length > 1 && (
              <div className={`mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl p-3 text-xs font-bold border transition ${
                dark ? "border-amber-400/20 bg-amber-400/5 text-amber-300" : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
              }`}>
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="opacity-75 shrink-0" />
                  <span>💡 <strong>سحب وإفلات تفاعلي:</strong> اسحب أي وسيط للأعلى أو للأسفل لإعادة الترتيب بسلاسة، أو اضغط على شارة الرقم (#) لنقلها فوراً.</span>
                </div>
                {reorderMedia.isPending && (
                  <span className="flex items-center gap-1.5 text-[10px] text-amber-400 animate-pulse font-black shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                    جارِ حفظ الترتيب...
                  </span>
                )}
              </div>
            )}

            <div className="mt-6">
              {mediaList.length ? (
                <Reorder.Group axis="y" values={mediaList} onReorder={handleReorderMedia} className="space-y-3">
                  {mediaList.map((item, index) => (
                    <AlbumMediaReorderCard
                      key={item.id}
                      item={item}
                      index={index}
                      total={mediaList.length}
                      dark={dark}
                      coverUrl={coverUrl}
                      onSetCover={() => {
                        setCoverUrl(item.mediaUrl);
                        toast.success("تم تعيين هذه الصورة كغلاف للألبوم");
                      }}
                      onEdit={() => setEditingMedia({ id: item.id, caption: item.caption || "" })}
                      onDelete={() => {
                        if (confirm("هل تريد حذف هذا الملف؟")) deleteMedia.mutate({ id: item.id });
                      }}
                      onJump={jumpMediaToPosition}
                      onMoveStep={moveMediaStep}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className={"rounded-2xl border border-dashed p-12 text-center " + (
                  dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.02]" : "border-[#08467d]/20 bg-[#08467d]/[0.02]"
                )}>
                  <Camera className={"mx-auto " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")} size={38} />
                  <p className={"mt-4 font-black " + (dark ? "text-white" : "text-black")}>لا توجد وسائط في هذا الألبوم بعد</p>
                  <p className={"mt-2 text-sm " + (dark ? "text-slate-400" : "text-slate-500")}>
                    استورد من فولدر Drive أو ارفع ملف PDF أو أضف صورًا مباشرة من مكتبة الوسائط.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <Camera className={"mx-auto " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")} size={48} />
          <h2 className={"mt-4 text-2xl font-black " + (dark ? "text-white" : "text-black")}>
            لا توجد ألبومات بعد
          </h2>
          <p className={"mt-2 text-sm " + (dark ? "text-slate-400" : "text-slate-600")}>
            ابدأ بإنشاء أول ألبوم لفعاليات مدارس العقيق.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className={"mt-6 font-black " + (dark ? "!bg-[#f8ca14] !text-black" : "!bg-[#08467d] !text-white")}
          >
            <Plus className="ml-2" size={16} />
            إنشاء أول ألبوم
          </Button>
        </section>
      )}

      {/* Floating Action */}
      {album ? (
        <button
          type="button"
          onClick={() => setAlbumMediaLibraryOpen(true)}
          className={"fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black shadow-2xl transition active:scale-95 hover:opacity-90 " + (
            dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
          )}
        >
          <Upload size={16} />
          إضافة وسيط
        </button>
      ) : null}

      {/* Create Album Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent dir="rtl" className={"border p-6 max-w-xl rounded-[2rem] shadow-2xl backdrop-blur-xl " + (
          dark ? "border-[#f8ca14]/30 bg-[#080808]/95 text-white" : "border-black/10 bg-white/95 text-black"
        )}>
          <DialogHeader>
            <DialogTitle className={"text-right font-black " + (dark ? "text-white" : "text-black")}>
              إنشاء ألبوم جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>عنوان الفعالية</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: حفل تخرج دفعة 2026"
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>تاريخ الفعالية</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>رابط فولدر Google Drive (اختياري)</Label>
              <Input
                value={newDriveUrl}
                onChange={(e) => setNewDriveUrl(e.target.value)}
                dir="ltr"
                placeholder="https://drive.google.com/drive/folders/..."
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>الوصف</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="وصف مختصر للفعالية والألبوم…"
                className={"mt-2 min-h-20 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <AqeeqAudioManagerField
              value={newBackgroundAudioUrl}
              onChange={setNewBackgroundAudioUrl}
              dark={dark}
              label="الموسيقى والخلفية الصوتية للألبوم (اختياري)"
            />
            <Button
              onClick={() =>
                create.mutate({
                  title: newTitle,
                  slug: "album-" + newDate.replaceAll("-", "") + "-" + Math.random().toString(36).slice(2, 6),
                  albumDate: newDate,
                  description: newDescription || null,
                  driveFolderUrl: newDriveUrl.trim() || null,
                  readingMode: newReadingMode,
                  backgroundAudioUrl: newBackgroundAudioUrl,
                })
              }
              disabled={create.isPending}
              className={"w-full font-black " + (
                dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
              )}
            >
              {create.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              إنشاء وفتح الاستوديو
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Media Caption Dialog */}
      <Dialog open={Boolean(editingMedia)} onOpenChange={(open) => { if (!open) setEditingMedia(null); }}>
        <DialogContent dir="rtl" className={"border p-6 " + (
          dark ? "border-[#f8ca14]/30 bg-[#080808] text-white" : "border-black/10 bg-white text-black"
        )}>
          <DialogHeader>
            <DialogTitle className={"text-right font-black " + (dark ? "text-white" : "text-black")}>
              تعديل وصف الوسيط
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>وصف أو عنوان الصورة / الفيديو</Label>
              <Input
                value={editingMedia?.caption || ""}
                onChange={(e) => setEditingMedia((prev) => prev ? { ...prev, caption: e.target.value } : null)}
                placeholder="مثال: صورة جماعية للمتفوقين"
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <Button
              onClick={() =>
                editingMedia &&
                updateMedia.mutate({
                  id: editingMedia.id,
                  caption: editingMedia.caption || null,
                })
              }
              disabled={updateMedia.isPending}
              className={"w-full font-black " + (
                dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
              )}
            >
              {updateMedia.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              حفظ التعديل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaLibrary
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        accept={mediaTarget === "audio" ? "audio" : "image"}
        onSelect={chooseMedia}
      />
      <MediaLibrary
        open={albumMediaLibraryOpen}
        onClose={() => setAlbumMediaLibraryOpen(false)}
        accept="image"
        onSelect={addImageFromLibrary}
      />

      <AiStoryWriterModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        defaultTopic={title}
        dark={dark}
        mode="album"
        onApply={(res) => {
          setTitle(res.headline);
          setDescription(res.body);
        }}
      />
    </main>
  );
}
