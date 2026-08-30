import { describe, expect, it } from "vitest";
import { createAlbumSocialPreviewHtml } from "./albumSocialPreview";

describe("معاينة مشاركة ألبوم العقيق", () => {
  it("تعرض عنوان الألبوم وغلافه الحقيقيين في وسوم المشاركة", () => {
    const html = createAlbumSocialPreviewHtml({ title: "ألبوم فعالية العقيق", slug: "album-test", albumDate: "2026-08-25", coverUrl: "https://drive.google.com/thumbnail?id=cover" }, "https://alaqeeqgrad-huyez6kn.manus.space");
    expect(html).toContain('property="og:title" content="ألبوم فعالية العقيق | مدارس العقيق"');
    expect(html).toContain('property="og:image" content="https://drive.google.com/thumbnail?id=cover"');
    expect(html).toContain('content="https://alaqeeqgrad-huyez6kn.manus.space/albums/album-test"');
  });
});
