import { describe, expect, it } from "vitest";
import { getAqeeqVideoOpenBehavior } from "./AqeeqVideoPoster";

describe("سلوك فتح فيديو العقيق", () => {
  it("يفتح فيديو Drive في صفحة معاينته الأصلية بدل بثه داخل البطاقة", () => {
    expect(getAqeeqVideoOpenBehavior("https://drive.google.com/file/d/video-id/preview")).toBe("internal-drive");
  });

  it("يبقي الفيديو المستضاف مباشرة ضمن المشغل الداخلي الموحد", () => {
    expect(getAqeeqVideoOpenBehavior("/manus-storage/event-video.mp4")).toBe("internal-native");
  });
});
