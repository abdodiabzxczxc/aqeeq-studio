import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}
import { AqeeqUniversalMediaPickerModal, MediaPickerItem } from "@/components/AqeeqUniversalMediaPickerModal";
import { AqeeqAiYearbookGenerator } from "@/components/AqeeqAiYearbookGenerator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Palette,
  Sliders,
  Users,
  Layers,
  Megaphone,
  Share2,
  BookOpen,
  Camera,
  Clapperboard,
  Image as ImageIcon,
  Instagram,
  Facebook,
  MapPin,
  Eye,
  Plus,
  Key,
  Trash2,
  Shield,
  ShieldCheck,
  Radio,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpLeft,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  Clock,
  Wand2,
  Music,
  Headphones,
  Play,
  Pause,
  ListMusic,
  FolderSync,
  Newspaper,
  Mic,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SnapchatIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.166 2C8.36 2 6.27 4.29 6.27 7.07c0 1.25.46 2.37 1.05 3.19.14.19.17.43.07.64-.19.4-.64.81-1.39 1.01-.35.09-.59.4-.57.76.03.48.42.79.88.79.13 0 .27-.02.4-.08.57-.23 1.1-.3 1.54-.15.25.09.4.3.4.57 0 .8-.56 2.37-2.3 3.03-.43.16-.69.61-.59 1.06.1.44.53.75.98.71 1.45-.13 2.76.62 3.65 1.55.3.31.72.48 1.15.48h.04c.43 0 .85-.17 1.15-.48.89-.93 2.2-1.68 3.65-1.55.45.04.88-.27.98-.71.1-.45-.16-.9-.59-1.06-1.74-.66-2.3-2.23-2.3-3.03 0-.27.15-.48.4-.57.44-.15.97-.08 1.54.15.13.06.27.08.4.08.46 0 .85-.31.88-.79.02-.36-.22-.67-.57-.76-.75-.2-1.2-.61-1.39-1.01-.1-.21-.07-.45.07-.64.59-.82 1.05-1.94 1.05-3.19C17.73 4.29 15.64 2 12.166 2z" />
    </svg>
  );
}

type TabKey = "radar" | "orchestration" | "users" | "content" | "broadcast" | "articles" | "podcast" | "music" | "whatsapp";

export default function AqeeqAdminDashboardPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [activeTab, setActiveTab] = useState<TabKey>("radar");
  const [isYearbookOpen, setIsYearbookOpen] = useState(false);
  const utils = trpc.useUtils();

  // Admin Overview Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.executiveAdmin.getOverviewStats.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
    refetchInterval: 15000,
  });

  const { data: usersList = [], refetch: refetchUsers } = trpc.executiveAdmin.getUsers.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: masterContent = [], isLoading: contentLoading, refetch: refetchContent } = trpc.executiveAdmin.getMasterContent.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  // Site Orchestration State & Queries
  const { data: orchestrationData, refetch: refetchOrchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: issuesList = [] } = trpc.schoolNews.publicList.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: albumsList = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: showcaseData } = trpc.aqeeqShowcases.publicShowcase.useQuery(
    { slug: "news-offers" },
    { enabled: Boolean(isAuthenticated && user?.role === "admin") }
  );

