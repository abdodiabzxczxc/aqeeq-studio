import { describe, expect, it } from "vitest";
import { getAqeeqXPostOembedUrl, normalizeAqeeqXPostUrl } from "./xPostEmbed";

describe("X post embed helpers", () => {
  it("يطبع رابط منشور X في صيغة ثابتة ويزيل معاملات التتبع", () => {
    expect(normalizeAqeeqXPostUrl("https://twitter.com/alaqeeq_school/status/2091975989500764484?ref=home")).toBe("https://x.com/alaqeeq_school/status/2091975989500764484");
  });

  it("يبني رابط oEmbed الرسمي لمنشور X ويمنع روابط الحسابات فقط", () => {
    expect(getAqeeqXPostOembedUrl("https://x.com/alaqeeq_school/status/2091975989500764484")).toContain("https://publish.x.com/oembed?");
    expect(getAqeeqXPostOembedUrl("https://x.com/alaqeeq_school")).toBeNull();
  });
});
