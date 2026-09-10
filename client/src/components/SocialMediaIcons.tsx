import React from "react";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  PhoneCall,
  MessageCircle,
} from "lucide-react";

export function SnapchatIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.166 2C8.36 2 6.27 4.29 6.27 7.07c0 1.25.46 2.37 1.05 3.19.14.19.17.43.07.64-.19.4-.64.81-1.39 1.01-.35.09-.59.4-.57.76.03.48.42.79.88.79.13 0 .27-.02.4-.08.57-.23 1.1-.3 1.54-.15.25.09.4.3.4.57 0 .8-.56 2.37-2.3 3.03-.43.16-.69.61-.59 1.06.1.44.53.75.98.71 1.45-.13 2.76.62 3.65 1.55.3.31.72.48 1.15.48h.04c.43 0 .85-.17 1.15-.48.89-.93 2.2-1.68 3.65-1.55.45.04.88-.27.98-.71.1-.45-.16-.9-.59-1.06-1.74-.66-2.3-2.23-2.3-3.03 0-.27.15-.48.4-.57.44-.15.97-.08 1.54.15.13.06.27.08.4.08.46 0 .85-.31.88-.79.02-.36-.22-.67-.57-.76-.75-.2-1.2-.61-1.39-1.01-.1-.21-.07-.45.07-.64.59-.82 1.05-1.94 1.05-3.19C17.73 4.29 15.64 2 12.166 2z" />
    </svg>
  );
}

export function TikTokIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48 6.27 6.27 0 0 0 1.84-4.48V8.71a8.18 8.18 0 0 0 4.94 1.63v-3.65z" />
    </svg>
  );
}

export function XIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TelegramIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export function ThreadsIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.186 24C5.452 24 0 18.608 0 12.003 0 5.394 5.452 0 12.186 0c6.684 0 12.133 5.344 12.186 11.905v.21c0 .548-.444.992-.992.992-.548 0-.992-.444-.992-.992v-.21C22.336 5.86 17.804 1.984 12.186 1.984 6.55 1.984 1.984 6.478 1.984 12.003c0 5.522 4.566 10.013 10.202 10.013 4.29 0 8.016-2.632 9.53-6.623.197-.512.775-.769 1.286-.572.512.197.77.776.572 1.287-1.83 4.821-6.33 7.892-11.388 7.892zm4.127-9.525c-.015-.008-.03-.017-.044-.025-.568-.337-1.283-.541-2.071-.591.228-.62.385-1.291.464-1.993.684.093 1.341.28 1.93.555.27.126.473.344.577.618.106.277.08.586-.07.848-.172.302-.452.511-.786.588zm-3.693-.654c.73.048 1.391.237 1.916.548-.158.552-.46 1.053-.883 1.45-1.127 1.058-2.673 1.29-4.01 1.058-1.503-.26-2.584-1.39-2.628-2.75-.043-1.332.96-2.48 2.434-2.788 1.058-.22 2.146-.086 3.171.482zm-2.91-4.717c-1.365.176-2.55.85-3.336 1.898-.797 1.063-1.076 2.378-.787 3.7.306 1.402 1.325 2.536 2.724 3.033.486.173.993.26 1.505.26.782 0 1.573-.204 2.29-.607.728-.409 1.307-.999 1.706-1.724.316-.574.498-1.218.544-1.897-.563-.223-1.168-.363-1.796-.418-.112-1.042-.423-2.036-.921-2.923-.48-.854-1.128-1.527-1.929-1.321zm.292-1.934c1.232 0 2.348.51 3.205 1.402.766.797 1.304 1.815 1.579 2.956.771.077 1.52.269 2.213.568 1.155.498 1.923 1.493 2.053 2.663.14 1.258-.458 2.454-1.564 3.125-.436.264-.925.438-1.442.518-.088.754-.316 1.488-.679 2.176-.566 1.073-1.399 1.947-2.437 2.548-1.128.653-2.404.992-3.693.992-.767 0-1.534-.122-2.274-.366-2.083-.687-3.64-2.342-4.164-4.425-.407-1.618-.116-3.328.799-4.697 1.037-1.554 2.628-2.529 4.38-2.736.677-.08 1.353-.024 2.025.076z" />
    </svg>
  );
}

