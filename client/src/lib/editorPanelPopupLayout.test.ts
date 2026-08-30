import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("موضع قوائم أدوات المحرر المنبثقة", () => {
  it("يثبت لوحات الأدوات بجوار الشريط الأيسر وعلى امتداد القماش في اللابتوب", () => {
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    const editor = readFileSync(resolve(process.cwd(), "client/src/components/VisualEditor.tsx"), "utf8");
    const popupRule = styles.match(/\[data-aq-editor-panel\]\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";

    expect(popupRule).toContain("position: fixed");
    expect(popupRule).toContain("left: 4.7rem");
    expect(popupRule).toContain("top: var(--aq-editor-panel-top, 50%)");
    expect(popupRule).toContain("animation: aq-editor-panel-flyout");
    expect(popupRule).not.toContain("bottom: 0");
    expect(styles).toContain(".aq-editor-toolbar button[title]::after");
    expect(styles).toContain(".aq-editor-sidebar-toggle");
    expect(styles).toContain(".aq-editor-right-nav-toggle");
    expect(styles).toContain(".aq-editor-topbar-toggle");
    expect(styles).toContain("aq-editor-right-nav-hidden");
    expect(styles).toContain("aq-editor-topbar-hidden");
    expect(styles).toContain(".aq-key-popover-actions button");
    expect(styles).toContain("width: 100% !important");
    expect(styles).toContain("aside[data-aq-editor-properties] > .aq-editor-properties-scroll");
    expect(styles).toContain("-webkit-overflow-scrolling: touch");
    expect(editor).toContain("<div className=\"aq-editor-properties-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain\">");
    expect(editor).toContain("<div className=\"space-y-4 p-4\">");
    expect(editor).toContain("setPanelAnchorTop");
    expect(editor).toContain("aq-editor-sidebars-collapsed");
    expect(editor).toContain("setRightNavHidden");
    expect(editor).toContain("setTopbarHidden");
  });
});
