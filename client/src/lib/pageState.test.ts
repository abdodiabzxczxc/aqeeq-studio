import { describe, expect, it } from "vitest";
import { readUrlState, withUrlState } from "./pageState";

describe("حالة الصفحة في الرابط", () => {
  const tabs = ["overview", "command", "guests"] as const;

  it("يستعيد تبويباً صالحاً ويعود للبديل عند غيابه أو عدم صلاحيته", () => {
    expect(readUrlState("/workspace/1?tab=command", "tab", tabs, "overview")).toBe("command");
    expect(readUrlState("/workspace/1?tab=unknown", "tab", tabs, "overview")).toBe("overview");
    expect(readUrlState("/workspace/1", "tab", tabs, "overview")).toBe("overview");
  });

  it("يغيّر التبويب مع الحفاظ على معاملات الرابط الأخرى", () => {
    expect(withUrlState("/workspace/1?tool=invite&tab=overview", "tab", "command")).toBe("/workspace/1?tool=invite&tab=command");
  });
});
