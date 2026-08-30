import { describe, expect, it } from "vitest";
import { getAqeeqYouTubeEmbedUrl, parseAqeeqSocialPostUrl } from "./socialPostEmbed";

describe("روابط منشورات Instagram وYouTube", () => {
  it("يطبع رابط Instagram العام ويحفظ نوع الريل كفيديو", () => {
    expect(parseAqeeqSocialPostUrl("instagram", "https://www.instagram.com/reel/DQv12_abc/?igsh=track")).toMatchObject({ sourceId: "instagram-DQv12_abc", url: "https://www.instagram.com/reel/DQv12_abc/", mediaType: "video" });
  });

  it("يطبع رابط YouTube ويحوّله إلى رابط تضمين آمن", () => {
    expect(parseAqeeqSocialPostUrl("youtube", "https://youtu.be/M7lc1UVf-VE?feature=share")).toMatchObject({ sourceId: "youtube-M7lc1UVf-VE", mediaType: "video" });
    expect(getAqeeqYouTubeEmbedUrl("https://www.youtube.com/shorts/M7lc1UVf-VE")).toContain("youtube-nocookie.com/embed/M7lc1UVf-VE");
  });

  it("يرفض روابط الحساب أو الفيديو غير الصالحة", () => {
    expect(parseAqeeqSocialPostUrl("instagram", "https://www.instagram.com/alaqeeq_school/")).toBeNull();
    expect(parseAqeeqSocialPostUrl("youtube", "https://www.youtube.com/channel/UC123")).toBeNull();
  });
});
