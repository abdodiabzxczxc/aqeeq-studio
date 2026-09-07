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

  it("يمنع استخدام روابط صفحات X و Instagram كصور مباشرة لمنع فشل المتصفح", () => {
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "image", mediaUrl: "https://x.com/alaqeeq_school/status/123456" })).toBe("");
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "image", mediaUrl: "https://www.instagram.com/p/abc1234/" })).toBe("");
  });

  it("يستخدم thumbnailUrl عند توفره لمنشورات السوشيال", () => {
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "image", mediaUrl: "https://x.com/alaqeeq_school/status/123456", thumbnailUrl: "https://pbs.twimg.com/media/test.jpg" })).toBe("https://pbs.twimg.com/media/test.jpg");
    expect(getAqeeqShowcaseDisplaySource({ mediaType: "image", mediaUrl: "https://www.instagram.com/p/abc1234/", thumbnailUrl: "https://instagram.fsnc.net/thumb.jpg" })).toBe("https://instagram.fsnc.net/thumb.jpg");
  });
});
