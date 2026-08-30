import { describe, expect, it } from "vitest";
import { getAqeeqShowcaseDisplaySource, getAqeeqShowcaseVideoStreamPath } from "./aqeeqShowcaseMedia";

describe("getAqeeqShowcaseDisplaySource", () => {
  it("يفضل رابط مصغّر أو بروكسي Drive للصور حتى لا يتعطل رابط العرض المباشر", () => {
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "image", mediaUrl: "https://drive.google.com/uc?export=view&id=image", thumbnailUrl: "https://drive.google.com/thumbnail?id=image&sz=w1600" })).toBe("/api/drive-proxy/image");
  });

  it("يعرض غلاف الفيديو من رابط المصغّر قبل بدء التشغيل", () => {
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "video", mediaUrl: "https://drive.google.com/file/d/video/preview", thumbnailUrl: "https://drive.google.com/thumbnail?id=video" })).toBe("/api/drive-proxy/video");
  });

  it("يبني مسار بث محليًا آمنًا لمشغل فيديو الخبر", () => {
    expect(getAqeeqShowcaseVideoStreamPath("news-offers", 42)).toBe("/api/showcases/news-offers/posts/42/stream");
  });
});
