import { describe, expect, it } from "vitest";
import { getAqeeqAlbumImageSource, getAqeeqDrivePreviewUrl, isAqeeqDriveVideo } from "./aqeeqAlbumMedia";

describe("مصدر صورة ألبوم العقيق", () => {
  it("يعتمد رابط الصورة المصغرة من Drive ويحولها إلى proxy موثوق", () => {
    expect(getAqeeqAlbumImageSource({ mediaUrl: "https://drive.google.com/uc?export=view&id=abc", thumbnailUrl: "https://drive.google.com/thumbnail?id=abc&sz=w1600" })).toBe("/api/drive-proxy/abc");
  });

  it("يرجع إلى رابط الوسيط عند غياب المصغّر", () => {
    expect(getAqeeqAlbumImageSource({ mediaUrl: "https://example.com/original.jpg", thumbnailUrl: null })).toBe("https://example.com/original.jpg");
  });
});

describe("فيديو Google Drive في ألبوم العقيق", () => {
  it("يتعرف على رابط المعاينة حتى يعرض غلافًا نظيفًا قبل فتح المشغل", () => {
    expect(isAqeeqDriveVideo("https://drive.google.com/file/d/video-id/preview")).toBe(true);
  });

  it("لا يخلط الملفات العادية بفيديو Drive", () => {
    expect(isAqeeqDriveVideo("/manus-storage/photo.jpg")).toBe(false);
  });

  it("ينشئ رابط معاينة Drive مختصراً للمشغل الداخلي الموحد", () => {
    expect(getAqeeqDrivePreviewUrl("https://drive.google.com/file/d/video-id/view?usp=drive_link")).toBe("https://drive.google.com/file/d/video-id/preview?rm=minimal");
  });

  it("لا يبدل رابط الوسيط العادي عند عدم وجود معرّف Drive", () => {
    expect(getAqeeqDrivePreviewUrl("/manus-storage/video.mp4")).toBe("/manus-storage/video.mp4");
  });
});
