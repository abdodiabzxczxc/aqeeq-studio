import { describe, expect, it } from "vitest";
import { getAqeeqVideoOpenBehavior } from "./AqeeqVideoPlayer";
import {
  getAqeeqDriveFallbackUrl,
  getAqeeqDriveFileId,
  getAqeeqDrivePreviewUrl,
  getAqeeqDriveThumbnailUrl,
  isAqeeqDriveVideo,
} from "@/lib/aqeeqAlbumMedia";

describe("AqeeqVideoPlayer - استخراج وتنسيق روابط الفيديو", () => {
  it("يستخرج معرف الملف من رابط Google Drive بمختلف الصيغ", () => {
    expect(getAqeeqDriveFileId("https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing")).toBe("1a2b3c4d5e");
    expect(getAqeeqDriveFileId("https://drive.google.com/file/d/1a2b3c4d5e/preview")).toBe("1a2b3c4d5e");
    expect(getAqeeqDriveFileId("https://drive.google.com/thumbnail?id=1a2b3c4d5e&sz=w1600")).toBe("1a2b3c4d5e");
    expect(getAqeeqDriveFileId("https://lh3.googleusercontent.com/d/1a2b3c4d5e=w1600")).toBe("1a2b3c4d5e");
    expect(getAqeeqDriveFileId("/local-storage/video.mp4")).toBeNull();
  });

  it("يحدد ما إذا كان الفيديو مستضافًا على Google Drive بدقة", () => {
    expect(isAqeeqDriveVideo("https://drive.google.com/file/d/1a2b3c4d5e/view")).toBe(true);
    expect(isAqeeqDriveVideo("https://drive.google.com/thumbnail?id=1a2b3c4d5e")).toBe(true);
    expect(isAqeeqDriveVideo("https://example.com/uploads/video.mp4")).toBe(false);
  });

  it("يولد رابط المعاينة المصغرة النظيفة لـ Drive مع rm=minimal", () => {
    expect(getAqeeqDrivePreviewUrl("https://drive.google.com/file/d/sample123/view?usp=sharing")).toBe(
      "https://drive.google.com/file/d/sample123/preview?rm=minimal"
    );
    expect(getAqeeqDrivePreviewUrl("https://example.com/stream.mp4")).toBe("https://example.com/stream.mp4");
  });

  it("يولد رابط الصورة المصغرة عالية الدقة لـ Google Drive", () => {
    expect(getAqeeqDriveThumbnailUrl("https://drive.google.com/file/d/sample123/view")).toBe(
      "https://lh3.googleusercontent.com/d/sample123=w1600"
    );
    expect(getAqeeqDriveThumbnailUrl("https://example.com/video.mp4")).toBeNull();
  });

  it("يولد رابط الفتح البديل المباشر في Google Drive", () => {
    expect(getAqeeqDriveFallbackUrl("https://drive.google.com/file/d/sample123/preview")).toBe(
      "https://drive.google.com/file/d/sample123/view"
    );
    expect(getAqeeqDriveFallbackUrl("https://example.com/video.mp4")).toBe("https://example.com/video.mp4");
  });

  it("يحدد سلوك الفتح المناسب حسب مصدر الفيديو", () => {
    expect(getAqeeqVideoOpenBehavior("https://drive.google.com/file/d/sample123/view")).toBe("internal-drive");
    expect(getAqeeqVideoOpenBehavior("https://example.com/direct-video.mp4")).toBe("internal-native");
  });
});
