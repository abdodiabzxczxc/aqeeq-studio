import { describe, expect, it } from "vitest";
import { buildAlaqeeqKeyPaths } from "./alaqeeqKey";
import { shouldHideForPublicJournalReader } from "@/components/AlaqeeqKeyNav";

describe("مسارات مفتاح العقيق", () => {
  it("يبني كل مساحات الفعالية الحالية من فعالية محددة", () => {
    expect(buildAlaqeeqKeyPaths(42)).toMatchObject({
      workspace: "/workspace/42",
      guests: "/workspace/42?tab=guests",
      invitation: "/workspace/42?tab=invitation",
      command: "/workspace/42?tab=command",
      reports: "/workspace/42?tab=reports",
      maison: "/workspace/42?tab=maison",
      memories: "/event/42/memories",
    });
  });

  it("يعيد المدير إلى الأماكن الصحيحة حتى عندما لا توجد فعالية مختارة", () => {
    expect(buildAlaqeeqKeyPaths()).toMatchObject({
      workspace: "/dashboard?tab=events",
      guests: "/dashboard?tab=events",
      command: "/scan",
      maison: "/maison",
      memories: "/maison",
    });
  });
});

describe("غلاف قارئ المجلة العام", () => {
  it("يخفي مفتاح الإدارة من رابط العدد العام ما لم يُطلب التحرير صراحة", () => {
    expect(shouldHideForPublicJournalReader("/journal/issue/issue-20260816-3qbt")).toBe(true);
    expect(shouldHideForPublicJournalReader("/journal/issue/issue-20260816-3qbt?visual=1")).toBe(false);
    expect(shouldHideForPublicJournalReader("/journal")).toBe(false);
  });
});
