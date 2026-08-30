import { describe, expect, it } from "vitest";
import { getAqeeqViewerKey } from "./aqeeqViewTracking";

describe("تتبع مشاهدات العقيق", () => {
  it("يعيد معرفًا آمنًا عند تشغيل المنطق خارج المتصفح", () => {
    expect(getAqeeqViewerKey()).toBe("aqv-server-render");
  });
});
