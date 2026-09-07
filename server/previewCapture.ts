import { spawn } from "child_process";
import path from "path";

const pageMap: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/accreditations": "accreditations",
  "/admissions": "admissions",
  "/journal": "journal",
  "/albums": "albums",
  "/podcast": "podcast",
  "/atheer": "podcast",
  "/articles": "articles",
  "/showcase": "showcase",
};

const activeJobs = new Set<string>();

export function triggerAutoPageCapture(page: string) {
  const target = pageMap[page] || page;
  if (!target || activeJobs.has(target)) return;

  activeJobs.add(target);
  const scriptPath = path.resolve(process.cwd(), "scripts/generate_previews.py");

  try {
    const child = spawn("python3", [scriptPath, target], {
      stdio: "ignore",
      detached: true,
    });
    child.on("close", () => {
      activeJobs.delete(target);
      console.log(`[PreviewAutoCapture] Successfully refreshed preview for: ${target}`);
    });
    child.on("error", (err) => {
      activeJobs.delete(target);
      console.error(`[PreviewAutoCapture] Failed to capture:`, err);
    });
    child.unref();
  } catch (err) {
    activeJobs.delete(target);
    console.error(`[PreviewAutoCapture] Error launching script:`, err);
  }
}
