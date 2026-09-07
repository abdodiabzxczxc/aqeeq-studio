import { describe, expect, it } from "vitest";
import { localShowcases } from "./localStore";
import { reorderAqeeqShowcasePosts } from "./db";

describe("حفظ ترتيب منشورات الأخبار والعروض والإضافة من الأقدم للأحدث", () => {
  it("يحفظ ترتيب منشورات المعرض في localStore بنجاح وبشكل دائم", () => {
    const showcase = localShowcases.getBySlug("news-offers", true);
    expect(showcase).toBeDefined();
    const originalPosts = showcase?.posts || [];
    expect(originalPosts.length).toBeGreaterThan(1);

    const originalIds = originalPosts.map((p) => p.id);
    const swappedIds = [originalIds[1], originalIds[0], ...originalIds.slice(2)];

    const updated = localShowcases.reorderPosts(showcase!.id, swappedIds);
    expect(updated[0]?.id).toBe(originalIds[1]);
    expect(updated[0]?.postOrder).toBe(0);
    expect(updated[1]?.id).toBe(originalIds[0]);
    expect(updated[1]?.postOrder).toBe(1);

    // Reload from store to ensure persistence
    const reloaded = localShowcases.getBySlug("news-offers", true);
    expect(reloaded?.posts[0]?.id).toBe(originalIds[1]);
    expect(reloaded?.posts[1]?.id).toBe(originalIds[0]);

    // Restore original order
    localShowcases.reorderPosts(showcase!.id, originalIds);
    const restored = localShowcases.getBySlug("news-offers", true);
    expect(restored?.posts[0]?.id).toBe(originalIds[0]);
  });

  it("يضمن استدعاء reorderAqeeqShowcasePosts إعادة ترتيب وحفظ المنشورات عند عدم وجود اتصال بقاعدة البيانات", async () => {
    const showcase = localShowcases.getBySlug("news-offers", true);
    expect(showcase).toBeDefined();
    const originalIds = (showcase?.posts || []).map((p) => p.id);

    const targetOrder = [originalIds[2], originalIds[0], originalIds[1], ...originalIds.slice(3)];
    const result = await reorderAqeeqShowcasePosts(showcase!.id, targetOrder);
    expect(result[0]?.id).toBe(targetOrder[0]);

    // Restore
    await reorderAqeeqShowcasePosts(showcase!.id, originalIds);
    const restored = localShowcases.getBySlug("news-offers", true);
    expect(restored?.posts[0]?.id).toBe(originalIds[0]);
  });

  it("يرتب الإضافات الجديدة ويضع الأحدث أولاً في بداية المعرض", () => {
    const showcase = localShowcases.getBySlug("news-offers", true);
    expect(showcase).toBeDefined();

    const newAdditions = [
      {
        mediaUrl: "/test-storage/newer.jpg",
        fileName: "file-02.jpg",
        mimeType: "image/jpeg",
        mediaType: "image" as const,
        createdAt: new Date("2026-09-07T12:00:00Z"),
      },
      {
        mediaUrl: "/test-storage/older.jpg",
        fileName: "file-01.jpg",
        mimeType: "image/jpeg",
        mediaType: "image" as const,
        createdAt: new Date("2026-09-07T10:00:00Z"),
      },
    ];

    const currentCount = showcase!.posts.length;
    const added = localShowcases.addPosts(showcase!.id, newAdditions);

    // Newly added items must be placed at the beginning: file-02 (newer) comes before file-01 (older)
    const addedOlder = added.find((p) => p.fileName === "file-01.jpg");
    const addedNewer = added.find((p) => p.fileName === "file-02.jpg");
    expect(addedOlder).toBeDefined();
    expect(addedNewer).toBeDefined();
    expect(addedNewer!.postOrder).toBeLessThan(addedOlder!.postOrder);

    // Clean up added test posts
    localShowcases.deletePost(addedOlder!.id);
    localShowcases.deletePost(addedNewer!.id);
    expect(localShowcases.getBySlug("news-offers", true)?.posts.length).toBe(currentCount);
  });

  it("يختار صورة أحدث خبر لتكون غلاف المعرض coverUrl في القائمة الرئيسية", () => {
    const list = localShowcases.list();
    expect(list[0]?.coverUrl).toBeTruthy();
    const newestPost = localShowcases.getBySlug("news-offers", true)?.posts[0];
    expect(list[0]?.coverUrl).toBe(newestPost?.thumbnailUrl || newestPost?.mediaUrl);
  });
});
