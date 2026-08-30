import { describe, expect, it } from "vitest";
import { resolveAqeeqAlbumCover } from "./aqeeqAlbumCover";

const media = [
  { mediaUrl: "https://drive.google.com/uc?id=first", thumbnailUrl: "https://drive.google.com/thumb?id=first", mediaType: "image" as const },
  { mediaUrl: "https://drive.google.com/uc?id=second", thumbnailUrl: "https://drive.google.com/thumb?id=second", mediaType: "image" as const },
];

describe("غلاف ألبوم العقيق", () => {
  it("ينتقل تلقائيًا إلى أول صورة متبقية عندما تحذف صورة الغلاف المستوردة", () => {
    expect(resolveAqeeqAlbumCover(media[0].thumbnailUrl, [media[1]])).toBe(media[1].thumbnailUrl);
  });

  it("يحافظ على الغلاف اليدوي المحفوظ في التخزين", () => {
    expect(resolveAqeeqAlbumCover("/manus-storage/album-cover.png", [media[1]])).toBe("/manus-storage/album-cover.png");
  });
});