const DEFAULT_ORCHESTRATION = {
  nav: {
    homeLabel: "الرئيسية",
    journalLabel: "مجلة العقيق",
    albumsLabel: "ألبوم العقيق",
    showcaseLabel: "الأخبار والعروض",
    logoUrl: "/alaqeeq-logo.png",
  },
  heroCovers: {
    journalMode: "auto",
    customJournalIssueId: null,
    journalSecondaryIssueId: null,
    journalCustomTitle: "",
    journalCustomSubtitle: "",
    journalCustomDesc: "",
    journalCustomTag: "",
    albumsMode: "auto",
    customAlbumId: null,
    albumsSecondaryAlbumId: null,
    albumsCustomTitle: "",
    albumsCustomSubtitle: "",
    albumsCustomDesc: "",
    albumsCustomTag: "",
    showcaseMode: "auto",
    customShowcasePostId: null,
    showcaseSecondaryPostId: null,
    showcaseCustomTitle: "",
    showcaseCustomSubtitle: "",
    showcaseCustomDesc: "",
    showcaseCustomTag: "",
    articlesMode: "auto",
    customArticleId: null,
    articlesSecondaryArticleId: null,
    articlesCustomTitle: "",
    articlesCustomSubtitle: "",
    articlesCustomDesc: "",
    articlesCustomTag: "",
    podcastsMode: "auto",
    customPodcastId: null,
    podcastsSecondaryPodcastId: null,
    podcastsCustomTitle: "",
    podcastsCustomSubtitle: "",
    podcastsCustomDesc: "",
    podcastsCustomTag: "",
  },
  weeklyBento: {
    enabled: true,
    featuredMode: "auto",
    customPostId: null,
    customTag: "",
    customTitle: "",
    customDescription: "",
    academicBadgeTitle: "وسام التميز الأكاديمي",
    academicBadgeWeek: "الأسبوع 14",
    academicBadgeDesc: "ريادة في مسابقات موهبة والروبوتيكس على مستوى المنطقة",
    heartsCount: 142,
  },
  sections: {
    storiesEnabled: true,
    marqueeEnabled: true,
    marqueeBadge: "آخر الأخبار",
    studioHighlightsEnabled: true,
    studioHighlightsTitle: "جديد الاستوديو",
    studioHighlightsDesc: "أحدث ما تم نشره وتوثيقه عبر استوديوهات العقيق من وسائط وإصدارات رقمية.",
    libraryEnabled: true,
    libraryTitle: "استكشف المكتبة",
    libraryDesc: "تصفح متكامل وشامل لجميع أرشيفات البودكاست، المقالات، الألبومات والمجلات المدرسية.",
    pathwaysEnabled: true,
    bentoEnabled: true,
    quoteEnabled: true,
    memoryWallEnabled: true,
    archiveStatsEnabled: true,
    journalSectionTitle: "مجلة العقيق الدورية",
    journalSectionDesc: "تصفح الأعداد الدورية التفاعلية للمجلة واستمتع بتقليب الصفحات ثلاثية الأبعاد.",
    albumsSectionTitle: "ألبوم فعاليات العقيق",
    albumsSectionDesc: "أرشيف حي لجميع الفعاليات والمناسبات والأنشطة المدرسية بالصور والفيديوهات.",
    showcaseSectionTitle: "الأخبار والعروض والسوشيال ميديا",
    showcaseSectionDesc: "تغطيات مصورة حية، فيديوهات تفاعلية، ومنشورات منصات التواصل لحظة بلحظة.",
    memoryWallTitle: "حائط الذكريات ولحظات لا تُنسى",
    memoryWallDesc: "توثيق بالصور لأجمل اللحظات التي تجمع طلاب ومعلمي مدارس العقيق.",
    archiveTitle: "أرشيف العقيق المفتوح",
    archiveDesc: "ذاكرة رقمية متكاملة تنمو يومياً مع كل خبر وعرض مباشر، وكل عدد جديد من المجلة.",
  },
  editorialVoice: {
    enabled: true,
    quoteText: "نؤمن في مدارس العقيق بأن التعليم ليس مجرد تلقين، بل صناعة هوية وبناء جيل ملهم يقود المستقبل بالمعرفة والقيم.",
    authorName: "أ. عبد الله الساعدي",
    authorTitle: "المشرف العام على مدارس العقيق",
    audioUrl: null,
  },
  schoolSongs: [
    {
      id: "song-1",
      title: "نشيد مدارس العقيق الرسمي",
      artist: "كورال طلاب مدارس العقيق الأهلية",
      category: "النشيد المدرسي",
      mediaUrl: "/audio/aqeeq-royal.mp3",
      coverUrl: "",
    },
    {
      id: "song-2",
      title: "أغنية فخر التميز والريادة",
      artist: "فرقة المدارس الاحتفالية",
      category: "احتفالي",
      mediaUrl: "/audio/aqeeq-celebration.mp3",
      coverUrl: "",
    },
    {
      id: "song-3",
      title: "معزوفة إلهام العقيق (بيانو)",
      artist: "استوديو العقيق الموسيقي",
      category: "بيانو وهدوء",
      mediaUrl: "/audio/aqeeq-piano.mp3",
      coverUrl: "",
    },
    {
      id: "song-4",
      title: "أنغام العقيق الملكية",
      artist: "وتريات العقيق",
      category: "أجواء ملكية",
      mediaUrl: "/audio/aqeeq-ambient.mp3",
      coverUrl: "",
    },
  ],
  social: {
    xUrl: "https://x.com/alaqeeq_schools",
    instagramUrl: "https://instagram.com/alaqeeq_schools",
    youtubeUrl: "https://youtube.com/@alaqeeq_schools",
    snapchatUrl: "https://snapchat.com/add/alaqeeq_schools",
    facebookUrl: "https://facebook.com/alaqeeqschools",
    whatsappNumber: "966500000000",
  },
  footer: {
    copyrightText: "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026",
    subText: "صُنعت المنصة الرقمية بأحدث التقنيات لخدمة الطلاب وأولياء الأمور والمعلمين",
  },
  location: {
    enabled: true,
    text: "المدينة المنورة · المملكة العربية السعودية",
    mapUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
  },
};

  // Universal Media Picker State
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    open: boolean;
    title: string;
    currentUrl?: string | null;
    onSelect: (item: MediaPickerItem) => void;
  }>({
    open: false,
    title: "",
    onSelect: () => {},
  });

  const openMediaPicker = (title: string, currentUrl: string | null | undefined, onSelect: (item: MediaPickerItem) => void) => {
    setMediaPickerConfig({
      open: true,
      title,
      currentUrl,
      onSelect,
    });
  };

  const handleLivePreview = async () => {
    try {
      await setOrchestrationMutation.mutateAsync(orchestrationForm);
      window.open("/", "_blank");
    } catch {
      window.open("/", "_blank");
    }
  };

  const [orchestrationForm, setOrchestrationForm] = useState<any>(DEFAULT_ORCHESTRATION);

  useEffect(() => {
    if (orchestrationData) {
      setOrchestrationForm({
        ...DEFAULT_ORCHESTRATION,
        ...orchestrationData,
        nav: { ...DEFAULT_ORCHESTRATION.nav, ...(orchestrationData.nav || {}) },
        heroCovers: { ...DEFAULT_ORCHESTRATION.heroCovers, ...(orchestrationData.heroCovers || {}) },
        weeklyBento: { ...DEFAULT_ORCHESTRATION.weeklyBento, ...(orchestrationData.weeklyBento || {}) },
        sections: { ...DEFAULT_ORCHESTRATION.sections, ...(orchestrationData.sections || {}) },
        editorialVoice: { ...DEFAULT_ORCHESTRATION.editorialVoice, ...(orchestrationData.editorialVoice || {}) },
        social: { ...DEFAULT_ORCHESTRATION.social, ...(orchestrationData.social || {}) },
        footer: { ...DEFAULT_ORCHESTRATION.footer, ...(orchestrationData.footer || {}) },
        location: { ...DEFAULT_ORCHESTRATION.location, ...(orchestrationData.location || {}) },
        schoolSongs: (orchestrationData as any).schoolSongs || DEFAULT_ORCHESTRATION.schoolSongs,
      });
    }
  }, [orchestrationData]);

  const setOrchestrationMutation = trpc.executiveAdmin.setSiteOrchestration.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ ونشر جميع تعديلات الواجهة والسكاشن بنجاح! 🚀");
      void refetchOrchestration();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حفظ التعديلات");
    },
  });

  // Hero Covers Sub-tab State
  const [heroActiveCoverTab, setHeroActiveCoverTab] = useState<"home" | "journal" | "albums" | "showcase" | "articles" | "podcasts">("home");

  // School Songs State
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [newSongCategory, setNewSongCategory] = useState("النشيد المدرسي");
  const [newSongCover, setNewSongCover] = useState("");
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isImportAudioFolderOpen, setIsImportAudioFolderOpen] = useState(false);
  const [driveAudioFolderUrl, setDriveAudioFolderUrl] = useState("");
  const [scannedAudioTracks, setScannedAudioTracks] = useState<any[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Record<string, boolean>>({});

  const scanDriveAudioFolderMutation = trpc.admin.scanGoogleDriveAudioFolder.useMutation();

  // User Management State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserOpenId, setNewUserOpenId] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "coordinator" | "receptionist" | "auditor">("admin");

  const [resetPassUserId, setResetPassUserId] = useState<number | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Broadcast Banner State
  const [editingBroadcastId, setEditingBroadcastId] = useState<string | null>(null);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"urgent" | "celebration" | "info">("info");
  const [broadcastLink, setBroadcastLink] = useState("");
  const [broadcastLinkText, setBroadcastLinkText] = useState("");

  const { data: broadcastList = [], refetch: refetchBroadcastList } = trpc.executiveAdmin.getBroadcastList.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  // Sync broadcast state from server once loaded
  const [broadcastInitialized, setBroadcastInitialized] = useState(false);
  if (stats?.broadcast && !broadcastInitialized) {
    const b = stats.broadcast as any;
    setBroadcastEnabled(Boolean(b.enabled));
    setBroadcastMessage(b.message || "");
    setBroadcastType(b.type || "info");
    setBroadcastLink(b.link || "");
    setBroadcastLinkText(b.linkText || "");
    if (b.id) setEditingBroadcastId(b.id);
    setBroadcastInitialized(true);
  }

  // WhatsApp Campaign State
  const [selectedCampaignItem, setSelectedCampaignItem] = useState<string>("");

  // Content Grid Search & Filters
  const [contentSearch, setContentSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "journal" | "album" | "post">("all");

  // Mutations
  const createUserMutation = trpc.executiveAdmin.createUser.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء حساب المشرف بنجاح!");
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserOpenId("");
      setNewUserPassword("");
      void refetchUsers();
      void refetchStats();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر إنشاء الحساب");
    },
  });

  const resetPasswordMutation = trpc.executiveAdmin.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح!");
      setResetPassUserId(null);
      setNewPasswordValue("");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر تغيير كلمة المرور");
    },
  });

  const deleteUserMutation = trpc.executiveAdmin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح!");
      setDeleteUserId(null);
      void refetchUsers();
      void refetchStats();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حذف المستخدم");
    },
  });

  const updateRoleMutation = trpc.executiveAdmin.updateRole.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث صلاحية المستخدم!");
      void refetchUsers();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر تحديث الصلاحية");
    },
  });

  const setBroadcastMutation = trpc.executiveAdmin.setBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ ونشر التنبيه العاجل بنجاح!");
      void refetchBroadcastList();
      void refetchStats();
      void utils.executiveAdmin.getBroadcast.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حفظ إعدادات التنبيه");
    },
  });

  const deleteBroadcastMutation = trpc.executiveAdmin.deleteBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التنبيه من السجل بنجاح!");
      void refetchBroadcastList();
      void refetchStats();
      void utils.executiveAdmin.getBroadcast.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حذف التنبيه");
    },
  });

  const toggleBroadcastMutation = trpc.executiveAdmin.toggleBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة التنبيه!");
      void refetchBroadcastList();
      void refetchStats();
      void utils.executiveAdmin.getBroadcast.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر تعديل حالة التنبيه");
    },
  });

  const hideStoryMutation = trpc.executiveAdmin.hideStory.useMutation({
    onSuccess: (_, variables) => {
      toast.success("تم استبعاد القصة من شريط 24H بنجاح", {
        action: {
          label: "تراجع ↩️",
          onClick: () => unhideStoryMutation.mutate({ storyId: variables.storyId }),
        },
      });
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر استبعاد القصة"),
  });

  const unhideStoryMutation = trpc.executiveAdmin.unhideStory.useMutation({
    onSuccess: () => {
      toast.success("تمت استعادة القصة إلى شريط 24H بنجاح!");
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر استعادة القصة"),
  });

  const toggleStoryMutation = trpc.executiveAdmin.toggleStoryActive.useMutation({
    onSuccess: (_, variables) => {
      const durationLabel = variables.durationHours === 24 ? "٢٤ ساعة"
        : variables.durationHours === 48 ? "٤٨ ساعة"
        : variables.durationHours === 72 ? "٧٢ ساعة"
        : variables.durationHours === 168 ? "أسبوع كامل"
        : `${variables.durationHours} ساعة`;
      toast.success(variables.active
        ? `تم تفعيل الاستوري لمدة ${durationLabel} في الصفحة الرئيسية! 🟢`
        : "تم إيقاف القصة من الاستوريهات");
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getAllAvailableStories.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر تعديل حالة القصة"),
  });

  const { data: availableStories = [], isLoading: isLoadingStories, refetch: refetchAvailableStories } = trpc.executiveAdmin.getAllAvailableStories.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const [isStoryPickerOpen, setIsStoryPickerOpen] = useState(false);
  const [storyPickerCategory, setStoryPickerCategory] = useState<string>("all");
  const [storyPickerSearch, setStoryPickerSearch] = useState<string>("");
  const [storyPickerStatusFilter, setStoryPickerStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [storyDurationHours, setStoryDurationHours] = useState<number>(24); // default 24h

  // Articles Moderation State & Queries
  const { data: allAdminArticles = [], refetch: refetchAdminArticles } = trpc.articles.listAllAdmin.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });
  const [articleFilterStatus, setArticleFilterStatus] = useState<"all" | "pending" | "published" | "rejected">("all");
  const [selectedArticleForEdit, setSelectedArticleForEdit] = useState<any>(null);

  const moderateArticleMutation = trpc.articles.moderate.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة المقال بنجاح!");
      setSelectedArticleForEdit(null);
      void refetchAdminArticles();
    },
    onError: (err) => toast.error(err.message || "تعذر تحديث المقال"),
  });

  const deleteArticleMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح!");
      void refetchAdminArticles();
    },
    onError: (err) => toast.error(err.message || "تعذر حذف المقال"),
  });

  const aiPolishArticleMutation = trpc.articles.aiPolish.useMutation({
    onSuccess: (data) => {
      toast.success("✨ تم التدقيق والتحسين اللغوي بالذكاء الاصطناعي!");
      if (selectedArticleForEdit) {
        setSelectedArticleForEdit((prev: any) => ({
          ...prev,
          title: data.polishedTitle,
          content: data.polishedContent,
          excerpt: data.polishedExcerpt,
        }));
      }
    },
    onError: () => toast.error("تعذر التدقيق اللغوي بالذكاء الاصطناعي"),
  });

  // Podcasts Queries & Mutations
  const { data: allAdminPodcasts = [], refetch: refetchAdminPodcasts } = trpc.podcasts.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });
  const [isAddPodcastOpen, setIsAddPodcastOpen] = useState(false);
  const [newPodcastTitle, setNewPodcastTitle] = useState("");
  const [newPodcastDesc, setNewPodcastDesc] = useState("");
  const [newPodcastUrl, setNewPodcastUrl] = useState("");
  const [newPodcastType, setNewPodcastType] = useState<"audio" | "video">("audio");
  const [newPodcastSource, setNewPodcastSource] = useState<"drive" | "youtube" | "direct">("direct");
  const [newPodcastCategory, setNewPodcastCategory] = useState<any>("بودكاست قيادات");
  const [newPodcastHost, setNewPodcastHost] = useState("");
  const [newPodcastDuration, setNewPodcastDuration] = useState("10:00");

  const createPodcastMutation = trpc.podcasts.create.useMutation({
    onSuccess: () => {
      toast.success("تم نشر حلقة البودكاست بنجاح!");
      setIsAddPodcastOpen(false);
      setNewPodcastTitle("");
      setNewPodcastDesc("");
      setNewPodcastUrl("");
      void refetchAdminPodcasts();
    },
    onError: (err) => toast.error(err.message || "تعذر إضافة الحلقة"),
  });

  const deletePodcastMutation = trpc.podcasts.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحلقة بنجاح!");
      void refetchAdminPodcasts();
    },
    onError: (err) => toast.error(err.message || "تعذر حذف الحلقة"),
  });

  // Filtered Master Content
  const filteredContent = useMemo(() => {
    return masterContent.filter((item) => {
      if (contentTypeFilter !== "all" && item.type !== contentTypeFilter) return false;
      if (contentSearch) {
        const q = contentSearch.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.typeLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [masterContent, contentTypeFilter, contentSearch]);

  // Selected WhatsApp item details
  const campaignItemData = useMemo(() => {
    return masterContent.find((item) => item.id === selectedCampaignItem);
  }, [masterContent, selectedCampaignItem]);

  // Formatted WhatsApp message
  const generatedWhatsAppMessage = useMemo(() => {
    if (!campaignItemData) return "";
    const fullUrl = window.location.origin + campaignItemData.viewUrl;
    return [
      "✨ *مدارس العقيق الأهلية والدولية* ✨",
      "📌 يسعدنا مشاركتكم جديد الاستوديو الرقمي:",
      "",
      "📖 *" + campaignItemData.title + "*",
      "🏷️ التصنيف: " + campaignItemData.typeLabel,
      campaignItemData.date ? "📅 التاريخ: " + campaignItemData.date : "",
      "",
      "🔗 *رابط التصفح والمشاهدة المباشرة:*",
      fullUrl,
      "",
      "🌟 _أهلاً بكم في رحاب التميز والإبداع_",
    ]
      .filter(Boolean)
      .join("\n");
  }, [campaignItemData]);

  // If not admin, redirect or show message
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-white">
        <Shield size={48} className="text-[#f8ca14] mb-4" />
        <h1 className="text-2xl font-black">منطقة محظورة — خاصة بالمشرفين فقط</h1>
        <p className="mt-2 text-sm text-slate-400">يرجى تسجيل الدخول بحساب مشرف عام للوصول إلى لوحة القيادة.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-2xl bg-[#f8ca14] px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
        >
          تسجيل الدخول الآن
        </button>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={"min-h-screen transition-colors duration-300 font-[Tajawal,sans-serif] " + (
        dark ? "bg-[#080808] text-white" : "bg-[#f4f6f9] text-slate-900"
      )}
    >
      {/* Top Executive Header */}
      <header
        className={"sticky top-0 z-40 border-b backdrop-blur-xl transition " + (
          dark ? "border-white/[0.08] bg-black/85" : "border-black/[0.08] bg-white/90"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="h-11 w-auto">
              <img
                src="/alaqeeq-logo.png"
                alt="العقيق"
                className={"h-11 object-contain transition " + (dark ? "brightness-0 invert opacity-95" : "")}
              />
            </button>
            <div className="hidden sm:block border-r pr-4 border-current/10">
              <div className="flex items-center gap-2">
                <span className="grid h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h1 className="text-base font-black">غرفة قيادة استوديو العقيق</h1>
              </div>
              <p className="text-[11px] font-bold text-slate-400">Executive Admin Command Center</p>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* View Live Site Button */}
            <button
              onClick={() => navigate("/")}
              className={"inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-black transition " + (
                dark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              )}
            >
              <span>الموقع المباشر</span>
              <ArrowUpLeft size={14} />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className={"grid h-10 w-10 place-items-center rounded-xl border transition " + (
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              )}
              title="تبديل المظهر"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Profile Pill */}
            <div
              className={"hidden md:flex items-center gap-2.5 rounded-xl border px-3 py-1.5 " + (
                dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"
              )}
            >
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-xs">
                {user?.name?.[0] || "A"}
              </div>
              <div className="text-right">
                <p className="text-xs font-black">{user?.name || "المشرف العام"}</p>
                <span className="text-[10px] font-bold text-emerald-400">مشرف معتمد</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => void logout()}
              className="grid h-10 w-10 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Executive Navigation Tabs */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-5 sm:px-8 overflow-x-auto scrollbar-none pb-2">
          {[
            { key: "radar", label: "مركز القيادة والرادار", icon: LayoutDashboard },
            { key: "orchestration", label: "تخصيص الواجهة والسكاشن والكفرات", icon: Palette, alert: false },
            { key: "users", label: "إدارة المشرفين والصلاحيات", icon: Users, badge: usersList.length },
            { key: "content", label: "الجدول الموحد للمحتوى", icon: Layers, badge: masterContent.length },
            { key: "broadcast", label: "شريط التنبيهات العاجل", icon: Megaphone, alert: broadcastEnabled },
            { key: "articles", label: "مراجعة المقالات ✍️", icon: BookOpen, badge: allAdminArticles.filter((a) => a.status === "pending").length || undefined },
            { key: "podcast", label: "أثير العقيق 🎙️", icon: Radio, badge: allAdminPodcasts.length },
            { key: "music", label: "أغاني وراديو العقيق 🎵", icon: Headphones, badge: (orchestrationForm.schoolSongs || []).length },
            { key: "whatsapp", label: "مُولّد حملات الواتساب وQR", icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={"inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition shrink-0 " + (
                  active
                    ? dark
                      ? "bg-[#f8ca14] text-black shadow-lg shadow-[#f8ca14]/20"
                      : "bg-[#08467d] text-white shadow-lg shadow-[#08467d]/20"
                    : dark
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-black/5"
                )}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge !== undefined ? (
                  <span
                    className={"rounded-md px-1.5 py-0.2 text-[10px] font-black " + (
                      active
                        ? dark ? "bg-black/20 text-black" : "bg-white/20 text-white"
                        : dark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {tab.badge}
                  </span>
                ) : null}
                {tab.alert ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
        {/* ==================== TAB: ORCHESTRATION & CMS ==================== */}
        {activeTab === "orchestration" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-current/10">
              <div>
                <h2 className="text-xl font-black">منظومة التحكم الشاملة في الواجهة والسكاشن</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  تحكم كامل في كفرات الهيرو، سيكشن الإنجازات، أسماء الصفحات، نصوص السكاشن، وكلمة المشرف
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleLivePreview}
                  className={"inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-black transition " + (
                    dark
                      ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      : "border-black/10 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                  )}
                >
                  <ExternalLink size={14} />
                  <span>معاينة حية للموقع (مع الحفظ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrchestrationMutation.mutate(orchestrationForm);
                  }}
                  disabled={setOrchestrationMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-6 py-2.5 text-xs font-black text-black transition hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20"
                >
                  <CheckCircle2 size={16} />
                  <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر جميع التعديلات"}</span>
                </button>
              </div>
            </div>

            {/* Grid of Configuration Cards */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* 1. HERO COVERS STUDIO (الرئيسية والصفحات الفرعية) */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-current/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-white">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">استوديو كفرات وأغلفة الهيرو (Hero Covers Studio)</h3>
                      <p className="text-xs font-bold text-slate-400">التحكم في كفرات الهيرو بالرئيسية وصفحات (المجلة، الألبومات، الأخبار)</p>
                    </div>
                  </div>

                  {/* Sub-tab Navigation Pills */}
                  <div className={"flex items-center gap-1 rounded-xl border p-1 text-[11px] font-black " + (
                    dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-100"
                  )}>
                    {[
                      { key: "home", label: "🏠 الرئيسية (3D)" },
                      { key: "journal", label: "📖 المجلة" },
                      { key: "albums", label: "📸 الألبومات" },
                      { key: "showcase", label: "🎬 الأخبار" },
                      { key: "articles", label: "✍️ المقالات" },
                      { key: "podcasts", label: "🎙️ البودكاست" },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setHeroActiveCoverTab(st.key as typeof heroActiveCoverTab)}
                        className={"rounded-lg px-2.5 py-1 transition " + (
                          heroActiveCoverTab === st.key
                            ? dark
                              ? "bg-[#f8ca14] text-black shadow-sm"
                              : "bg-[#08467d] text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolvers for live previews */}
                {(() => {
                  const resolvedJournalCover = (issuesList.find((i) => i.id === orchestrationForm.heroCovers.customJournalIssueId) || issuesList[0])?.coverUrl;
                  const resolvedJournalSecondCover = (issuesList.find((i) => i.id === orchestrationForm.heroCovers.journalSecondaryIssueId) || issuesList[1] || issuesList[0])?.coverUrl;
                  const resolvedJournalIssue = issuesList.find((i) => i.id === orchestrationForm.heroCovers.customJournalIssueId) || issuesList[0];
                  const resolvedJournalSecondIssue = issuesList.find((i) => i.id === orchestrationForm.heroCovers.journalSecondaryIssueId) || issuesList[1] || issuesList[0];

                  const resolvedAlb = albumsList.find((a) => a.id === orchestrationForm.heroCovers.customAlbumId) || albumsList[0];
                  const resolvedAlbumCover = directDriveImage(resolvedAlb?.coverUrl) || resolvedAlb?.coverUrl;
                  const resolvedAlbSecond = albumsList.find((a) => a.id === orchestrationForm.heroCovers.albumsSecondaryAlbumId) || albumsList[1] || albumsList[0];
                  const resolvedAlbumSecondCover = directDriveImage(resolvedAlbSecond?.coverUrl) || resolvedAlbSecond?.coverUrl;

                  const resolvedPost = showcaseData?.posts?.find((p) => p.id === orchestrationForm.heroCovers.customShowcasePostId) || showcaseData?.posts?.[0];
                  const resolvedShowcaseCover = directDriveImage(resolvedPost?.thumbnailUrl) || resolvedPost?.thumbnailUrl || resolvedPost?.mediaUrl;
                  const resolvedPostSecond = showcaseData?.posts?.find((p) => p.id === orchestrationForm.heroCovers.showcaseSecondaryPostId) || showcaseData?.posts?.[1] || showcaseData?.posts?.[0];
                  const resolvedShowcaseSecondCover = directDriveImage(resolvedPostSecond?.thumbnailUrl) || resolvedPostSecond?.thumbnailUrl || resolvedPostSecond?.mediaUrl;

                  const resolvedArt = allAdminArticles.find((a: any) => a.id === orchestrationForm.heroCovers.customArticleId) || allAdminArticles[0];
                  const resolvedArticleCover = directDriveImage(resolvedArt?.coverUrl) || resolvedArt?.coverUrl;
                  const resolvedArtSecond = allAdminArticles.find((a: any) => a.id === orchestrationForm.heroCovers.articlesSecondaryArticleId) || allAdminArticles[1] || allAdminArticles[0];
                  const resolvedArticleSecondCover = directDriveImage(resolvedArtSecond?.coverUrl) || resolvedArtSecond?.coverUrl;

                  const resolvedPod = allAdminPodcasts.find((p: any) => p.id === orchestrationForm.heroCovers.customPodcastId) || allAdminPodcasts[0];
                  const resolvedPodcastCover = directDriveImage(resolvedPod?.coverUrl) || resolvedPod?.coverUrl;
                  const resolvedPodSecond = allAdminPodcasts.find((p: any) => p.id === orchestrationForm.heroCovers.podcastsSecondaryPodcastId) || allAdminPodcasts[1] || allAdminPodcasts[0];
                  const resolvedPodcastSecondCover = directDriveImage(resolvedPodSecond?.coverUrl) || resolvedPodSecond?.coverUrl;

                  return (
                    <div className="space-y-6">
                      {/* SUBTAB 1: HOMEPAGE 3D HERO */}
                      {heroActiveCoverTab === "home" && (
                        <div className="space-y-5">
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60 shadow-inner" : "border-black/5 bg-slate-900 text-white shadow-xl"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-[#f8ca14]" />
                                <span className="text-xs font-black text-white">المعاينة الحية المتداخلة ثلاثية الأبعاد (Homepage 3D Stage)</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold">انقر على أي غلاف لتغييره</span>
                            </div>

                            {/* Overlapping Hero Canvas (طابق الأصل للصفحة الرئيسية) */}
                            <div className="relative mx-auto h-[190px] sm:h-[230px] w-full max-w-[440px]">
                              {/* 1. Showcase Cover (Right / Background Card) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف الأخبار والعروض", resolvedShowcaseCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, showcaseMode: "custom", customShowcasePostId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-[12%] right-[2%] top-[14%] w-[45%] cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#111] opacity-75 transition duration-300 hover:scale-105 hover:opacity-100 hover:z-30 hover:border-blue-400 shadow-xl"
                                title="انقر لاختيار وتغيير غلاف الأخبار والعروض"
                              >
                                {resolvedShowcaseCover ? (
                                  <img src={resolvedShowcaseCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-400 font-bold">الأخبار والعروض</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                                  <span className="text-[9px] font-black text-blue-300">الأخبار والعروض</span>
                                </div>
                              </div>

                              {/* 2. Albums Cover (Middle Card) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف ألبوم العقيق", resolvedAlbumCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, albumsMode: "custom", customAlbumId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-[8%] left-[28%] top-[8%] z-10 w-[51%] cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-[#151515] opacity-90 transition duration-300 hover:scale-105 hover:opacity-100 hover:z-30 hover:border-emerald-400 shadow-2xl"
                                title="انقر لاختيار وتغيير غلاف ألبوم الفعاليات"
                              >
                                {resolvedAlbumCover ? (
                                  <img src={resolvedAlbumCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-400 font-bold">ألبوم الفعاليات</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                                  <span className="text-[9px] font-black text-emerald-300">ألبوم الفعاليات</span>
                                </div>
                              </div>

                              {/* 3. Journal Cover (Front / Left Card in RTL with Golden Highlight) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف مجلة العقيق", resolvedJournalCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, journalMode: "custom", customJournalIssueId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-[2%] left-[2%] top-[4%] z-20 w-[47%] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#f8ca14] bg-[#111] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition duration-300 hover:scale-105 hover:z-30"
                                title="انقر لاختيار وتغيير غلاف مجلة العقيق"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedJournalCover ? (
                                    <img src={resolvedJournalCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-[#f8ca14] font-bold">مجلة العقيق</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                                    <span className="text-[9px] font-black text-[#f8ca14]">مجلة العقيق</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-center text-[10px] text-slate-400 font-bold">
                              💡 يمكنك النقر على أي كارت بالمسرح لتغييره فوراً أو استخدام التبويبات بالأعلى للتحكم المفصل في كل صفحة
                            </p>
                          </div>

                          {/* Quick Summary Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div
                              onClick={() => setHeroActiveCoverTab("journal")}
                              className={"cursor-pointer rounded-2xl border p-3 transition hover:border-[#f8ca14]/60 " + (dark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50")}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#f8ca14]" />
                                <span className="text-xs font-black">غلاف المجلة</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 truncate">{resolvedJournalIssue?.title || "تلقائي"}</p>
                            </div>

                            <div
                              onClick={() => setHeroActiveCoverTab("albums")}
                              className={"cursor-pointer rounded-2xl border p-3 transition hover:border-emerald-400 " + (dark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50")}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="text-xs font-black">غلاف الألبومات</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 truncate">{resolvedAlb?.title || "تلقائي"}</p>
                            </div>

                            <div
                              onClick={() => setHeroActiveCoverTab("showcase")}
                              className={"cursor-pointer rounded-2xl border p-3 transition hover:border-blue-400 " + (dark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50")}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                <span className="text-xs font-black">غلاف الأخبار</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 truncate">{resolvedPost?.title || "تلقائي"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 2: JOURNAL PAGE COVER */}
                      {heroActiveCoverTab === "journal" && (
                        <div className="space-y-4">
                          {/* Live 2-card Preview of /journal */}
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60" : "border-black/5 bg-slate-900 text-white"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-[#f8ca14]">معاينة هيرو صفحة مجلة العقيق (/journal)</span>
                              <a href="/journal" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f8ca14] hover:underline">
                                <span>معاينة الصفحة الحية</span>
                                <ArrowUpLeft size={13} />
                              </a>
                            </div>

                            <div className="relative mx-auto h-[180px] w-full max-w-[360px]">
                              {/* Secondary Tilted Card (Back) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار الغلاف الثانوي للمجلة (العدد السابق)", resolvedJournalSecondCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, journalSecondaryIssueId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute left-[6%] top-[8%] h-[80%] w-[58%] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] opacity-60 transition duration-300 hover:scale-105 hover:opacity-100 shadow-xl"
                                style={{ transform: "rotate(-7deg)" }}
                                title="انقر لتغيير الغلاف الثانوي (العدد السابق)"
                              >
                                {resolvedJournalSecondCover ? (
                                  <img src={resolvedJournalSecondCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-500 font-bold">العدد السابق</div>
                                )}
                              </div>

                              {/* Primary Card (Front) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف مجلة العقيق الرئيسي", resolvedJournalCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, journalMode: "custom", customJournalIssueId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-1 right-[6%] h-[88%] w-[68%] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#f8ca14]/80 bg-[#111] p-1.5 shadow-2xl transition duration-300 hover:scale-105"
                                style={{ transform: "rotate(3deg)" }}
                                title="انقر لتغيير الغلاف الرئيسي للمجلة"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedJournalCover ? (
                                    <img src={resolvedJournalCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-[#f8ca14] font-bold">العدد الحالي</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-[10px] font-black text-white truncate">{resolvedJournalIssue?.title || "العدد الحالي"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-300">نمط اختيار غلاف المجلة</label>
                              <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, journalMode: "auto" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.journalMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  تلقائي (الأحدث)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, journalMode: "custom" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.journalMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  غلاف مخصص
                                </button>
                              </div>
                            </div>

                            {/* Primary and Secondary cover selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الأساسي (العدد المميز)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedJournalCover ? <img src={resolvedJournalCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار غلاف مجلة العقيق الرئيسي", resolvedJournalCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, journalMode: "custom", customJournalIssueId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-[#f8ca14]/30 bg-[#f8ca14]/10 px-3 py-2 text-xs font-black text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black transition text-right"
                                  >
                                    {resolvedJournalIssue?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الثانوي (العدد السابق للخلفية)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedJournalSecondCover ? <img src={resolvedJournalSecondCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار الغلاف الثانوي للمجلة", resolvedJournalSecondCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, journalSecondaryIssueId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10 transition text-right"
                                  >
                                    {resolvedJournalSecondIssue?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Text customization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الهيرو (Tag)</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.journalCustomTag || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, journalCustomTag: e.target.value } })}
                                  placeholder="موسم العقيق · النشرة الدورية"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الهيرو الرئيسي</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.journalCustomTitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, journalCustomTitle: e.target.value } })}
                                  placeholder="خبر يُقلب إلى ذكرى."
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الهيرو لصفحة المجلة</label>
                              <textarea
                                rows={2}
                                value={orchestrationForm.heroCovers.journalCustomDesc || ""}
                                onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, journalCustomDesc: e.target.value } })}
                                placeholder="رفوف رقمية تجمع أعداد مجلة ونشرات مدارس العقيق الأهلية..."
                                className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 3: ALBUMS PAGE COVER */}
                      {heroActiveCoverTab === "albums" && (
                        <div className="space-y-4">
                          {/* Live 2-card Preview of /albums */}
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60" : "border-black/5 bg-slate-900 text-white"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-emerald-400">معاينة هيرو صفحة ألبوم العقيق (/albums)</span>
                              <a href="/albums" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline">
                                <span>معاينة الصفحة الحية</span>
                                <ArrowUpLeft size={13} />
                              </a>
                            </div>

                            <div className="relative mx-auto h-[180px] w-full max-w-[360px]">
                              {/* Secondary Tilted Card (Back) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار الغلاف الثانوي للألبومات (الألبوم السابق)", resolvedAlbumSecondCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, albumsSecondaryAlbumId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute left-[6%] top-[8%] h-[80%] w-[58%] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] opacity-60 transition duration-300 hover:scale-105 hover:opacity-100 shadow-xl"
                                style={{ transform: "rotate(-7deg)" }}
                                title="انقر لتغيير الغلاف الثانوي (الألبوم السابق)"
                              >
                                {resolvedAlbumSecondCover ? (
                                  <img src={resolvedAlbumSecondCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-500 font-bold">الألبوم السابق</div>
                                )}
                              </div>

                              {/* Primary Card (Front) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف ألبوم العقيق الرئيسي", resolvedAlbumCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, albumsMode: "custom", customAlbumId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-1 right-[6%] h-[88%] w-[68%] cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-400/80 bg-[#111] p-1.5 shadow-2xl transition duration-300 hover:scale-105"
                                style={{ transform: "rotate(3deg)" }}
                                title="انقر لتغيير الغلاف الرئيسي للألبوم"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedAlbumCover ? (
                                    <img src={resolvedAlbumCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-emerald-400 font-bold">الألبوم الحالي</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-[10px] font-black text-white truncate">{resolvedAlb?.title || "الألبوم الحالي"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-300">نمط اختيار غلاف الألبومات</label>
                              <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, albumsMode: "auto" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.albumsMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  تلقائي (الأحدث)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, albumsMode: "custom" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.albumsMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  غلاف مخصص
                                </button>
                              </div>
                            </div>

                            {/* Primary and Secondary cover selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الأساسي (الألبوم المميز)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedAlbumCover ? <img src={resolvedAlbumCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار غلاف ألبوم العقيق الرئيسي", resolvedAlbumCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, albumsMode: "custom", customAlbumId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-400 hover:bg-emerald-400 hover:text-black transition text-right"
                                  >
                                    {resolvedAlb?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الثانوي (الألبوم السابق للخلفية)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedAlbumSecondCover ? <img src={resolvedAlbumSecondCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار الغلاف الثانوي للألبومات", resolvedAlbumSecondCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, albumsSecondaryAlbumId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10 transition text-right"
                                  >
                                    {resolvedAlbSecond?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Text customization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الهيرو (Tag)</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.albumsCustomTag || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, albumsCustomTag: e.target.value } })}
                                  placeholder="موسم العقيق · أرشيف الفعاليات"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الهيرو الرئيسي</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.albumsCustomTitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, albumsCustomTitle: e.target.value } })}
                                  placeholder="كل فعالية تحفظ لحظتها."
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الهيرو لصفحة الألبومات</label>
                              <textarea
                                rows={2}
                                value={orchestrationForm.heroCovers.albumsCustomDesc || ""}
                                onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, albumsCustomDesc: e.target.value } })}
                                placeholder="رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق..."
                                className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 4: SHOWCASE & NEWS PAGE COVER */}
                      {heroActiveCoverTab === "showcase" && (
                        <div className="space-y-4">
                          {/* Live 2-card Preview of /offers */}
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60" : "border-black/5 bg-slate-900 text-white"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-blue-400">معاينة هيرو صفحة الأخبار والعروض (/offers)</span>
                              <a href="/offers" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:underline">
                                <span>معاينة الصفحة الحية</span>
                                <ArrowUpLeft size={13} />
                              </a>
                            </div>

                            <div className="relative mx-auto h-[180px] w-full max-w-[360px]">
                              {/* Secondary Tilted Card (Back) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار الغلاف الثانوي للأخبار (المنشور السابق)", resolvedShowcaseSecondCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, showcaseSecondaryPostId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute left-[6%] top-[8%] h-[80%] w-[58%] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] opacity-60 transition duration-300 hover:scale-105 hover:opacity-100 shadow-xl"
                                style={{ transform: "rotate(-7deg)" }}
                                title="انقر لتغيير الغلاف الثانوي (المنشور السابق)"
                              >
                                {resolvedShowcaseSecondCover ? (
                                  <img src={resolvedShowcaseSecondCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-500 font-bold">المنشور السابق</div>
                                )}
                              </div>

                              {/* Primary Card (Front) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار غلاف الأخبار والعروض الرئيسي", resolvedShowcaseCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, showcaseMode: "custom", customShowcasePostId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-1 right-[6%] h-[88%] w-[68%] cursor-pointer overflow-hidden rounded-2xl border-2 border-blue-400/80 bg-[#111] p-1.5 shadow-2xl transition duration-300 hover:scale-105"
                                style={{ transform: "rotate(3deg)" }}
                                title="انقر لتغيير الغلاف الرئيسي للأخبار"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedShowcaseCover ? (
                                    <img src={resolvedShowcaseCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-blue-400 font-bold">الخبر الحالي</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-[10px] font-black text-white truncate">{resolvedPost?.title || "أحدث خبر ومنشور"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-300">نمط اختيار غلاف الأخبار والعروض</label>
                              <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseMode: "auto" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.showcaseMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  تلقائي (الأحدث)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseMode: "custom" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.showcaseMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  غلاف مخصص
                                </button>
                              </div>
                            </div>

                            {/* Primary and Secondary cover selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الأساسي (الخبر / المنشور المميز)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedShowcaseCover ? <img src={resolvedShowcaseCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار غلاف الأخبار والعروض الرئيسي", resolvedShowcaseCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, showcaseMode: "custom", customShowcasePostId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-2 text-xs font-black text-blue-400 hover:bg-blue-400 hover:text-black transition text-right"
                                  >
                                    {resolvedPost?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الغلاف الثانوي (المنشور السابق للخلفية)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedShowcaseSecondCover ? <img src={resolvedShowcaseSecondCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار الغلاف الثانوي للأخبار", resolvedShowcaseSecondCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, showcaseSecondaryPostId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10 transition text-right"
                                  >
                                    {resolvedPostSecond?.title || "اختر من الوسائط..."}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Text customization */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الهيرو (Tag)</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.showcaseCustomTag || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseCustomTag: e.target.value } })}
                                  placeholder="العقيق · الأخبار والعروض"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">العنوان الأول</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.showcaseCustomTitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseCustomTitle: e.target.value } })}
                                  placeholder="الأخبار والعروض"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">السطر الذهبي المميز</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.showcaseCustomSubtitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseCustomSubtitle: e.target.value } })}
                                  placeholder="كل جديد، أولًا بأول."
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الهيرو لصفحة الأخبار والعروض</label>
                              <textarea
                                rows={2}
                                value={orchestrationForm.heroCovers.showcaseCustomDesc || ""}
                                onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, showcaseCustomDesc: e.target.value } })}
                                placeholder="رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق وعروضها..."
                                className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* SUBTAB 5: ARTICLES PAGE COVER */}
                      {heroActiveCoverTab === "articles" && (
                        <div className="space-y-4">
                          {/* Live 2-card Preview of /articles */}
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60" : "border-black/5 bg-slate-900 text-white"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-amber-400">معاينة هيرو صفحة المقالات والأقلام (/articles)</span>
                              <a href="/articles" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline">
                                <span>معاينة الصفحة الحية</span>
                                <ArrowUpLeft size={13} />
                              </a>
                            </div>

                            <div className="relative mx-auto h-[180px] w-full max-w-[360px]">
                              {/* Secondary Tilted Card (Back) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار المقال الثانوي للهيرو (الخلفية)", resolvedArticleSecondCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, articlesSecondaryArticleId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute left-[6%] top-[8%] h-[80%] w-[58%] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] opacity-60 transition duration-300 hover:scale-105 hover:opacity-100 shadow-xl"
                                style={{ transform: "rotate(-7deg)" }}
                                title="انقر لتغيير المقال الثانوي"
                              >
                                {resolvedArticleSecondCover ? (
                                  <img src={resolvedArticleSecondCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-500 font-bold">المقال السابق</div>
                                )}
                              </div>

                              {/* Primary Card (Front) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار مقال الهيرو الرئيسي", resolvedArticleCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, articlesMode: "custom", customArticleId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-1 right-[6%] h-[88%] w-[68%] cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-[#111] p-1.5 shadow-2xl transition duration-300 hover:scale-105"
                                style={{ transform: "rotate(3deg)" }}
                                title="انقر لتغيير المقال المميز الرئيسي"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedArticleCover ? (
                                    <img src={resolvedArticleCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-amber-400 font-bold">المقال المميز</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-[10px] font-black text-white truncate">{resolvedArt?.title || "أحدث مقال أدبي"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-300">نمط اختيار غلاف مقالات العقيق</label>
                              <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, articlesMode: "auto" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.articlesMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  تلقائي (الأحدث)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, articlesMode: "custom" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.articlesMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  مخصص
                                </button>
                              </div>
                            </div>

                            {/* Pickers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-amber-400">المقال الرئيسي (الغلاف الأول)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedArticleCover ? <img src={resolvedArticleCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار مقال الهيرو الرئيسي", resolvedArticleCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, articlesMode: "custom", customArticleId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-400 hover:bg-amber-400 hover:text-black transition text-right"
                                  >
                                    {resolvedArt?.title || "اختر من المقالات..."}
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">المقال الثانوي (الخلفية المائلة)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedArticleSecondCover ? <img src={resolvedArticleSecondCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار المقال الثانوي", resolvedArticleSecondCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, articlesSecondaryArticleId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10 transition text-right"
                                  >
                                    {resolvedArtSecond?.title || "اختر من المقالات..."}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Text customization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الهيرو (Tag)</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.articlesCustomTag || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, articlesCustomTag: e.target.value } })}
                                  placeholder="موسم العقيق · مقالات وأقلام"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الهيرو الرئيسي</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.articlesCustomTitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, articlesCustomTitle: e.target.value } })}
                                  placeholder="أقلام تفيض فكراً وإبداعاً."
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الهيرو لصفحة المقالات</label>
                              <textarea
                                rows={2}
                                value={orchestrationForm.heroCovers.articlesCustomDesc || ""}
                                onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, articlesCustomDesc: e.target.value } })}
                                placeholder="رفوف ثقافية ومساحة أدبية تفاعلية نبرز فيها كتابات طلاب مدارس العقيق..."
                                className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 6: PODCAST & BROADCAST PAGE COVER */}
                      {heroActiveCoverTab === "podcasts" && (
                        <div className="space-y-4">
                          {/* Live 2-card Preview of /podcast */}
                          <div className={"relative overflow-hidden rounded-2xl border p-4 sm:p-5 " + (
                            dark ? "border-white/10 bg-black/60" : "border-black/5 bg-slate-900 text-white"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-purple-400">معاينة هيرو صفحة أثير العقيق (/atheer)</span>
                              <a href="/podcast" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:underline">
                                <span>معاينة الصفحة الحية</span>
                                <ArrowUpLeft size={13} />
                              </a>
                            </div>

                            <div className="relative mx-auto h-[180px] w-full max-w-[360px]">
                              {/* Secondary Tilted Card (Back) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار الحلقة الثانوية للهيرو (الخلفية)", resolvedPodcastSecondCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, podcastsSecondaryPodcastId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute left-[6%] top-[8%] h-[80%] w-[58%] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#111] opacity-60 transition duration-300 hover:scale-105 hover:opacity-100 shadow-xl"
                                style={{ transform: "rotate(-7deg)" }}
                                title="انقر لتغيير الحلقة الثانوية"
                              >
                                {resolvedPodcastSecondCover ? (
                                  <img src={resolvedPodcastSecondCover} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="grid h-full place-items-center text-[10px] text-slate-500 font-bold">الحلقة السابقة</div>
                                )}
                              </div>

                              {/* Primary Card (Front) */}
                              <div
                                onClick={() => {
                                  openMediaPicker("اختيار حلقة البودكاست الرئيسية", resolvedPodcastCover, (item) => {
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      heroCovers: { ...orchestrationForm.heroCovers, podcastsMode: "custom", customPodcastId: item.rawId },
                                    });
                                  });
                                }}
                                className="group absolute bottom-1 right-[6%] h-[88%] w-[68%] cursor-pointer overflow-hidden rounded-2xl border-2 border-purple-400/80 bg-[#111] p-1.5 shadow-2xl transition duration-300 hover:scale-105"
                                style={{ transform: "rotate(3deg)" }}
                                title="انقر لتغيير حلقة البودكاست المميزة"
                              >
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                  {resolvedPodcastCover ? (
                                    <img src={resolvedPodcastCover} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-[10px] text-purple-400 font-bold">الحلقة المميزة</div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-[10px] font-black text-white truncate">{resolvedPod?.title || "أحدث حلقة بودكاست"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-300">نمط اختيار غلاف البودكاست والإذاعة</label>
                              <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, podcastsMode: "auto" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.podcastsMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  تلقائي (الأحدث)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, podcastsMode: "custom" } })}
                                  className={"rounded px-2.5 py-1 transition " + (orchestrationForm.heroCovers.podcastsMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                                >
                                  مخصص
                                </button>
                              </div>
                            </div>

                            {/* Pickers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-purple-400">الحلقة الرئيسية (الغلاف الأول)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedPodcastCover ? <img src={resolvedPodcastCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار حلقة البودكاست الرئيسية", resolvedPodcastCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, podcastsMode: "custom", customPodcastId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-2 text-xs font-black text-purple-400 hover:bg-purple-400 hover:text-black transition text-right"
                                  >
                                    {resolvedPod?.title || "اختر من الحلقات..."}
                                  </button>
                                </div>
                              </div>

                              <div className="rounded-xl border border-current/10 p-3 space-y-2">
                                <label className="block text-[11px] font-black text-slate-400">الحلقة الثانوية (الخلفية المائلة)</label>
                                <div className="flex items-center gap-2">
                                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10">
                                    {resolvedPodcastSecondCover ? <img src={resolvedPodcastSecondCover} alt="" className="h-full w-full object-cover" /> : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openMediaPicker("اختيار الحلقة الثانوية", resolvedPodcastSecondCover, (item) => {
                                        setOrchestrationForm({
                                          ...orchestrationForm,
                                          heroCovers: { ...orchestrationForm.heroCovers, podcastsSecondaryPodcastId: item.rawId },
                                        });
                                      });
                                    }}
                                    className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10 transition text-right"
                                  >
                                    {resolvedPodSecond?.title || "اختر من الحلقات..."}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Text customization */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الهيرو (Tag)</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.podcastsCustomTag || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, podcastsCustomTag: e.target.value } })}
                                  placeholder="أثير العقيق الرقمي · إذاعة وبودكاست"
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الهيرو الرئيسي</label>
                                <input
                                  type="text"
                                  value={orchestrationForm.heroCovers.podcastsCustomTitle || ""}
                                  onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, podcastsCustomTitle: e.target.value } })}
                                  placeholder="صوت ينبض بالحياة والإبداع."
                                  className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الهيرو لصفحة البودكاست</label>
                              <textarea
                                rows={2}
                                value={orchestrationForm.heroCovers.podcastsCustomDesc || ""}
                                onChange={(e) => setOrchestrationForm({ ...orchestrationForm, heroCovers: { ...orchestrationForm.heroCovers, podcastsCustomDesc: e.target.value } })}
                                placeholder="استمع وشاهد حلقات الإذاعة الصباحية، واللقاءات الحوارية التربوية..."
                                className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 2. WEEKLY BENTO HIGHLIGHTS */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between border-b pb-4 border-current/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#de191e] to-[#f8ca14] text-white">
                      <Flame size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">سيكشن إنجازات وبينتو الأسبوع</h3>
                      <p className="text-xs font-bold text-slate-400">الكارت المميز، وسام التميز، وعداد الإعجابات</p>
                    </div>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={orchestrationForm.weeklyBento.enabled}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, enabled: e.target.checked } })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[] peer-checked:bg-emerald-500 peer-checked:after:-translate-x-5" />
                  </label>
                </div>

                {/* Featured Story Picker */}
                <div className="space-y-2.5 rounded-2xl border border-current/10 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-300">الخبر / الفعالية المعروضة بالكارت الكبير</label>
                    <div className="flex items-center gap-1 rounded-lg border border-current/10 p-0.5 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, featuredMode: "auto" } })}
                        className={"rounded px-2 py-0.5 transition " + (orchestrationForm.weeklyBento.featuredMode === "auto" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                      >
                        تلقائي
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, featuredMode: "custom" } })}
                        className={"rounded px-2 py-0.5 transition " + (orchestrationForm.weeklyBento.featuredMode === "custom" ? "bg-[#f8ca14] text-black" : "text-slate-400")}
                      >
                        مخصص
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    {(() => {
                      const selectedPost = showcaseData?.posts?.find((p) => p.id === orchestrationForm.weeklyBento.customPostId) || showcaseData?.posts?.[0];
                      const cover = directDriveImage(selectedPost?.thumbnailUrl) || selectedPost?.thumbnailUrl || selectedPost?.mediaUrl;
                      return (
                        <>
                          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-current/10 bg-black/40">
                            {cover ? <img src={cover} alt="تغطية الفعالية" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-[10px]">لا يوجد</div>}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <p className="text-xs font-black truncate">{selectedPost?.title || "أحدث خبر في البينتو"}</p>
                            <button
                              type="button"
                              onClick={() => {
                                openMediaPicker("اختيار خبر أو فعالية لسيكشن الإنجازات", cover, (item) => {
                                  setOrchestrationForm({
                                    ...orchestrationForm,
                                    weeklyBento: {
                                      ...orchestrationForm.weeklyBento,
                                      featuredMode: "custom",
                                      customPostId: item.rawId,
                                      customTitle: orchestrationForm.weeklyBento.customTitle || item.title,
                                    },
                                  });
                                });
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#f8ca14]/30 bg-[#f8ca14]/10 px-3 py-1 text-[11px] font-black text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black transition"
                            >
                              <ImageIcon size={12} />
                              <span>تصفح واختيار من الوسائط</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان الكارت المخصص</label>
                      <input
                        type="text"
                        value={orchestrationForm.weeklyBento.customTitle || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, customTitle: e.target.value } })}
                        placeholder="انطلاق فعاليات الأسبوع العلمي..."
                        className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">شارة الكارت (Tag)</label>
                      <input
                        type="text"
                        value={orchestrationForm.weeklyBento.customTag || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, customTag: e.target.value } })}
                        placeholder="تغطية الأسبوع الكبرى..."
                        className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">وصف الكارت المخصص</label>
                    <textarea
                      rows={2}
                      value={orchestrationForm.weeklyBento.customDescription || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, customDescription: e.target.value } })}
                      placeholder="تغطية شاملة للفعاليات وورش العمل..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>

                {/* Academic Badge Customization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">عنوان وسام التميز</label>
                    <input
                      type="text"
                      value={orchestrationForm.weeklyBento.academicBadgeTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, academicBadgeTitle: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رقم أو تسمية الأسبوع</label>
                    <input
                      type="text"
                      value={orchestrationForm.weeklyBento.academicBadgeWeek || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, academicBadgeWeek: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>

                {/* Badge Subtitle & Hearts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 mb-1">وصف إنجاز الوسام</label>
                    <input
                      type="text"
                      value={orchestrationForm.weeklyBento.academicBadgeDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, academicBadgeDesc: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">عداد القلوب</label>
                    <input
                      type="number"
                      value={orchestrationForm.weeklyBento.heartsCount ?? 142}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, weeklyBento: { ...orchestrationForm.weeklyBento, heartsCount: Number(e.target.value) || 0 } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>
              </div>

              {/* 3. NAVIGATION & PAGE NAMES */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center gap-3 border-b pb-4 border-current/10">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">أسماء الصفحات وروابط الهيدر</h3>
                    <p className="text-xs font-bold text-slate-400">تعديل مسميات الروابط والأقسام في شريط الموقع</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم رابط الرئيسية</label>
                    <input
                      type="text"
                      value={orchestrationForm.nav.homeLabel || "الرئيسية"}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, nav: { ...orchestrationForm.nav, homeLabel: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم رابط المجلة</label>
                    <input
                      type="text"
                      value={orchestrationForm.nav.journalLabel || "مجلة العقيق"}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, nav: { ...orchestrationForm.nav, journalLabel: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم رابط الألبوم</label>
                    <input
                      type="text"
                      value={orchestrationForm.nav.albumsLabel || "ألبوم العقيق"}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, nav: { ...orchestrationForm.nav, albumsLabel: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم رابط الأخبار والعروض</label>
                    <input
                      type="text"
                      value={orchestrationForm.nav.showcaseLabel || "الأخبار والعروض"}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, nav: { ...orchestrationForm.nav, showcaseLabel: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>
              </div>

              {/* 4. EDITORIAL VOICE */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between border-b pb-4 border-current/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#08467d] to-[#f8ca14] text-white">
                      <Radio size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">كلمة وصوت المشرف العام</h3>
                      <p className="text-xs font-bold text-slate-400">الرسالة التوجيهية والملف الصوتي بالصفحة الرئيسية</p>
                    </div>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={orchestrationForm.editorialVoice.enabled}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, editorialVoice: { ...orchestrationForm.editorialVoice, enabled: e.target.checked } })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[] peer-checked:bg-emerald-500 peer-checked:after:-translate-x-5" />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-1">نص الكلمة التوجيهية</label>
                  <textarea
                    rows={3}
                    value={orchestrationForm.editorialVoice.quoteText || ""}
                    onChange={(e) => setOrchestrationForm({ ...orchestrationForm, editorialVoice: { ...orchestrationForm.editorialVoice, quoteText: e.target.value } })}
                    className={"w-full rounded-xl border p-3 text-xs font-bold outline-none leading-relaxed " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">اسم القائل</label>
                    <input
                      type="text"
                      value={orchestrationForm.editorialVoice.authorName || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, editorialVoice: { ...orchestrationForm.editorialVoice, authorName: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={orchestrationForm.editorialVoice.authorTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, editorialVoice: { ...orchestrationForm.editorialVoice, authorTitle: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-1">رابط الملف الصوتي للكلمة (Audio URL)</label>
                  <input
                    type="url"
                    value={orchestrationForm.editorialVoice.audioUrl || ""}
                    onChange={(e) => setOrchestrationForm({ ...orchestrationForm, editorialVoice: { ...orchestrationForm.editorialVoice, audioUrl: e.target.value || null } })}
                    placeholder="https://.../speech.mp3"
                    className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                  />
                </div>
              </div>

              {/* 4.5. SCHOOL ANTHEMS & SPOTIFY AUDIO PLAYLIST */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-current/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-black">
                      <Headphones size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">مكتبة أغاني وأناشيد العقيق (Spotify Audio)</h3>
                      <p className="text-xs font-bold text-slate-400">إدارة الأغاني والأناشيد والموسيقى للمشغل الصوتي الموحد</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setDriveAudioFolderUrl("");
                        setScannedAudioTracks([]);
                        setSelectedTrackIds({});
                        setIsImportAudioFolderOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition shadow-md shrink-0"
                      title="استيراد مجلد أغانٍ كامل من Google Drive"
                    >
                      <FolderSync size={15} />
                      <span>استيراد فولدر من Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewSongTitle("");
                        setNewSongArtist("");
                        setNewSongUrl("");
                        setNewSongCategory("النشيد المدرسي");
                        setNewSongCover("");
                        setIsAddSongOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 transition shrink-0"
                    >
                      <Plus size={15} />
                      <span>إضافة نشيد منفرد</span>
                    </button>
                  </div>
                </div>

                {/* List of Current Songs */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {(orchestrationForm.schoolSongs || []).map((song: any, idx: number) => (
                    <div
                      key={song.id || idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                        dark ? "border-white/10 bg-black/40 hover:border-white/20" : "border-black/5 bg-slate-50 hover:border-black/15"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black shadow-sm">
                          <img
                            src={
                              (!song.coverUrl || song.coverUrl.includes("logo") || song.coverUrl.includes("og-"))
                                ? (dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg")
                                : (directDriveImage(song.coverUrl) || song.coverUrl)
                            }
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate">{song.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{song.artist || "مدارس العقيق"} · {song.category || "نشيد"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (orchestrationForm.schoolSongs || []).filter((_: any, i: number) => i !== idx);
                            setOrchestrationForm({ ...orchestrationForm, schoolSongs: updated });
                            toast.info("تم حذف الأغنية من القائمة مؤقتاً، اضغط حفظ التعديلات لتأكيد الحفظ.");
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="حذف الأغنية"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!orchestrationForm.schoolSongs || orchestrationForm.schoolSongs.length === 0) && (
                    <p className="text-center py-6 text-xs text-slate-400 font-bold">لا توجد أغاني مضافة حالياً. أضف أول نشيد الآن!</p>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>ملاحظة:</strong> المشغل الذكي في الموقع يقوم تلقائياً بتشغيل الأغاني والانتقال بينها، وإذا قام الزائر بتشغيل بودكاست، يتم إيقاف الأغنية مؤقتاً، وبعد انتهاء البودكاست يُسأل الزائر فوراً إن كان يود العودة للأغنية أو البودكاست التالي.
                </p>
              </div>

              {/* 5. SECTIONS VISIBILITY & TITLES */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md lg:col-span-2 " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center gap-3 border-b pb-4 border-current/10">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">عناوين ووصف ومفاتيح ظهور السكاشن</h3>
                    <p className="text-xs font-bold text-slate-400">إظهار أو إخفاء أي قسم وتعديل عنوانه ووصفه</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. News Marquee */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">شريط الأخبار المتحرك</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.marqueeEnabled !== false}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, marqueeEnabled: e.target.checked } })}
                      />
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.marqueeBadge || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, marqueeBadge: e.target.value } })}
                      placeholder="شارة شريط الأخبار (مثل: آخر الأخبار)..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <p className="text-[11px] text-slate-400">شريط متحرك يعرض أحدث العناوين من المقالات والبودكاست والألبومات والمجلات تلقائياً.</p>
                  </div>

                  {/* 2. Studio Highlights Bento */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن جديد الاستوديو (Bento Grid)</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.studioHighlightsEnabled !== false}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, studioHighlightsEnabled: e.target.checked } })}
                      />
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.studioHighlightsTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, studioHighlightsTitle: e.target.value } })}
                      placeholder="عنوان جديد الاستوديو..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <textarea
                      rows={2}
                      value={orchestrationForm.sections.studioHighlightsDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, studioHighlightsDesc: e.target.value } })}
                      placeholder="وصف جديد الاستوديو..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                  </div>

                  {/* 3. Explore Library Tabs */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن استكشف المكتبة (Tabs Library)</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.libraryEnabled !== false}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, libraryEnabled: e.target.checked } })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={orchestrationForm.sections.libraryTitle || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, libraryTitle: e.target.value } })}
                        placeholder="عنوان استكشف المكتبة..."
                        className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                      />
                      <input
                        type="text"
                        value={orchestrationForm.sections.libraryDesc || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, libraryDesc: e.target.value } })}
                        placeholder="وصف استكشف المكتبة..."
                        className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                      />
                    </div>
                  </div>

                  {/* Journal Section */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن مجلة العقيق</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.pathwaysEnabled}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, pathwaysEnabled: e.target.checked } })}
                      />
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.journalSectionTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, journalSectionTitle: e.target.value } })}
                      placeholder="عنوان السيكشن..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <textarea
                      rows={2}
                      value={orchestrationForm.sections.journalSectionDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, journalSectionDesc: e.target.value } })}
                      placeholder="وصف السيكشن..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                  </div>

                  {/* Albums Section */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن ألبوم الفعاليات</span>
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.albumsSectionTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, albumsSectionTitle: e.target.value } })}
                      placeholder="عنوان السيكشن..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <textarea
                      rows={2}
                      value={orchestrationForm.sections.albumsSectionDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, albumsSectionDesc: e.target.value } })}
                      placeholder="وصف السيكشن..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                  </div>

                  {/* Memory Wall Section */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن حائط الذكريات</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.memoryWallEnabled}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, memoryWallEnabled: e.target.checked } })}
                      />
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.memoryWallTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, memoryWallTitle: e.target.value } })}
                      placeholder="عنوان حائط الذكريات..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <textarea
                      rows={2}
                      value={orchestrationForm.sections.memoryWallDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, memoryWallDesc: e.target.value } })}
                      placeholder="وصف حائط الذكريات..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                  </div>

                  {/* Archive Section */}
                  <div className="space-y-2 rounded-2xl border border-current/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">سيكشن إحصائيات الأرشيف</span>
                      <input
                        type="checkbox"
                        checked={orchestrationForm.sections.archiveStatsEnabled}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, archiveStatsEnabled: e.target.checked } })}
                      />
                    </div>
                    <input
                      type="text"
                      value={orchestrationForm.sections.archiveTitle || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, archiveTitle: e.target.value } })}
                      placeholder="عنوان الأرشيف..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                    <textarea
                      rows={2}
                      value={orchestrationForm.sections.archiveDesc || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, sections: { ...orchestrationForm.sections, archiveDesc: e.target.value } })}
                      placeholder="وصف الأرشيف..."
                      className={"w-full rounded-xl border p-2 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>
              </div>

              {/* 6. SOCIAL & FOOTER */}
              <div
                className={"rounded-3xl border p-6 sm:p-7 space-y-6 shadow-md lg:col-span-2 " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center gap-3 border-b pb-4 border-current/10">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-emerald-600 text-black font-black">
                    @
                  </div>
                  <div>
                    <h3 className="text-base font-black">قنوات التواصل والواتساب وحقوق الفوتر</h3>
                    <p className="text-xs font-bold text-slate-400">تحديث الروابط الرسمية ونصوص الحقوق أسفل الموقع</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رابط منصة 𝕏</label>
                    <input
                      type="url"
                      value={orchestrationForm.social.xUrl || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, xUrl: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رابط Instagram</label>
                    <input
                      type="url"
                      value={orchestrationForm.social.instagramUrl || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, instagramUrl: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رابط سناب شات (Snapchat)</label>
                    <input
                      type="url"
                      value={orchestrationForm.social.snapchatUrl || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, snapchatUrl: e.target.value } })}
                      placeholder="https://snapchat.com/add/..."
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رابط فيسبوك (Facebook)</label>
                    <input
                      type="url"
                      value={orchestrationForm.social.facebookUrl || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, facebookUrl: e.target.value } })}
                      placeholder="https://facebook.com/..."
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رابط YouTube</label>
                    <input
                      type="url"
                      value={orchestrationForm.social.youtubeUrl || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, youtubeUrl: e.target.value } })}
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-1">رقم واتساب المدارس</label>
                    <input
                      type="text"
                      value={orchestrationForm.social.whatsappNumber || ""}
                      onChange={(e) => setOrchestrationForm({ ...orchestrationForm, social: { ...orchestrationForm.social, whatsappNumber: e.target.value } })}
                      placeholder="966500000000"
                      className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-1">نص حقوق الملكية بالفوتر</label>
                  <input
                    type="text"
                    value={orchestrationForm.footer.copyrightText || ""}
                    onChange={(e) => setOrchestrationForm({ ...orchestrationForm, footer: { ...orchestrationForm.footer, copyrightText: e.target.value } })}
                    className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                  />
                </div>

                {/* Location Settings */}
                <div className="space-y-3 rounded-2xl border border-current/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                      <span className="text-xs font-black">وسم ورابط موقع المدارس (Google Maps)</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={orchestrationForm.location?.enabled !== false}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, location: { ...orchestrationForm.location, enabled: e.target.checked } })}
                        className="peer sr-only"
                      />
                      <div className="peer h-5 w-9 rounded-full bg-slate-700 after:absolute after:top-[2px] after:right-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[] peer-checked:bg-emerald-500 peer-checked:after:-translate-x-4" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">نص الموقع بالفوتر</label>
                      <input
                        type="text"
                        value={orchestrationForm.location?.text || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, location: { ...orchestrationForm.location, text: e.target.value } })}
                        placeholder="المدينة المنورة · المملكة العربية السعودية"
                        className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 mb-1">رابط خرائط Google Maps</label>
                      <input
                        type="url"
                        value={orchestrationForm.location?.mapUrl || ""}
                        onChange={(e) => setOrchestrationForm({ ...orchestrationForm, location: { ...orchestrationForm.location, mapUrl: e.target.value } })}
                        placeholder="https://maps.google.com/?q=..."
                        className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="border-t pt-6 border-current/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setOrchestrationMutation.mutate(orchestrationForm);
                }}
                disabled={setOrchestrationMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-8 py-3 text-sm font-black text-black transition hover:bg-yellow-400 shadow-xl shadow-[#f8ca14]/20"
              >
                <CheckCircle2 size={18} />
                <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر جميع التعديلات فوراً"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 1: RADAR & STATS ==================== */}
        {activeTab === "radar" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* AI Yearbook Super Feature Banner */}
            <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-2xl ${
              dark 
                ? "bg-gradient-to-r from-[#111] via-[#1a1508] to-[#111] border border-[#e5b84f]/20" 
                : "bg-gradient-to-r from-slate-50 via-amber-50 to-slate-50 border border-[#e5b84f]/30"
            }`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-right max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold bg-[#e5b84f]/10 text-[#e5b84f] mb-4">
                    <Sparkles size={14} />
                    <span>ميزة تجريبية خارقة (Beta)</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black font-['Tajawal'] mb-3">
                    السجل السنوي المخصص بالذكاء الاصطناعي 🎓
                  </h3>
                  <p className={`text-sm sm:text-base font-bold leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    أول نظام في الشرق الأوسط يقوم بتوليد "مجلة تخرج" أو "سجل سنوي" فردي وحصري لكل طالب بناءً على بصمته الرقمية، إنجازاته، وصوره من نظام التعرف على الوجوه.
                  </p>
                </div>
                <button
                  onClick={() => setIsYearbookOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-gradient-to-l from-[#e5b84f] to-[#c59c3a] text-black font-black text-lg shadow-[0_0_40px_rgba(229,184,79,0.4)] hover:scale-105 hover:shadow-[0_0_60px_rgba(229,184,79,0.6)] transition-all"
                >
                  <Wand2 size={24} />
                  <span>توليد السجلات الذكية</span>
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Views */}
              <div
                className={"relative overflow-hidden rounded-3xl border p-6 shadow-md " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">إجمالي المشاهدات والتفاعل</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#08467d] to-[#0e6cbd] text-white">
                    <Eye size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{stats?.totalViews?.toLocaleString() || 0}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>تحديث لحظي مستمر</span>
                </div>
              </div>

              {/* 2. Magazines */}
              <div
                className={"relative overflow-hidden rounded-3xl border p-6 shadow-md " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">أعداد مجلة العقيق</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#f8ca14] to-[#e5b204] text-black">
                    <BookOpen size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{stats?.totalIssues || 0}</p>
                <p className="mt-2 text-[11px] font-bold text-slate-400">عدد مجلة منشور بالأرشيف</p>
              </div>

              {/* 3. Albums */}
              <div
                className={"relative overflow-hidden rounded-3xl border p-6 shadow-md " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">ألبومات الفعاليات</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                    <Camera size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{stats?.totalAlbums || 0}</p>
                <p className="mt-2 text-[11px] font-bold text-slate-400">ألبوم فعالية ومناسبة</p>
              </div>

              {/* 4. Media Files */}
              <div
                className={"relative overflow-hidden rounded-3xl border p-6 shadow-md " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">الأخبار والوسائط الموثقة</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white">
                    <Clapperboard size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{stats?.totalMediaFiles || 0}</p>
                <p className="mt-2 text-[11px] font-bold text-slate-400">صورة وفيديو ومنشور</p>
              </div>
            </div>

            {/* Middle Section: 24H Stories Radar + Quick Creator Hub */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 24H Stories Radar Widget */}
              <div
                className={"rounded-3xl border p-6 lg:col-span-2 shadow-md space-y-5 " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#de191e] text-white shadow-md">
                      <Flame size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">رادار واستوريهات اليوم (Stories Hub)</h3>
                      <p className="text-xs font-bold text-slate-400">القصص التفاعلية في قمة الموقع لجميع المحتويات (مقالات، مرئيات، بودكاست، ألبومات، مجلات، سوشيال)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={"rounded-xl px-3 py-1 text-xs font-black " + (
                        stats?.activeStoriesCount
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                      )}
                    >
                      {stats?.activeStoriesCount ? stats.activeStoriesCount + " قصص نشطة" : "لا توجد قصص حالياً"}
                    </span>
                    <Button
                      type="button"
                      onClick={() => setIsStoryPickerOpen(true)}
                      className="gap-2 bg-gradient-to-r from-[#08467d] via-[#367453] to-[#f8ca14] text-white hover:opacity-95 text-xs font-black rounded-xl shadow-md"
                    >
                      <Sparkles size={14} className="text-[#f8ca14]" />
                      <span>اختيار وتفعيل استوريهات</span>
                    </Button>
                  </div>
                </div>

                {stats?.activeStories && stats.activeStories.length > 0 ? (
                  <div className="space-y-4">
                    {/* Visual Stories Row Preview */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none border-b pb-4 border-current/10">
                      {stats.activeStories.slice(0, 12).map((story: any) => (
                        <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 text-center">
                          <div className={"relative p-[2px] rounded-full " + (
                            dark
                              ? "bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d]"
                              : "bg-gradient-to-tr from-[#08467d] via-[#367453] to-[#f8ca14]"
                          )}>
                            <div className={"h-12 w-12 overflow-hidden rounded-full border-2 flex items-center justify-center " + (
                              dark ? "border-black bg-[#151515]" : "border-white bg-slate-100"
                            )}>
                              {story.sourceType === "instagram" ? (
                                <Instagram size={18} className="text-pink-500" />
                              ) : story.sourceType === "x" ? (
                                <span className="font-black text-sm">𝕏</span>
                              ) : story.sourceType === "youtube" ? (
                                <span className="text-xs font-black text-red-500">▶</span>
                              ) : story.imageUrl ? (
                                <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : story.sourceType === "article" ? (
                                <Newspaper size={18} className="text-rose-400" />
                              ) : story.sourceType === "podcast" ? (
                                <Mic size={18} className="text-indigo-400" />
                              ) : story.sourceType === "showcase" ? (
                                <Video size={18} className="text-sky-400" />
                              ) : story.sourceType === "journal" ? (
                                <BookOpen size={18} className="text-amber-400" />
                              ) : story.sourceType === "album" ? (
                                <Camera size={18} className="text-emerald-400" />
                              ) : (
                                <span className="text-[10px] font-black">العقيق</span>
                              )}
                            </div>
                            {story.isPinned ? (
                              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f8ca14] text-[9px] font-black text-black shadow-md">
                                ★
                              </span>
                            ) : (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#367453] border-2 border-black" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 max-w-[60px] truncate">{story.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Active Stories List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                      {stats.activeStories.map((story: any) => (
                        <div
                          key={story.id}
                          className={"flex items-center justify-between gap-3 rounded-2xl border p-3 text-xs " + (
                            dark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-current/10 flex items-center justify-center">
                              {story.sourceType === "instagram" ? (
                                <Instagram size={16} className="text-pink-500" />
                              ) : story.sourceType === "x" ? (
                                <span className="font-black text-xs">𝕏</span>
                              ) : story.imageUrl ? (
                                <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : story.sourceType === "article" ? (
                                <Newspaper size={16} className="text-rose-400" />
                              ) : story.sourceType === "podcast" ? (
                                <Mic size={16} className="text-indigo-400" />
                              ) : story.sourceType === "showcase" ? (
                                <Video size={16} className="text-sky-400" />
                              ) : story.sourceType === "journal" ? (
                                <BookOpen size={16} className="text-amber-400" />
                              ) : story.sourceType === "album" ? (
                                <Camera size={16} className="text-emerald-400" />
                              ) : (
                                <span className="text-[9px] font-black">قصة</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-black truncate">{story.title}</p>
                                {story.isPinned && (
                                  <span className="rounded bg-[#f8ca14]/20 text-[#f8ca14] border border-[#f8ca14]/30 px-1 py-0.2 text-[8px] font-black">مثبتة</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span className="rounded bg-current/10 px-1.5 py-0.5 font-bold text-slate-300">{story.category}</span>
                                <span>{story.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => hideStoryMutation.mutate({ storyId: story.id })}
                              disabled={hideStoryMutation.isPending}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="استبعاد من الاستوريهات"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hidden / Excluded Stories Section */}
                    {stats?.hiddenStories && stats.hiddenStories.length > 0 && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-400" />
                            <h4 className="text-xs font-black text-red-300">القصص المستبعدة مؤقتاً من شريط 24H ({stats.hiddenStories.length})</h4>
                          </div>
                          <span className="text-[10px] text-slate-400">مخفية عن الزوار · يمكنك استعادتها بأي وقت</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {stats.hiddenStories.map((story: any) => (
                            <div
                              key={story.id}
                              className={"flex items-center justify-between gap-2.5 rounded-xl border p-2.5 text-xs " + (
                                dark ? "border-white/10 bg-black/40" : "border-black/5 bg-white"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-current/10 flex items-center justify-center opacity-60">
                                  {story.sourceType === "instagram" ? (
                                    <Instagram size={14} className="text-pink-500" />
                                  ) : story.sourceType === "x" ? (
                                    <span className="font-black text-[11px]">𝕏</span>
                                  ) : story.imageUrl ? (
                                    <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-[8px] font-black">قصة</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black truncate text-slate-400 line-through text-[11px]">{story.title}</p>
                                  <span className="text-[9px] text-slate-500">{story.category}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => unhideStoryMutation.mutate({ storyId: story.id })}
                                disabled={unhideStoryMutation.isPending}
                                className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-400 hover:bg-emerald-500/20 transition"
                                title="استعادة القصة للظهور في الصفحة الرئيسية"
                              >
                                <RefreshCw size={11} />
                                <span>استعادة</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-current/10 p-6 text-center">
                    <p className="text-sm font-bold text-slate-400">
                      بمجرد نشر أي خبر أو عدد مجلة أو ألبوم جديد اليوم، سيظهر كـ Story في قمة الصفحة الرئيسية تلقائياً.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => navigate("/offers/manage")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#08467d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#0b5c9e]"
                      >
                        <span>نشر خبر أو فيديو الآن</span>
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => navigate("/albums/manage")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-600"
                      >
                        <span>إضافة ألبوم فعالية</span>
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Launchpad Hub */}
              <div
                className={"rounded-3xl border p-6 shadow-md " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#08467d] to-[#f8ca14] text-white">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">الوصول السريع للاستوديوهات</h3>
                    <p className="text-xs font-bold text-slate-400">إدارة الأقسام المتخصصة</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    onClick={() => navigate("/journal/manage")}
                    className={"flex w-full items-center justify-between rounded-2xl border p-3.5 transition " + (
                      dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-[#f8ca14]" />
                      <span className="text-xs font-black">استوديو المجلات الدورية</span>
                    </div>
                    <ArrowUpLeft size={14} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => navigate("/albums/manage")}
                    className={"flex w-full items-center justify-between rounded-2xl border p-3.5 transition " + (
                      dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Camera size={18} className="text-emerald-400" />
                      <span className="text-xs font-black">استوديو ألبومات الفعاليات</span>
                    </div>
                    <ArrowUpLeft size={14} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => navigate("/offers/manage")}
                    className={"flex w-full items-center justify-between rounded-2xl border p-3.5 transition " + (
                      dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Clapperboard size={18} className="text-rose-400" />
                      <span className="text-xs font-black">استوديو الأخبار والعروض</span>
                    </div>
                    <ArrowUpLeft size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Activity Log */}
            <div
              className={"rounded-3xl border p-6 shadow-md " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <h3 className="text-sm font-black">سجل العمليات والنشاط الأخير للمشرفين</h3>
                </div>
                <button
                  onClick={() => void refetchStats()}
                  className="text-xs font-bold text-slate-400 hover:text-current flex items-center gap-1"
                >
                  <RefreshCw size={12} /> تحديث
                </button>
              </div>

              <div className="space-y-2">
                {stats?.recentLogs?.length ? (
                  stats.recentLogs.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className={"flex items-center justify-between rounded-xl p-3 text-xs " + (
                        dark ? "bg-white/[0.03]" : "bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#f8ca14]">{log.userName || "مشرف"}</span>
                        <span className="text-slate-400">نفذ إجراء:</span>
                        <code className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-mono">{log.action}</code>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("ar-SA") : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400 font-bold">لا توجد عمليات مسجلة حديثاً</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ADMIN USERS ==================== */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">إدارة المشرفين وفريق العمل</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  إضافة مشرفين جدد بالبريد وكلمة المرور وتعيين الصلاحيات الخاصة بكل عضو
                </p>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-5 py-2.5 text-xs font-black text-black transition hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20"
              >
                <Plus size={16} />
                <span>إضافة مشرف جديد</span>
              </button>
            </div>

            {/* Users Table */}
            <div
              className={"overflow-hidden rounded-3xl border shadow-md " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className={"border-b text-[11px] font-black uppercase text-slate-400 " + (
                    dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                  )}>
                    <tr>
                      <th className="p-4 sm:px-6">المشرف</th>
                      <th className="p-4">اسم الدخول (Username)</th>
                      <th className="p-4">الصلاحية (Role)</th>
                      <th className="p-4">آخر تسجيل دخول</th>
                      <th className="p-4 sm:px-6 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/5">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-white/[0.02] transition">
                        {/* Name & Email */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-[#08467d] to-[#f8ca14] text-white font-black text-sm">
                              {usr.name?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-black text-sm">{usr.name || "مستخدم"}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{usr.email || "بدون بريد"}</p>
                            </div>
                          </div>
                        </td>

                        {/* OpenId */}
                        <td className="p-4 font-mono font-bold text-slate-300">
                          {usr.openId}
                        </td>

                        {/* Role */}
                        <td className="p-4">
                          <span
                            className={"inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black " + (
                              usr.role === "admin"
                                ? "bg-[#f8ca14]/20 text-[#f8ca14] border border-[#f8ca14]/30"
                                : usr.role === "coordinator"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            )}
                          >
                            <ShieldCheck size={12} />
                            {usr.role === "admin"
                              ? "مشرف عام"
                              : usr.role === "coordinator"
                              ? "منسق إعلامي"
                              : usr.role === "receptionist"
                              ? "مسؤول حضور"
                              : usr.role}
                          </span>
                        </td>

                        {/* Last Sign In */}
                        <td className="p-4 text-slate-400 text-[11px] font-bold">
                          {usr.lastSignedIn ? new Date(usr.lastSignedIn).toLocaleDateString("ar-SA") : "لم يسجل بعد"}
                        </td>

                        {/* Actions */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setResetPassUserId(usr.id);
                                setNewPasswordValue("");
                              }}
                              className={"grid h-8 w-8 place-items-center rounded-lg border transition " + (
                                dark
                                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-[#f8ca14] hover:text-black"
                                  : "border-black/10 bg-slate-100 text-slate-700 hover:bg-[#08467d] hover:text-white"
                              )}
                              title="تغيير كلمة المرور"
                            >
                              <Key size={14} />
                            </button>

                            <button
                              onClick={() => setDeleteUserId(usr.id)}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                              title="حذف المشرف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MASTER CONTENT GRID ==================== */}
        {activeTab === "content" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">الجدول الموحد لإدارة كل المحتوى</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  عرض وتعديل والوصول السريع لجميع المجلات والألبومات والأخبار في شاشة واحدة
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className={"flex items-center gap-2 rounded-xl border px-3 py-1.5 " + (
                    dark ? "border-white/10 bg-black/40" : "border-black/10 bg-white shadow-sm"
                  )}
                >
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder="بحث في العناوين..."
                    className="bg-transparent text-xs outline-none w-36 sm:w-48 font-bold"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-current/10 p-1">
                  {[
                    { id: "all", label: "الكل" },
                    { id: "journal", label: "المجلات" },
                    { id: "album", label: "الألبومات" },
                    { id: "post", label: "الأخبار" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setContentTypeFilter(tab.id as any)}
                      className={"rounded-lg px-2.5 py-1 text-[11px] font-black transition " + (
                        contentTypeFilter === tab.id
                          ? dark
                            ? "bg-[#f8ca14] text-black"
                            : "bg-[#08467d] text-white"
                          : "text-slate-400 hover:text-current"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Master Content Table */}
            <div
              className={"overflow-hidden rounded-3xl border shadow-md " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className={"border-b text-[11px] font-black uppercase text-slate-400 " + (
                    dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                  )}>
                    <tr>
                      <th className="p-4 sm:px-6">المحتوى والغلاف</th>
                      <th className="p-4">النوع</th>
                      <th className="p-4">التاريخ / الموسم</th>
                      <th className="p-4">الحجم / الملفات</th>
                      <th className="p-4">المشاهدات</th>
                      <th className="p-4 sm:px-6 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/5">
                    {filteredContent.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        {/* Cover + Title */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-current/10 bg-black">
                              {item.coverUrl ? (
                                <img
                                  src={directDriveImage(item.coverUrl) || item.coverUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-slate-500">
                                  {item.type === "journal" ? <BookOpen size={16} /> : item.type === "album" ? <Camera size={16} /> : <Clapperboard size={16} />}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-black text-sm truncate">{item.title}</p>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="p-4">
                          <span
                            className={"inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black " + (
                              item.type === "journal"
                                ? "bg-[#f8ca14]/20 text-[#f8ca14]"
                                : item.type === "album"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            )}
                          >
                            {item.typeLabel}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-slate-300 font-bold">{item.date || "—"}</td>

                        {/* Count */}
                        <td className="p-4 text-slate-300 font-bold">
                          {item.count ? item.count + (item.type === "journal" ? " صفحة" : " ملف") : "—"}
                        </td>

                        {/* Views */}
                        <td className="p-4 font-mono font-bold text-[#f8ca14]">
                          {item.viewsCount?.toLocaleString() || 0}
                        </td>

                        {/* Actions */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={item.viewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={"grid h-8 w-8 place-items-center rounded-lg border transition " + (
                                dark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                              )}
                              title="معاينة في الموقع"
                            >
                              <ExternalLink size={13} />
                            </a>

                            <button
                              onClick={() => navigate(item.editUrl)}
                              className={"inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black transition " + (
                                dark
                                  ? "bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                                  : "bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white"
                              )}
                            >
                              <span>الاستوديو</span>
                              <ArrowUpLeft size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: FLASH BROADCAST ==================== */}
        {activeTab === "broadcast" && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">شريط التنبيهات والأخبار العاجلة الفوري</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  بث شريط إعلاني فوري يظهر في قمة الموقع لجميع أولياء الأمور والطلاب والزوار مع سجل إدارة كامل
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-black text-amber-300">
                  إجمالي التنبيهات: {broadcastList.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBroadcastId(null);
                    setBroadcastEnabled(true);
                    setBroadcastMessage("");
                    setBroadcastType("urgent");
                    setBroadcastLink("");
                    setBroadcastLinkText("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition shadow"
                >
                  <Plus size={14} />
                  <span>تنبيه جديد</span>
                </button>
              </div>
            </div>

            {/* Broadcast Form Card */}
            <div
              className={"rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md transition " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              <div className="flex items-center justify-between border-b pb-4 border-current/10">
                <div className="flex items-center gap-2">
                  <Megaphone className="text-amber-400" size={20} />
                  <h4 className="text-sm font-black">
                    {editingBroadcastId ? "تعديل التنبيه المحدد" : "إنشاء تنبيه عاجل جديد"}
                  </h4>
                </div>
                {editingBroadcastId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBroadcastId(null);
                      setBroadcastMessage("");
                      setBroadcastLink("");
                      setBroadcastLinkText("");
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-white underline"
                  >
                    إلغاء التعديل والبدء بجديد
                  </button>
                )}
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center justify-between border-b pb-6 border-current/10">
                <div>
                  <h4 className="text-sm font-black">تفعيل هذا التنبيه وعرضه على الموقع</h4>
                  <p className="text-xs font-bold text-slate-400">عند تفعيله، سيظهر فوراً في قمة صفحات الموقع لجميع الزوار</p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={broadcastEnabled}
                    onChange={(e) => setBroadcastEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-7 w-12 rounded-full bg-slate-700 after:absolute after:top-[2px] after:right-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[] peer-checked:bg-emerald-500 peer-checked:after:-translate-x-5" />
                </label>
              </div>

              {/* Broadcast Type */}
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2">نوع ومظهر التنبيه</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "urgent", label: "🚨 تنبيه عاجل (أحمر ناري)", desc: "للإجازات والتعليمات الطارئة" },
                    { id: "celebration", label: "🏆 إعلان تهنئة (ذهبي)", desc: "للجوائز وتكريم المتفوقين" },
                    { id: "info", label: "📢 إشعار إداري (كحلي)", desc: "للتذكير بالمواعيد والفعاليات" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBroadcastType(t.id as any)}
                      className={"rounded-2xl border p-4 text-right transition " + (
                        broadcastType === t.id
                          ? dark
                            ? "border-[#f8ca14] bg-[#f8ca14]/10 text-white shadow-md shadow-[#f8ca14]/10"
                            : "border-[#08467d] bg-[#08467d]/10 text-[#08467d] shadow-md"
                          : "border-current/10 opacity-70 hover:opacity-100"
                      )}
                    >
                      <p className="text-xs font-black">{t.label}</p>
                      <p className="mt-1 text-[10px] text-slate-400 font-bold">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2">نص التنبيه أو الإعلان</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={2}
                  placeholder="مثال: عاجل: تعليق الدراسة الحضورية غداً وتحويلها عن بُعد عبر منصة مدرستي..."
                  className={"w-full rounded-2xl border p-4 text-sm font-bold outline-none transition " + (
                    dark
                      ? "border-white/10 bg-black/40 focus:border-[#f8ca14]"
                      : "border-black/10 bg-slate-50 focus:border-[#08467d]"
                  )}
                />
              </div>

              {/* Optional Link & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">رابط الزر (اختياري)</label>
                  <input
                    type="url"
                    value={broadcastLink}
                    onChange={(e) => setBroadcastLink(e.target.value)}
                    placeholder="https://..."
                    className={"w-full rounded-xl border p-3 text-xs font-bold outline-none font-mono " + (
                      dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">نص الزر (اختياري)</label>
                  <input
                    type="text"
                    value={broadcastLinkText}
                    onChange={(e) => setBroadcastLinkText(e.target.value)}
                    placeholder="مثال: عرض التفاصيل"
                    className={"w-full rounded-xl border p-3 text-xs font-bold outline-none " + (
                      dark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50"
                    )}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2">معاينة حية لشكل الشريط في الموقع</label>
                <div
                  className={"rounded-2xl p-4 text-xs font-black flex items-center justify-between gap-3 shadow-md transition " + (
                    broadcastType === "urgent"
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white"
                      : broadcastType === "celebration"
                      ? "bg-gradient-to-r from-[#d4af37] via-[#f8ca14] to-[#c59b27] text-black"
                      : "bg-gradient-to-r from-[#08467d] via-[#0b5c9e] to-[#08467d] text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="rounded bg-black/20 px-2 py-0.5 text-[10px]">
                      {broadcastType === "urgent" ? "تنبيه عاجل" : broadcastType === "celebration" ? "إعلان تهنئة" : "إشعار هام"}
                    </span>
                    <span className="truncate">{broadcastMessage || "نص التنبيه سيظهر هنا..."}</span>
                  </div>
                  {broadcastLinkText ? (
                    <span className="shrink-0 rounded bg-white/20 px-2.5 py-1 text-[10px]">
                      {broadcastLinkText}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-current/10 flex justify-end gap-3">
                {editingBroadcastId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBroadcastId(null);
                      setBroadcastMessage("");
                      setBroadcastLink("");
                      setBroadcastLinkText("");
                    }}
                    className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-black text-slate-300 hover:bg-white/5 transition"
                  >
                    إلغاء
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!broadcastMessage.trim()) {
                      toast.error("يرجى كتابة نص التنبيه أولاً");
                      return;
                    }
                    setBroadcastMutation.mutate({
                      id: editingBroadcastId || undefined,
                      enabled: broadcastEnabled,
                      message: broadcastMessage.trim(),
                      type: broadcastType,
                      link: broadcastLink.trim() || undefined,
                      linkText: broadcastLinkText.trim() || undefined,
                    });
                  }}
                  disabled={setBroadcastMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-6 py-3 text-xs font-black text-black transition hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20"
                >
                  <CheckCircle2 size={16} />
                  <span>{setBroadcastMutation.isPending ? "جاري الحفظ..." : editingBroadcastId ? "حفظ وتحديث التنبيه" : "حفظ ونشر التنبيه"}</span>
                </button>
              </div>
            </div>

            {/* Broadcasts History List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <span>سجل وقائمة التنبيهات المحفوظة ({broadcastList.length})</span>
                </h3>
              </div>

              {broadcastList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-400 text-xs font-bold">
                  لا توجد تنبيهات محفوظة حتى الآن. أنشئ أول تنبيه أعلاه!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {broadcastList.map((item) => {
                    const isItemUrgent = item.type === "urgent";
                    const isItemCelebration = item.type === "celebration";
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          item.enabled
                            ? "border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-500/5"
                            : dark
                            ? "border-white/10 bg-[#12141a]"
                            : "border-black/10 bg-slate-50"
                        }`}
                      >
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${
                                isItemUrgent
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : isItemCelebration
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {isItemUrgent ? "🚨 عاجل" : isItemCelebration ? "🏆 تهنئة" : "📢 إداري"}
                            </span>

                            {item.enabled ? (
                              <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                معروض الآن على الموقع
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-700/30 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                                متوقف
                              </span>
                            )}

                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(item.createdAt).toLocaleDateString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <p className="text-sm font-black text-slate-200 leading-6">{item.message}</p>

                          {item.link && (
                            <p className="text-xs text-amber-300/80 font-bold flex items-center gap-1">
                              <ArrowUpLeft size={12} />
                              <span>الرابط: {item.linkText || item.link}</span>
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {/* Toggle Active Button */}
                          <button
                            type="button"
                            onClick={() => toggleBroadcastMutation.mutate({ id: item.id, enabled: !item.enabled })}
                            className={`rounded-xl px-3 py-1.5 text-xs font-black transition border ${
                              item.enabled
                                ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title={item.enabled ? "إيقاف العرض" : "تفعيل وعرض على الموقع"}
                          >
                            {item.enabled ? "إيقاف" : "تفعيل الآن"}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBroadcastId(item.id);
                              setBroadcastEnabled(item.enabled);
                              setBroadcastMessage(item.message);
                              setBroadcastType(item.type);
                              setBroadcastLink(item.link || "");
                              setBroadcastLinkText(item.linkText || "");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-black/40 text-slate-300 hover:text-amber-300 hover:border-amber-400 transition"
                            title="تعديل هذا التنبيه"
                          >
                            <SlidersHorizontal size={14} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من رغبتك في حذف هذا التنبيه نهائياً من السجل؟")) {
                                deleteBroadcastMutation.mutate({ id: item.id });
                              }
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition"
                            title="حذف التنبيه"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 6: ARTICLES MODERATION ==================== */}
        {activeTab === "articles" && (
          <div className="max-w-5xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">غرفة مراجعة واعتماد مقالات العقيق ✍️</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  مراجعة مقالات الطلاب والمعلمين وتدقيقها بالذكاء الاصطناعي وقبول نشرها فوراً
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1">
                {(["all", "pending", "published", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setArticleFilterStatus(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      articleFilterStatus === st
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "all"
                      ? `الكل (${allAdminArticles.length})`
                      : st === "pending"
                      ? `بانتظار المراجعة (${allAdminArticles.filter((a) => a.status === "pending").length}) ⏳`
                      : st === "published"
                      ? `المنشورة (${allAdminArticles.filter((a) => a.status === "published").length}) ✅`
                      : `المرفوضة (${allAdminArticles.filter((a) => a.status === "rejected").length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            {allAdminArticles
              .filter((a) => (articleFilterStatus === "all" ? true : a.status === articleFilterStatus))
              .length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400 text-xs font-bold">
                لا توجد مقالات في هذه القائمة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allAdminArticles
                  .filter((a) => (articleFilterStatus === "all" ? true : a.status === articleFilterStatus))
                  .map((art) => (
                    <div
                      key={art.id}
                      className={`rounded-3xl border p-5 sm:p-6 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        art.status === "pending"
                          ? "border-amber-400/40 bg-amber-400/[0.03] shadow-lg shadow-amber-400/5"
                          : art.status === "published"
                          ? dark
                            ? "border-white/10 bg-[#10131d]"
                            : "border-black/10 bg-white"
                          : "border-red-500/20 bg-red-950/10 opacity-70"
                      }`}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black ${
                              art.status === "pending"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse"
                                : art.status === "published"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {art.status === "pending"
                              ? "⏳ بانتظار المراجعة والاعتماد"
                              : art.status === "published"
                              ? "✅ منشور على المنصة"
                              : "❌ مرفوض"}
                          </span>

                          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-black text-amber-200">
                            {art.category}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(art.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-white">{art.title}</h3>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-5 font-bold">
                          {art.excerpt || art.content.slice(0, 150)}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold pt-1">
                          <span>الكاتب: <b className="text-slate-200">{art.authorName}</b> ({art.authorRole})</span>
                          <span>·</span>
                          <span>👁️ {art.viewCount} قراءة</span>
                          <span>·</span>
                          <span>❤️ {art.likesCount} إعجاب</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <Button
                          type="button"
                          onClick={() => setSelectedArticleForEdit(art)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-9 px-4 rounded-xl shadow"
                        >
                          <BookOpen size={14} className="ml-1.5" />
                          <span>مراجعة وتعديل المقال</span>
                        </Button>

                        {art.status === "pending" && (
                          <Button
                            type="button"
                            onClick={() => moderateArticleMutation.mutate({ id: art.id, status: "published" })}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-9 px-3.5 rounded-xl shadow"
                          >
                            <CheckCircle2 size={14} className="ml-1" />
                            <span>قبول ونشر</span>
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا المقال نهائياً؟")) {
                              deleteArticleMutation.mutate({ id: art.id });
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition"
                          title="حذف المقال"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Article Edit & AI Polish Modal */}
            {selectedArticleForEdit && (
              <Dialog open={Boolean(selectedArticleForEdit)} onOpenChange={() => setSelectedArticleForEdit(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#090d16] p-6 sm:p-8 text-right text-white shadow-2xl" dir="rtl">
                  <DialogHeader className="text-right border-b border-white/10 pb-4">
                    <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
                      <span>مراجعة وتدقيق المقال: «{selectedArticleForEdit.title}»</span>
                      <Button
                        type="button"
                        disabled={aiPolishArticleMutation.isPending}
                        onClick={() =>
                          aiPolishArticleMutation.mutate({
                            title: selectedArticleForEdit.title,
                            content: selectedArticleForEdit.content,
                          })
                        }
                        className="bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-xs h-9 px-3.5 rounded-xl shadow-lg flex items-center gap-1.5"
                      >
                        <Sparkles size={14} className={aiPolishArticleMutation.isPending ? "animate-spin" : ""} />
                        <span>{aiPolishArticleMutation.isPending ? "جاري التدقيق..." : "تدقيق لغوي بالذكاء الاصطناعي ✨"}</span>
                      </Button>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">عنوان المقال</label>
                      <input
                        type="text"
                        value={selectedArticleForEdit.title}
                        onChange={(e) =>
                          setSelectedArticleForEdit((prev: any) => ({ ...prev, title: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">الموجز (Excerpt)</label>
                      <input
                        type="text"
                        value={selectedArticleForEdit.excerpt || ""}
                        onChange={(e) =>
                          setSelectedArticleForEdit((prev: any) => ({ ...prev, excerpt: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">محتوى المقال الكامل</label>
                      <textarea
                        rows={8}
                        value={selectedArticleForEdit.content}
                        onChange={(e) =>
                          setSelectedArticleForEdit((prev: any) => ({ ...prev, content: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-white/15 bg-black/50 p-4 text-xs font-bold leading-6 outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() =>
                            moderateArticleMutation.mutate({
                              id: selectedArticleForEdit.id,
                              status: "published",
                              updates: {
                                title: selectedArticleForEdit.title,
                                content: selectedArticleForEdit.content,
                                excerpt: selectedArticleForEdit.excerpt,
                              },
                            })
                          }
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 px-5 rounded-xl shadow"
                        >
                          <CheckCircle2 size={15} className="ml-1" />
                          <span>اعتماد ونشر المقال ✅</span>
                        </Button>

                        <Button
                          type="button"
                          onClick={() =>
                            moderateArticleMutation.mutate({
                              id: selectedArticleForEdit.id,
                              status: "rejected",
                            })
                          }
                          variant="destructive"
                          className="font-black text-xs h-10 px-4 rounded-xl"
                        >
                          رفض المقال ❌
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedArticleForEdit(null)}
                        className="text-xs text-slate-400"
                      >
                        إغلاق
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* ==================== TAB 7: PODCAST & BROADCAST MANAGEMENT ==================== */}
        {activeTab === "podcast" && (
          <div className="max-w-5xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">إدارة إذاعة وبودكاست العقيق 🎙️</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  إضافة وإدارة التسجيلات الإذاعية وحلقات البودكاست المرئية والصوتية
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsAddPodcastOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-10 px-5 rounded-2xl shadow-lg flex items-center gap-2"
              >
                <Plus size={16} />
                <span>+ إضافة حلقة جديدة</span>
              </Button>
            </div>

            {/* Podcasts Grid */}
            {allAdminPodcasts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400 text-xs font-bold">
                لا توجد حلقات بودكاست مسجلة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAdminPodcasts.map((pod) => (
                  <div
                    key={pod.id}
                    className="rounded-3xl border border-white/10 bg-[#0f121e] p-5 shadow-xl flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black text-amber-300">
                          {pod.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pod.mediaType === "video" ? "📹 فيديو" : "🎧 صوت"} · {pod.duration}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white">{pod.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-bold">{pod.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold">المقدم: {pod.hostName || "مدارس العقيق"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من رغبتك في حذف هذه الحلقة؟")) {
                            deletePodcastMutation.mutate({ id: pod.id });
                          }
                        }}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Podcast Modal */}
            <Dialog open={isAddPodcastOpen} onOpenChange={setIsAddPodcastOpen}>
              <DialogContent className="max-w-lg rounded-3xl border border-amber-400/30 bg-[#0a0d16] p-6 text-right text-white shadow-2xl" dir="rtl">
                <DialogHeader className="text-right border-b border-white/10 pb-3">
                  <DialogTitle className="text-base font-black text-amber-300 flex items-center gap-2">
                    <Radio size={18} />
                    <span>إضافة حلقة جديدة إلى إذاعة وبودكاست العقيق 🎙️</span>
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPodcastTitle.trim() || !newPodcastUrl.trim()) return;
                    createPodcastMutation.mutate({
                      title: newPodcastTitle.trim(),
                      description: newPodcastDesc.trim(),
                      mediaType: newPodcastType,
                      sourceType: newPodcastSource,
                      mediaUrl: newPodcastUrl.trim(),
                      category: newPodcastCategory,
                      hostName: newPodcastHost.trim() || undefined,
                      duration: newPodcastDuration.trim() || "10:00",
                    });
                  }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-black text-amber-200 mb-1">عنوان الحلقة *</label>
                    <input
                      type="text"
                      required
                      value={newPodcastTitle}
                      onChange={(e) => setNewPodcastTitle(e.target.value)}
                      placeholder="مثال: الإذاعة الصباحية - إشراقة أمل"
                      className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-bold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">نوع المحتوى</label>
                      <select
                        value={newPodcastType}
                        onChange={(e) => setNewPodcastType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/15 bg-[#141824] p-3 text-xs font-bold outline-none text-slate-200"
                      >
                        <option value="audio">🎧 صوتي (Audio)</option>
                        <option value="video">📹 مرئي (Video)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">التصنيف</label>
                      <select
                        value={newPodcastCategory}
                        onChange={(e) => setNewPodcastCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-white/15 bg-[#141824] p-3 text-xs font-bold outline-none text-slate-200"
                      >
                        <option value="إذاعة الصباح">🎙️ إذاعة الصباح</option>
                        <option value="بودكاست قيادات">👑 بودكاست قيادات</option>
                        <option value="تغطيات صوتية">📹 تغطيات مرئية وصوتية</option>
                        <option value="حوارات الطلاب">🎤 حوارات الطلاب</option>
                        <option value="نشرات إخبارية">📢 نشرات إخبارية</option>
                      </select>
                    </div>
                  </div>


                  {/* Source Type Selector */}
                  <div>
                    <label className="block text-xs font-black text-amber-200 mb-1">نوع المصدر</label>
                    <div className="flex gap-2">
                      {(["drive", "direct", "youtube"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewPodcastSource(s)}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-black transition ${
                            newPodcastSource === s
                              ? "bg-amber-400 text-black shadow-md"
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          {s === "drive" ? "☁️ Google Drive" : s === "direct" ? "🔗 رابط مباشر" : "▶️ يوتيوب"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL / File ID field — smart by source */}
                  <div>
                    <label className="block text-xs font-black text-amber-200 mb-1">
                      {newPodcastSource === "drive"
                        ? "رابط Google Drive أو File ID المباشر *"
                        : newPodcastSource === "youtube"
                        ? "رابط يوتيوب *"
                        : "رابط الملف الصوتي المباشر *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newPodcastUrl}
                      onChange={(e) => setNewPodcastUrl(e.target.value)}
                      placeholder={
                        newPodcastSource === "drive"
                          ? "https://drive.google.com/file/d/1ABC.../view  أو  1ABC..."
                          : newPodcastSource === "youtube"
                          ? "https://youtube.com/watch?v=..."
                          : "https://.../podcast.mp3"
                      }
                      className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-mono outline-none focus:border-amber-400"
                    />
                    {/* Drive: show extracted File ID preview */}
                    {newPodcastSource === "drive" && newPodcastType === "audio" && newPodcastUrl.trim() && (() => {
                      const m =
                        newPodcastUrl.match(/\/d\/([\w-]+)/) ||
                        newPodcastUrl.match(/[?&]id=([\w-]+)/) ||
                        (newPodcastUrl.match(/^[\w-]{25,}$/) ? [null, newPodcastUrl] : null);
                      const fid = m?.[1];
                      return fid ? (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                          <span className="text-emerald-400 text-base">✅</span>
                          <div>
                            <span className="text-emerald-200 font-black text-xs">Drive File ID: </span>
                            <span className="opacity-80">{fid}</span>
                            <div className="text-emerald-400/70 mt-0.5">سيُشغَّل عبر البروكسي السريع تلقائياً 🚀</div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px]">
                          ⚠️ تعذّر استخراج File ID — تأكد من نسخ رابط الملف أو ID المباشر من Google Drive
                        </div>
                      );
                    })()}
                  </div>


                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">المقدم / الضيف</label>
                      <input
                        type="text"
                        value={newPodcastHost}
                        onChange={(e) => setNewPodcastHost(e.target.value)}
                        placeholder="مثال: نادي الإذاعة المدرسية"
                        className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-amber-200 mb-1">المدة التقريبية</label>
                      <input
                        type="text"
                        value={newPodcastDuration}
                        onChange={(e) => setNewPodcastDuration(e.target.value)}
                        placeholder="12:30"
                        className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs font-mono outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-amber-200 mb-1">وصف الحلقة</label>
                    <textarea
                      rows={3}
                      value={newPodcastDesc}
                      onChange={(e) => setNewPodcastDesc(e.target.value)}
                      placeholder="نبذة عن موضوع الحلقة..."
                      className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-xs font-bold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAddPodcastOpen(false)} className="text-xs text-slate-400">
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={createPodcastMutation.isPending} className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 h-10 shadow-lg">
                      {createPodcastMutation.isPending ? "جاري الحفظ..." : "نشر الحلقة 🎙️"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ==================== TAB: MUSIC & ANTHEMS ==================== */}
        {activeTab === "music" && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-current/10">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-amber-600 text-black font-black shadow-lg shadow-amber-400/20">
                    <Headphones size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-cairo">أغاني وراديو العقيق 🎵 (Spotify Engine)</h2>
                    <p className="text-xs sm:text-sm font-bold text-slate-400">إدارة الأناشيد والأغاني المدرسية التي تعمل في المشغل الصوتي الموحد</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSongTitle("");
                      setNewSongArtist("");
                      setNewSongUrl("");
                      setNewSongCategory("النشيد المدرسي");
                      setNewSongCover("");
                      setIsAddSongOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#f8ca14] text-black font-black text-xs hover:bg-yellow-400 transition shadow-lg shadow-[#f8ca14]/20 active:scale-95"
                  >
                    <Plus size={16} />
                    <span>إضافة أغنية / نشيد جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrchestrationMutation.mutate(orchestrationForm)}
                    disabled={setOrchestrationMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر التعديلات"}</span>
                  </button>
                </div>
              </div>

              {/* Songs List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(orchestrationForm.schoolSongs || []).map((song: any, idx: number) => (
                  <div
                    key={song.id || idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                      dark ? "border-white/10 bg-black/40 hover:border-white/20" : "border-black/5 bg-slate-50 hover:border-black/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black shadow-md">
                        <img
                          src={
                            (!song.coverUrl || song.coverUrl.includes("logo") || song.coverUrl.includes("og-"))
                              ? (dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg")
                              : (directDriveImage(song.coverUrl) || song.coverUrl)
                          }
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
                          {song.category || "نشيد مدرسي"}
                        </span>
                        <h4 className="text-sm font-black truncate">{song.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{song.artist || "مدارس العقيق"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (orchestrationForm.schoolSongs || []).filter((_: any, i: number) => i !== idx);
                          setOrchestrationForm({ ...orchestrationForm, schoolSongs: updated });
                          toast.info("تم حذف النشيد. اضغط 'حفظ ونشر التعديلات' لتثبيت التغيير.");
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {(!orchestrationForm.schoolSongs || orchestrationForm.schoolSongs.length === 0) && (
                  <div className="col-span-full text-center py-12 text-slate-400 font-bold text-sm">
                    لا توجد أناشيد أو أغاني مضافة حالياً. اضغط زر "إضافة أغنية / نشيد جديد" للبدء.
                  </div>
                )}
              </div>

              {/* Instructions Callout */}
              <div className={`p-5 rounded-2xl border ${dark ? "border-amber-400/20 bg-amber-400/5 text-amber-200" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
                <h4 className="text-xs font-black mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>كيف يعمل نظام مشغل سبوتيفاي الذكي في الموقع؟</span>
                </h4>
                <p className="text-[11px] leading-relaxed opacity-90">
                  المشغل العائم متاح للزوار في أسفل الشاشة ومن الهيدر العلوي عبر أيقونة السماعة 🎧. يستمع الزائر لأناشيد المدارس، وإذا ضغط على أي حلقة بودكاست، يُبدل المشغل تلقائياً إلى البودكاست، وعند انتهاء الحلقة يخير الزائر تلقائياً بالعودة للنشيد أو الانتقال للبودكاست التالي!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: WHATSAPP CAMPAIGN ==================== */}
        {activeTab === "whatsapp" && (
          <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-black">مُولّد حملات ورسائل الواتساب وQR</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                تجهيز رسائل إعلامية منسقة بضغطة زر لنشرها في قروبات أولياء الأمور والطلاب والمعلمين
              </p>
            </div>

            <div
              className={"rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              {/* Select Item */}
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2">اختر المجلة أو الألبوم المراد تجهيز حملته</label>
                <select
                  value={selectedCampaignItem}
                  onChange={(e) => setSelectedCampaignItem(e.target.value)}
                  className={"w-full rounded-2xl border p-4 text-xs font-black outline-none " + (
                    dark ? "border-white/10 bg-black/50 text-white" : "border-black/10 bg-slate-50 text-slate-900"
                  )}
                >
                  <option value="">-- اختر من المحتوى المنشور --</option>
                  {masterContent.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.typeLabel}] {item.title}
                    </option>
                  ))}
                </select>
              </div>

              {campaignItemData ? (
                <div className="space-y-6">
                  {/* Generated Message Preview */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">الرسالة المنسقة المجهزة للواتساب</label>
                    <div
                      className={"relative rounded-2xl border p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap " + (
                        dark ? "border-white/10 bg-black/60 text-slate-200" : "border-black/10 bg-slate-50 text-slate-800"
                      )}
                    >
                      {generatedWhatsAppMessage}

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedWhatsAppMessage);
                          toast.success("تم نسخ نص الرسالة للحافظة بنجاح!");
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-500 shadow-md"
                      >
                        <Copy size={14} />
                        <span>نسخ الرسالة بالكامل للواتساب</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code generator */}
                  <div className="border-t pt-6 border-current/10">
                    <h4 className="text-sm font-black mb-3">رمز QR المباشر للمحتوى</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="h-36 w-36 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center">
                        <img
                          src={"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(window.location.origin + campaignItemData.viewUrl)}
                          alt="QR Code"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-right">
                        <p className="text-xs font-bold text-slate-400">
                          رمز استجابة سريع عالي الدقة، جاهز للطباعة أو الإرفاق مع النشرات المدرسية لفتح المحتوى مباشرة من كاميرا الجوال.
                        </p>
                        <a
                          href={"https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" + encodeURIComponent(window.location.origin + campaignItemData.viewUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download="aqeeq-qr-code.png"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-current/20 px-3.5 py-2 text-xs font-black transition hover:bg-white/10"
                        >
                          <Download size={14} />
                          <span>تحميل صورة QR بدقة عالية</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-bold">
                  اختر أحد أعداد المجلات أو ألبومات الفعاليات بالأعلى لتوليد رسالة الواتساب ورمز QR فوراً.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODAL: ADD ADMIN USER ==================== */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[480px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">إضافة مشرف أو عضو جديد</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              قم بإدخال بيانات الحساب الجديد وتعيين كلمة المرور ومستوى الصلاحية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">الاسم الكامل *</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="مثال: أ. أحمد الغامدي"
                className={"w-full rounded-xl border p-3 text-xs font-bold outline-none " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">البريد الإلكتروني *</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="ahmed@alaqeeq.edu.sa"
                className={"w-full rounded-xl border p-3 text-xs font-bold outline-none font-mono " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">اسم المستخدم (Username) *</label>
              <input
                type="text"
                value={newUserOpenId}
                onChange={(e) => setNewUserOpenId(e.target.value)}
                placeholder="ahmed_ghamdi"
                className={"w-full rounded-xl border p-3 text-xs font-bold outline-none font-mono " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">كلمة المرور * (6 أحرف على الأقل)</label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
                className={"w-full rounded-xl border p-3 text-xs font-bold outline-none " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">مستوى الصلاحية (Role) *</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className={"w-full rounded-xl border p-3 text-xs font-black outline-none " + (
                  dark ? "border-white/10 bg-black/50 text-white" : "border-black/10 bg-slate-50 text-slate-900"
                )}
              >
                <option value="admin">مشرف عام (كامل الصلاحيات والإعدادات)</option>
                <option value="coordinator">منسق إعلامي (إدارة المجلات والألبومات والأخبار)</option>
                <option value="receptionist">مسؤول حضور (مسح الـ QR للفعاليات)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="rounded-xl border border-current/15 px-4 py-2 text-xs font-black text-slate-400 hover:bg-white/5 transition"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
                  toast.error("يرجى تعبئة جميع الحقول المطلوبة");
                  return;
                }
                createUserMutation.mutate({
                  name: newUserName.trim(),
                  email: newUserEmail.trim(),
                  openId: newUserOpenId.trim() || undefined,
                  password: newUserPassword.trim(),
                  role: newUserRole,
                });
              }}
              disabled={createUserMutation.isPending}
              className="rounded-xl bg-[#f8ca14] px-5 py-2 text-xs font-black text-black hover:bg-yellow-400 transition shadow-md"
            >
              {createUserMutation.isPending ? "جاري الإنشاء..." : "إنشاء المشرف"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL: RESET PASSWORD ==================== */}
      <Dialog open={resetPassUserId !== null} onOpenChange={(open) => !open && setResetPassUserId(null)}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[420px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تعيين كلمة مرور جديدة</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              أدخل كلمة المرور الجديدة لهذا الحساب (6 أحرف على الأقل)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              type="password"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              placeholder="كلمة المرور الجديدة..."
              className={"w-full rounded-xl border p-3 text-xs font-bold outline-none " + (
                dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setResetPassUserId(null)}
              className="rounded-xl border border-current/15 px-4 py-2 text-xs font-black text-slate-400"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (!newPasswordValue || newPasswordValue.length < 6) {
                  toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف");
                  return;
                }
                if (resetPassUserId) {
                  resetPasswordMutation.mutate({ userId: resetPassUserId, newPassword: newPasswordValue });
                }
              }}
              disabled={resetPasswordMutation.isPending}
              className="rounded-xl bg-[#f8ca14] px-5 py-2 text-xs font-black text-black hover:bg-yellow-400 transition"
            >
              {resetPasswordMutation.isPending ? "جاري التحديث..." : "حفظ كلمة المرور"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL: DELETE CONFIRM ==================== */}
      <Dialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[400px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-red-400">تأكيد حذف المشرف</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              هل أنت متأكد من رغبتك في حذف هذا الحساب؟ لن يتمكن من تسجيل الدخول للمنصة مجدداً.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <button
              onClick={() => setDeleteUserId(null)}
              className="rounded-xl border border-current/15 px-4 py-2 text-xs font-black text-slate-400"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (deleteUserId) {
                  deleteUserMutation.mutate({ userId: deleteUserId });
                }
              }}
              disabled={deleteUserMutation.isPending}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-500 transition"
            >
              {deleteUserMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL: ADD SCHOOL SONG ==================== */}
      <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[480px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Headphones size={20} className="text-amber-400" />
              <span>إضافة أغنية أو نشيد جديد</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              أدخل بيانات الملف الصوتي ليظهر في قائمة مشغل العقيق الصوتي الموحد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-1">اسم الأغنية / النشيد *</label>
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="مثال: نشيد مدارس العقيق الرسمي"
                className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-1">المؤدي / المنشد / الكورال</label>
              <input
                type="text"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="مثال: كورال طلاب مدارس العقيق"
                className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-1">رابط الملف الصوتي (Audio URL / Drive) *</label>
              <input
                type="text"
                value={newSongUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewSongUrl(val);
                  if (val.includes("/folders/")) {
                    setDriveAudioFolderUrl(val);
                  }
                }}
                placeholder="رابط ملف Drive المباشر أو https://.../song.mp3"
                className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono " + (
                  dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-50"
                )}
              />
              {newSongUrl.includes("/folders/") && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span>💡 هذا الرابط يشير لمجلد Google Drive كامل!</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDriveAudioFolderUrl(newSongUrl);
                      setIsAddSongOpen(false);
                      setIsImportAudioFolderOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-[11px] hover:bg-emerald-400 transition"
                  >
                    استيراد المجلد كاملاً
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-400 mb-1">التصنيف</label>
                <select
                  value={newSongCategory}
                  onChange={(e) => setNewSongCategory(e.target.value)}
                  className={"w-full rounded-xl border p-2.5 text-xs font-bold outline-none " + (
                    dark ? "border-white/10 bg-[#1a1a1a] text-white" : "border-black/10 bg-slate-50 text-black"
                  )}
                >
                  <option value="النشيد المدرسي">النشيد المدرسي</option>
                  <option value="احتفالي">احتفالي</option>
                  <option value="أغنية وطنية">أغنية وطنية</option>
                  <option value="حفل تخرج">حفل تخرج</option>
                  <option value="بيانو وهدوء">بيانو وهدوء</option>
                </select>
              </div>

            {/* Pure Audio Mode Banner (No images needed) */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
              dark ? "bg-amber-400/5 border-amber-400/20 text-amber-300/90" : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              <Music size={16} className="shrink-0 text-amber-500" />
              <span>يتم عرض النشيد تلقائياً بهوية النوتة الموسيقية المينيمال الموحدة المتكيفة بين الوضع الفاتح والداكن دون الحاجة لرفع صور.</span>
            </div>
          </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <button
              onClick={() => setIsAddSongOpen(false)}
              className="rounded-xl border border-current/15 px-4 py-2 text-xs font-black text-slate-400"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (!newSongTitle.trim()) {
                  toast.error("يرجى إدخال اسم الأغنية أو النشيد");
                  return;
                }
                if (!newSongUrl.trim()) {
                  toast.error("يرجى إدخال رابط الملف الصوتي");
                  return;
                }
                const newSong = {
                  id: `song-${Date.now()}`,
                  title: newSongTitle.trim(),
                  artist: newSongArtist.trim() || "مدارس العقيق",
                  mediaUrl: newSongUrl.trim(),
                  category: newSongCategory,
                  coverUrl: "",
                };
                const updatedList = [...(orchestrationForm.schoolSongs || []), newSong];
                setOrchestrationForm({ ...orchestrationForm, schoolSongs: updatedList });
                setIsAddSongOpen(false);
                toast.success("تمت إضافة النشيد بنجاح! اضغط 'حفظ ونشر التعديلات' لنشره على الموقع.");
              }}
              className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-black text-black hover:bg-amber-300 transition"
            >
              إضافة للقائمة
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* GOOGLE DRIVE AUDIO FOLDER BATCH IMPORT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isImportAudioFolderOpen} onOpenChange={setIsImportAudioFolderOpen}>
        <DialogContent className={`max-w-2xl rounded-3xl ${dark ? "bg-[#0d0f15] border-white/10 text-white" : "bg-white border-black/10 text-slate-900"}`} dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-black">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black grid place-items-center shadow-md">
                <FolderSync size={18} />
              </div>
              <div>
                <span>استيراد مكتبة صوتية كاملة من Google Drive</span>
                <p className="text-xs font-bold text-slate-400 mt-0.5">يدعم جميع صيغ الصوت: MP3, WAV, M4A, FLAC, OGG, AAC, OPUS, WMA, WEBA...</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Input URL & Scan Button */}
            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">رابط مجلد Google Drive (يجب أن يكون «أي شخص لديه الرابط - مشاهد»)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={driveAudioFolderUrl}
                  onChange={(e) => setDriveAudioFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
                  className={`flex-1 rounded-2xl border px-3.5 py-2.5 text-xs font-mono font-bold outline-none transition ${
                    dark ? "border-white/10 bg-black/50 focus:border-emerald-400/50" : "border-black/10 bg-slate-50 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  disabled={scanDriveAudioFolderMutation.isPending || !driveAudioFolderUrl.trim()}
                  onClick={async () => {
                    if (!driveAudioFolderUrl.trim()) return;
                    try {
                      const res = await scanDriveAudioFolderMutation.mutateAsync({ folderUrl: driveAudioFolderUrl.trim() });
                      setScannedAudioTracks(res.tracks);
                      const initialSelected: Record<string, boolean> = {};
                      res.tracks.forEach((t: any) => {
                        initialSelected[t.driveFileId] = true;
                      });
                      setSelectedTrackIds(initialSelected);
                      toast.success(`تم بنجاح العثور على ${res.count} ملف صوتي في المجلد!`);
                    } catch (err: any) {
                      toast.error(err.message || "تعذر قراءة المجلد. تأكد من صحة الرابط وأن الصلاحية عامة.");
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-50"
                >
                  {scanDriveAudioFolderMutation.isPending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>فحص المجلد</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                💡 <strong>نصيحة:</strong> قم بوضع ملفات الأناشيد في مجلد في درايف، واجعل المشاركة «Anyone with the link can view». سيقوم النظام تلقائياً بتنظيف الأسماء، وتحديد الصيغة، وتعيين أغلفة أنيقة جاهزة للعزف.
              </p>
            </div>

            {/* Scanned Audio List Preview */}
            {scannedAudioTracks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>تم اكتشاف ({scannedAudioTracks.length}) مقطع صوتي:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        scannedAudioTracks.forEach((t: any) => { all[t.driveFileId] = true; });
                        setSelectedTrackIds(all);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      تحديد الكل
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTrackIds({})}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                  {scannedAudioTracks.map((track: any) => {
                    const isChecked = !!selectedTrackIds[track.driveFileId];
                    return (
                      <div
                        key={track.driveFileId}
                        onClick={() => {
                          setSelectedTrackIds((prev) => ({
                            ...prev,
                            [track.driveFileId]: !prev[track.driveFileId],
                          }));
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                          isChecked
                            ? dark ? "bg-emerald-500/10 border-emerald-500/40 text-white" : "bg-emerald-50 border-emerald-300 text-slate-900"
                            : dark ? "bg-white/[0.02] border-white/5 opacity-50" : "bg-slate-50 border-black/5 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-emerald-500 h-4 w-4"
                          />
                          <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                            <img
                              src={track.coverUrl || (dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg")}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate">{track.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{track.artist} · {track.fileName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {track.extension}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-400">
                            {track.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsImportAudioFolderOpen(false)}
              className="rounded-xl border border-current/15 px-4 py-2 text-xs font-black text-slate-400 hover:text-white"
            >
              إغلاق
            </button>
            <button
              type="button"
              disabled={scannedAudioTracks.length === 0 || Object.values(selectedTrackIds).filter(Boolean).length === 0}
              onClick={() => {
                const toAdd = scannedAudioTracks
                  .filter((t: any) => selectedTrackIds[t.driveFileId])
                  .map((t: any, idx: number) => ({
                    id: `song-drive-${t.driveFileId}-${Date.now()}-${idx}`,
                    title: t.title,
                    artist: t.artist,
                    mediaUrl: t.mediaUrl,
                    category: t.category,
                    coverUrl: t.coverUrl,
                  }));

                if (toAdd.length === 0) {
                  toast.error("يرجى اختيار نشيد واحد على الأقل للاستيراد");
                  return;
                }

                const updated = [...(orchestrationForm.schoolSongs || []), ...toAdd];
                setOrchestrationForm({ ...orchestrationForm, schoolSongs: updated });
                setIsImportAudioFolderOpen(false);
                toast.success(`تم استيراد ${toAdd.length} نشيد بنجاح! اضغط 'حفظ ونشر التعديلات' بالأعلى لتثبيتها في الموقع.`);
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-xs font-black text-black hover:from-emerald-400 hover:to-teal-300 transition shadow-md disabled:opacity-50"
            >
              استيراد الأناشيد المحددة ({Object.values(selectedTrackIds).filter(Boolean).length})
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Universal Media & Cover Picker Modal */}
      <AqeeqUniversalMediaPickerModal
        open={mediaPickerConfig.open}
        onOpenChange={(open) => setMediaPickerConfig((prev) => ({ ...prev, open }))}
        title={mediaPickerConfig.title}
        currentSelectedUrl={mediaPickerConfig.currentUrl}
        onSelect={mediaPickerConfig.onSelect}
        dark={dark}
      />

      {/* Story Picker & Orchestration Modal */}
      <Dialog open={isStoryPickerOpen} onOpenChange={setIsStoryPickerOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden rounded-3xl ${dark ? "bg-[#0c0c0c] border-white/10 text-white" : "bg-white border-black/10 text-black"}`}>
          <DialogHeader className="space-y-1 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#de191e] text-white shadow-lg">
                  <Flame size={20} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black">
                    مركز اختيار وتفعيل استوريهات الموقع (Stories Hub)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    فعّل أو أوقف أي محتوى من مقالات، مرئيات، بودكاست، ألبومات، ومجلات ليظهر في شريط الاستوري لزوار الموقع
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Controls: Search + Categories */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={storyPickerSearch}
                  onChange={(e) => setStoryPickerSearch(e.target.value)}
                  placeholder="ابحث عن مقال، عرض مرئي، بودكاست، ألبوم، أو مجلة..."
                  className={`w-full rounded-xl py-2 pr-9 pl-4 text-xs font-bold transition border focus:outline-none ${
                    dark ? "bg-white/5 border-white/10 text-white focus:border-[#f8ca14]" : "bg-slate-50 border-black/10 text-black focus:border-[#08467d]"
                  }`}
                />
              </div>

              {/* Status Filter Toggle */}
              <div className={`flex rounded-xl p-1 border text-xs font-bold ${dark ? "bg-white/5 border-white/10" : "bg-slate-100 border-black/5"}`}>
                <button
                  type="button"
                  onClick={() => setStoryPickerStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg transition ${storyPickerStatusFilter === "all" ? (dark ? "bg-white/20 text-white font-black" : "bg-white text-black font-black shadow-sm") : "text-slate-400"}`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setStoryPickerStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg transition ${storyPickerStatusFilter === "active" ? "bg-emerald-500 text-white font-black shadow-sm" : "text-slate-400"}`}
                >
                  المفعلة 🟢
                </button>
                <button
                  type="button"
                  onClick={() => setStoryPickerStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-lg transition ${storyPickerStatusFilter === "inactive" ? (dark ? "bg-white/20 text-white font-black" : "bg-white text-black font-black shadow-sm") : "text-slate-400"}`}
                >
                  غير المفعلة ⚪
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: "all", label: "🌟 الكل", count: availableStories.length },
                { id: "article", label: "✍️ المقالات", count: availableStories.filter((s: any) => s.type === "article").length },
                { id: "showcase", label: "🎬 المرئيات", count: availableStories.filter((s: any) => s.type === "showcase").length },
                { id: "podcast", label: "🎙️ أثير العقيق", count: availableStories.filter((s: any) => s.type === "podcast").length },
                { id: "album", label: "📸 الألبومات", count: availableStories.filter((s: any) => s.type === "album").length },
                { id: "journal", label: "📖 المجلات", count: availableStories.filter((s: any) => s.type === "journal").length },
                { id: "post", label: "📱 السوشيال", count: availableStories.filter((s: any) => s.type === "post").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStoryPickerCategory(tab.id)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 font-bold transition flex items-center gap-1.5 ${
                    storyPickerCategory === tab.id
                      ? (dark ? "bg-gradient-to-r from-[#f8ca14] to-[#de191e] text-black font-black shadow-sm" : "bg-[#08467d] text-white font-black shadow-sm")
                      : (dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-2.5 max-h-[50vh]">
            {isLoadingStories ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#f8ca14]" />
                <p className="text-xs font-bold">جاري تحميل عناصر الموقع...</p>
              </div>
            ) : (() => {
              const filtered = availableStories.filter((item: any) => {
                const matchCat = storyPickerCategory === "all" || item.type === storyPickerCategory;
                const matchSearch = !storyPickerSearch.trim() || item.title.toLowerCase().includes(storyPickerSearch.toLowerCase()) || item.category.toLowerCase().includes(storyPickerSearch.toLowerCase());
                const matchStatus = storyPickerStatusFilter === "all" || (storyPickerStatusFilter === "active" && item.isActive) || (storyPickerStatusFilter === "inactive" && !item.isActive);
                return matchCat && matchSearch && matchStatus;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">لا توجد عناصر مطابقة للبحث الحالي</p>
                  </div>
                );
              }

              return filtered.map((item: any) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                    item.isActive
                      ? (dark ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-emerald-500/40 bg-emerald-50/50 shadow-sm")
                      : (dark ? "border-white/10 bg-white/5 opacity-80 hover:opacity-100" : "border-black/5 bg-slate-50")
                  }`}
                >
                  {/* Left (Thumbnail + Info) */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-current/10 bg-black/40 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={directDriveImage(item.imageUrl) || item.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : item.type === "article" ? (
                        <Newspaper size={24} className="text-rose-400" />
                      ) : item.type === "podcast" ? (
                        <Mic size={24} className="text-indigo-400" />
                      ) : item.type === "showcase" ? (
                        <Video size={24} className="text-sky-400" />
                      ) : item.type === "journal" ? (
                        <BookOpen size={24} className="text-amber-400" />
                      ) : item.type === "album" ? (
                        <Camera size={24} className="text-emerald-400" />
                      ) : (
                        <span className="text-xs font-black">العقيق</span>
                      )}
                      <span className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 ${dark ? "border-black" : "border-white"} ${item.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                          item.type === "article" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : item.type === "podcast" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                          : item.type === "showcase" ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : item.type === "journal" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : item.type === "album" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                        }`}>
                          {item.typeLabel}
                        </span>
                        {item.isPinned && (
                          <span className="rounded-md bg-[#f8ca14]/20 text-[#f8ca14] border border-[#f8ca14]/40 px-1.5 py-0.5 text-[9px] font-black">
                            ★ مثبتة يدوياً
                          </span>
                        )}
                        {item.isPinned && (item as any).remainingHours != null && (
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black border ${(item as any).remainingHours < 6 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}>
                            {`⏱ متبقي ${Math.round((item as any).remainingHours)}س`}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-SA") : ""}
                        </span>
                      </div>
                      <h4 className="mt-1 font-black text-xs sm:text-sm truncate">{item.title}</h4>
                    </div>
                  </div>

                  {/* Right (Actions: Preview + Duration + Toggle) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap justify-end">
                    <a
                      href={item.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-2 rounded-xl border transition ${
                        dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-slate-200 text-slate-600"
                      }`}
                      title="معاينة الصفحة"
                    >
                      <ExternalLink size={14} />
                    </a>

                    {!item.isActive && (
                      <select
                        value={storyDurationHours}
                        onChange={(e) => setStoryDurationHours(Number(e.target.value))}
                        className={`text-[10px] font-black rounded-xl px-2 py-1.5 border cursor-pointer ${
                          dark ? "bg-white/5 border-white/10 text-slate-200" : "bg-black/5 border-black/10 text-slate-700"
                        }`}
                        title="مدة الاستوري"
                      >
                        <option value={24}>⏱ 24 ساعة</option>
                        <option value={48}>⏱ 48 ساعة</option>
                        <option value={72}>⏱ 72 ساعة</option>
                        <option value={168}>⏱ أسبوع</option>
                      </select>
                    )}

                    <Button
                      type="button"
                      disabled={toggleStoryMutation.isPending}
                      onClick={() => toggleStoryMutation.mutate({ storyId: item.id, active: !item.isActive, durationHours: item.isActive ? 24 : storyDurationHours })}
                      className={`text-xs font-black rounded-xl px-4 py-2 transition shadow-md gap-1.5 ${
                        item.isActive
                          ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                          : "bg-gradient-to-r from-[#08467d] via-[#367453] to-[#f8ca14] text-white hover:opacity-95"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <Trash2 size={13} />
                          <span>إيقاف من الاستوريهات</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-[#f8ca14]" />
                          <span>تفعيل كاستوري نشطة 🟢</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ));
            })()}
          </div>

          <DialogFooter className="pt-3 border-t border-current/10 flex items-center justify-between sm:justify-between">
            <div className="text-xs font-bold text-slate-400">
              {availableStories.filter((s: any) => s.isActive).length} قصة مفعلة الآن ستظهر لزوار الموقع
            </div>
            <Button
              type="button"
              onClick={() => setIsStoryPickerOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl px-5"
            >
              تم وإغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AqeeqAiYearbookGenerator open={isYearbookOpen} onOpenChange={setIsYearbookOpen} />
    </div>
  );
}
