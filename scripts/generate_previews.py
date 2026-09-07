#!/usr/bin/env python3
import os
import subprocess
import time
from PIL import Image

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_DIR = "client/public/previews"
os.makedirs(OUT_DIR, exist_ok=True)

PAGES = [
    ("home", "http://localhost:3000/"),
    ("about", "http://localhost:3000/about"),
    ("accreditations", "http://localhost:3000/accreditations"),
    ("admissions", "http://localhost:3000/admissions"),
    ("journal", "http://localhost:3000/journal"),
    ("albums", "http://localhost:3000/albums"),
    ("podcast", "http://localhost:3000/podcast"),
    ("articles", "http://localhost:3000/articles"),
    ("showcase", "http://localhost:3000/showcase"),
]

def capture_page(key, url, theme):
    sep = "&" if "?" in url else "?"
    full_url = f"{url}{sep}theme={theme}"
    tmp_png = f"/tmp/snap_{key}_{theme}.png"
    
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1280,720",
        f"--screenshot={tmp_png}",
        full_url
    ]
    
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
    print(f"Saved {out_webp} ({os.path.getsize(out_webp)} bytes)")
    
    # Also save standard without theme suffix for backwards compatibility
    if theme == "dark":
        compat_webp = os.path.join(OUT_DIR, f"{key}.webp")
        compat_png = os.path.join(OUT_DIR, f"{key}.png")
        resized.save(compat_webp, "WEBP", quality=90)
        resized.save(compat_png, "PNG")

def main():
    print("Starting screenshot generation for all pages (Dark & Light)...")
    for key, url in PAGES:
        for theme in ["dark", "light"]:
            capture_page(key, url, theme)
    print("All screenshots successfully captured and saved!")

if __name__ == "__main__":
    main()
