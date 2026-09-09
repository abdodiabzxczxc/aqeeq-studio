#!/usr/bin/env python3
import os
import subprocess
import time
import sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_DIR = "client/public/previews"
os.makedirs(OUT_DIR, exist_ok=True)

# Optimized delay: 2200ms ensures React hydration, tRPC queries, animations, and fonts are ready.
# In case a page is heavy and captures before full render (< 30KB), it automatically retries with 5000ms.
PAGES = [
    ("home", "http://localhost:3000/", 2200),
    ("about", "http://localhost:3000/about", 2200),
    ("accreditations", "http://localhost:3000/accreditations", 2200),
    ("admissions", "http://localhost:3000/admissions", 2200),
    ("journal", "http://localhost:3000/journal", 2200),
    ("albums", "http://localhost:3000/albums", 2200),
    ("podcast", "http://localhost:3000/podcast", 2200),
    ("articles", "http://localhost:3000/articles", 2200),
    ("showcase", "http://localhost:3000/showcase", 2200),
]

def capture_page(key, url, theme, delay=2200, retries=1):
    sep = "&" if "?" in url else "?"
    full_url = f"{url}{sep}theme={theme}"
    tmp_png = f"/tmp/snap_{key}_{theme}.png"
    if os.path.exists(tmp_png):
        try:
            os.remove(tmp_png)
        except OSError:
            pass
    
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
        
    try:
        im = Image.open(tmp_png)
        # Crop the top header cover section (width: 1280, height: 720)
        cropped = im.crop((0, 0, 1280, 720))
        # Resize to high quality 800x450
        resized = cropped.resize((800, 450), Image.Resampling.LANCZOS)
        
        out_webp = os.path.join(OUT_DIR, f"{key}_{theme}.webp")
        out_png = os.path.join(OUT_DIR, f"{key}_{theme}.png")
        resized.save(out_webp, "WEBP", quality=90)
        resized.save(out_png, "PNG")
        
        size = os.path.getsize(out_webp)
        print(f"Saved {out_webp} ({size} bytes)")
        
        # If size is suspiciously small (< 30KB), it might have snapped during initial loading skeleton
        # Retry once with longer delay if retries left
        if size < 30000 and retries > 0:
            print(f"Warning: {key}_{theme} appears under-loaded ({size} bytes). Retrying with 5000ms delay...")
            time.sleep(0.5)
            capture_page(key, url, theme, delay=5000, retries=retries - 1)
            return
        
        # Also save standard without theme suffix for backwards compatibility
        if theme == "dark":
            compat_webp = os.path.join(OUT_DIR, f"{key}.webp")
            compat_png = os.path.join(OUT_DIR, f"{key}.png")
            resized.save(compat_webp, "WEBP", quality=90)
            resized.save(compat_png, "PNG")
    except Exception as e:
        print(f"Error processing image for {key}_{theme}: {e}")

def main():
    target = sys.argv[1].strip().lower() if len(sys.argv) > 1 else None
    tasks = []
    
    for key, url, delay in PAGES:
        if target and target != "all" and key != target:
            continue
        for theme in ["dark", "light"]:
            tasks.append((key, url, theme, delay))
            
    if target:
        print(f"Starting parallel screenshot generation for '{target}' ({len(tasks)} tasks)...")
    else:
        print(f"Starting parallel screenshot generation for all pages ({len(tasks)} tasks)...")
        
    start_time = time.time()
    max_workers = min(len(tasks), 4) if tasks else 1
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(capture_page, key, url, theme, delay) for key, url, theme, delay in tasks]
        for f in futures:
            f.result()
            
    elapsed = time.time() - start_time
    print(f"Screenshots successfully captured in {elapsed:.2f}s!")

if __name__ == "__main__":
    main()