export type SocialNetworkItem = {
  key: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  hoverColorClass: string;
};

export function getActiveSocialLinks(social: any): SocialNetworkItem[] {
  if (!social) return [];
  const items: SocialNetworkItem[] = [];

  const isEnabled = (key: string) => {
    return social[`${key}Enabled`] !== false;
  };

  if (social.xUrl && isEnabled("x")) {
    items.push({
      key: "x",
      name: "منصة إكس",
      url: social.xUrl,
      icon: <XIcon size={12} />,
      hoverColorClass: "hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30",
    });
  }

  if (social.instagramUrl && isEnabled("instagram")) {
    items.push({
      key: "instagram",
      name: "إنستغرام",
      url: social.instagramUrl,
      icon: <Instagram size={12} />,
      hoverColorClass: "hover:text-pink-500 hover:border-pink-500/30",
    });
  }

  if (social.snapchatUrl && isEnabled("snapchat")) {
    items.push({
      key: "snapchat",
      name: "سناب شات",
      url: social.snapchatUrl,
      icon: <SnapchatIcon size={12} />,
      hoverColorClass: "hover:text-amber-400 hover:border-amber-400/30",
    });
  }

  if (social.tiktokUrl && isEnabled("tiktok")) {
    items.push({
      key: "tiktok",
      name: "تيك توك",
      url: social.tiktokUrl,
      icon: <TikTokIcon size={12} />,
      hoverColorClass: "hover:text-rose-500 hover:border-rose-500/30",
    });
  }

  if (social.youtubeUrl && isEnabled("youtube")) {
    items.push({
      key: "youtube",
      name: "يوتيوب",
      url: social.youtubeUrl,
      icon: <Youtube size={12} />,
      hoverColorClass: "hover:text-red-500 hover:border-red-500/30",
    });
  }

  if (social.telegramUrl && isEnabled("telegram")) {
    items.push({
      key: "telegram",
      name: "تيليجرام",
      url: social.telegramUrl,
      icon: <TelegramIcon size={12} />,
      hoverColorClass: "hover:text-sky-500 hover:border-sky-500/30",
    });
  }

  if (social.facebookUrl && isEnabled("facebook")) {
    items.push({
      key: "facebook",
      name: "فيسبوك",
      url: social.facebookUrl,
      icon: <Facebook size={12} />,
      hoverColorClass: "hover:text-blue-600 hover:border-blue-600/30",
    });
  }

  if (social.linkedinUrl && isEnabled("linkedin")) {
    items.push({
      key: "linkedin",
      name: "لينكد إن",
      url: social.linkedinUrl,
      icon: <Linkedin size={12} />,
      hoverColorClass: "hover:text-blue-500 hover:border-blue-500/30",
    });
  }

  if (social.threadsUrl && isEnabled("threads")) {
    items.push({
      key: "threads",
      name: "ثريدز",
      url: social.threadsUrl,
      icon: <ThreadsIcon size={12} />,
      hoverColorClass: "hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30",
    });
  }

  const waUrl = social.whatsappUrl || (social.whatsappNumber ? `https://wa.me/${social.whatsappNumber.replace(/[^0-9]/g, "")}` : "");
  if (waUrl && isEnabled("whatsapp")) {
    items.push({
      key: "whatsapp",
      name: "واتساب",
      url: waUrl,
      icon: <MessageCircle size={12} />,
      hoverColorClass: "hover:text-emerald-500 hover:border-emerald-500/30",
    });
  }

  if (social.phoneUrl && isEnabled("phone")) {
    items.push({
      key: "phone",
      name: "الهاتف",
      url: social.phoneUrl,
      icon: <PhoneCall size={12} />,
      hoverColorClass: "hover:text-amber-500 hover:border-amber-500/30",
    });
  }

  return items;
}
