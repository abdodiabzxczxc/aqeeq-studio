#!/usr/bin/env python3
import os
import subprocess
import time
from PIL import Image

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_DIR = "client/public/previews"
os.makedirs(OUT_DIR, exist_ok=True)

# Every page gets a solid delay (4500ms) to ensure React hydration, tRPC queries, images, and fonts are 100% loaded
PAGES = [
    ("home", "http://localhost:3000/", 4500),
    ("about", "http://localhost:3000/about", 4500),
    ("accreditations", "http://localhost:3000/accreditations", 4500),
    ("admissions", "http://localhost:3000/admissions", 4500),
    ("journal", "http://localhost:3000/journal", 4500),
    ("albums", "http://localhost:3000/albums", 4500),
    ("podcast", "http://localhost:3000/podcast", 4500),
    ("articles", "http://localhost:3000/articles", 4500),
    ("showcase", "http://localhost:3000/showcase", 4500),
]

def capture_page(key, url, theme, delay=4500, retries=1):
    sep = "&" if "?" in url else "?"
    full_url = f"{url}{sep}theme={theme}"
    tmp_png = f"/tmp/snap_{key}_{theme}.png"
    if os.path.exists(tmp_png):
        os.remove(tmp_png)
    
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1280,720",
    ]
    if delay:
        cmd.append(f"--virtual-time-budget={delay}")
    cmd.extend([
        f"--screenshot={tmp_png}",
        full_url
    ])
    
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if not os.path.exists(tmp_png):
        print(f"Failed to capture {key} {theme}")
        return
        
    im = Image.open(tmp_png)
    # Crop the top header cover section (width: 1280, height: 720)
    # The header bar is at top, hero cover content is right below it
    cropped = im.crop((0, 0, 1280, 720))
    # Resize to high quality 800x450
    resized = cropped.resize((800, 450), Image.Resampling.LANCZOS)
    
    out_webp = os.path.join(OUT_DIR, f"{key}_{theme}.webp")
    out_png = os.path.join(OUT_DIR, f"{key}_{theme}.png")
    resized.save(out_webp, "WEBP", quality=90)
    resized.save(out_png, "PNG")
    
    size = os.path.getsize(out_webp)
    print(f"Saved {out_webp} ({size} bytes)")
    
    # If size is suspiciously small (< 32KB), it might have snapped during initial loading skeleton
    # Retry once with longer delay if retries left
    if size < 32000 and retries > 0:
        print(f"Warning: {key}_{theme} appears under-loaded ({size} bytes). Retrying with 6500ms delay...")
        time.sleep(1)
        capture_page(key, url, theme, delay=6500, retries=retries - 1)
        return
    
    # Also save standard without theme suffix for backwards compatibility
    if theme == "dark":
        compat_webp = os.path.join(OUT_DIR, f"{key}.webp")
        compat_png = os.path.join(OUT_DIR, f"{key}.png")
        resized.save(compat_webp, "WEBP", quality=90)
        resized.save(compat_png, "PNG")

import sys

def main():
    target = sys.argv[1].strip().lower() if len(sys.argv) > 1 else None
    if target:
        print(f"Starting targeted screenshot generation for '{target}' (Dark & Light)...")
    else:
        print("Starting screenshot generation for all pages (Dark & Light)...")
        
    for key, url, delay in PAGES:
        if target and key != target:
            continue
        for theme in ["dark", "light"]:
            capture_page(key, url, theme, delay)
    print("Screenshots successfully captured and saved!")

if __name__ == "__main__":
    main()
