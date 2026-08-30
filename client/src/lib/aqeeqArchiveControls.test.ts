import { describe, expect, it } from "vitest";
import { matchesAqeeqSearch, normalizeAqeeqSearchTerm, searchAndSortAqeeqContent, sortAqeeqContent } from "./aqeeqArchiveControls";

describe("البحث وترتيب أرشيف العقيق", () => {
  const items = [
    { title: "احتفال التخرج", description: "صور الحفل", albumDate: "2026-06-12", viewCount: 8 },
    { title: "أنشطة المدرسة", description: "فيديوهات الطلاب", albumDate: "2026-05-01", viewCount: 21 },
    { title: "معرض العلوم", description: "لقطات وتجارب", albumDate: "2026-08-22", viewCount: 4 },
  ];

  it("يبحث بالاسم والوصف مع تطبيع الأحرف العربية", () => {
    expect(normalizeAqeeqSearchTerm("إِحتفال  التخرج")).toBe("احتفال التخرج");
    expect(matchesAqeeqSearch(items[0], "احتفال")).toBe(true);
    expect(matchesAqeeqSearch(items[1], "الطلاب")).toBe(true);
    expect(matchesAqeeqSearch(items[2], "رياضة")).toBe(false);
  });

  it("يرتب المحتوى حسب الأحدث والأقدم والاسم والمشاهدات", () => {
    expect(sortAqeeqContent(items, "newest").map((item) => item.title)).toEqual(["معرض العلوم", "احتفال التخرج", "أنشطة المدرسة"]);
    expect(sortAqeeqContent(items, "oldest").map((item) => item.title)).toEqual(["أنشطة المدرسة", "احتفال التخرج", "معرض العلوم"]);
    expect(sortAqeeqContent(items, "mostViewed")[0]?.title).toBe("أنشطة المدرسة");
    expect(sortAqeeqContent(items, "leastViewed")[0]?.title).toBe("معرض العلوم");
    expect(sortAqeeqContent(items, "nameAsc").map((item) => item.title)).toEqual(["احتفال التخرج", "أنشطة المدرسة", "معرض العلوم"]);
  });

  it("يجمع البحث والترتيب من دون تعديل قائمة المصدر", () => {
    const result = searchAndSortAqeeqContent(items, "الحفل", "mostViewed");
    expect(result.map((item) => item.title)).toEqual(["احتفال التخرج"]);
    expect(items).toHaveLength(3);
  });

  it("يرتب نتائج النوع المحدد قبل عرضها، وليس نتائج الكل فقط", () => {
    const news = [
      { title: "فيديو قديم", mediaType: "video", createdAt: "2026-05-01", viewCount: 2 },
      { title: "صورة حديثة", mediaType: "image", createdAt: "2026-08-22", viewCount: 30 },
      { title: "فيديو حديث", mediaType: "video", createdAt: "2026-08-25", viewCount: 14 },
    ];
    const videos = news.filter((item) => item.mediaType === "video");
    expect(searchAndSortAqeeqContent(videos, "", "newest").map((item) => item.title)).toEqual(["فيديو حديث", "فيديو قديم"]);
    expect(searchAndSortAqeeqContent(videos, "", "oldest").map((item) => item.title)).toEqual(["فيديو قديم", "فيديو حديث"]);
    expect(searchAndSortAqeeqContent(videos, "", "mostViewed").map((item) => item.title)).toEqual(["فيديو حديث", "فيديو قديم"]);
  });
});
