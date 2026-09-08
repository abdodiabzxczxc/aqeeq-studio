import { spawn } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9340;

const outDir = '/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,1100',
]);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  try {
    await sleep(1500);

    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    if (!pageTarget) {
      console.error('No page target found!');
      chromeProc.kill();
      return;
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = idCounter++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:3000/about...');
    await send('Page.navigate', { url: 'http://localhost:3000/about' });
    await sleep(3000);

    // 1. Audit Desktop 1440px Magnetic Alignment
    console.log('\n=== DESKTOP 1440px MAGNETIC ALIGNMENT AUDIT ===');
    const sections = [
      'timeline-section',
      'campuses-section',
      'vision-section',
      'pillars-section',
      'map-contact-section',
    ];

    for (const secId of sections) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.getElementById("${secId}");
          if (!el) return null;
          // Look for the inner max-w container or the section itself
          const container = el.classList.contains("max-w-[1380px]") ? el : el.querySelector(".max-w-\\\\[1380px\\\\]") || el;
          const rect = container.getBoundingClientRect();
          return {
            id: "${secId}",
            left: rect.left,
            right: rect.right,
            width: rect.width,
            top: rect.top + window.scrollY,
            height: rect.height
          };
        })()`,
        returnByValue: true,
      });

      const data = evalRes.result?.value;
      if (data) {
        console.log(
          `Section #${data.id.padEnd(20)} -> Left: ${data.left.toFixed(1)}px | Right: ${data.right.toFixed(1)}px | Width: ${data.width.toFixed(1)}px`
        );
      } else {
        console.error(`Section #${secId} NOT FOUND!`);
      }
    }

    // 2. Capture Individual Section Screenshots
    console.log('\n=== CAPTURING SECTION SCREENSHOTS (DESKTOP) ===');
    for (const secId of sections) {
      await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.getElementById("${secId}");
          if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
        })()`,
      });
      await sleep(600);

      const shotRes = await send('Page.captureScreenshot', { format: 'png' });
      const filename = `about_${secId.replace('-section', '')}.png`;
      writeFileSync(path.join(outDir, filename), Buffer.from(shotRes.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }

    // 3. Test Interactive Feature: Timeline 1994 click
    console.log('\n=== TESTING INTERACTIVE CLICKS ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector("#timeline-section button");
        if (btn) btn.click();
      })()`,
    });
    await sleep(500);
    const snap1994 = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(outDir, 'about_timeline_1994_active.png'), Buffer.from(snap1994.data, 'base64'));
    console.log('Saved screenshot: about_timeline_1994_active.png');

    // 4. Test Interactive Feature: Campuses Girls Tab Click
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = document.querySelectorAll("#campuses-section button");
        if (btns.length > 1) btns[1].click();
      })()`,
    });
    await sleep(600);
    const snapGirls = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(outDir, 'about_campuses_girls_active.png'), Buffer.from(snapGirls.data, 'base64'));
    console.log('Saved screenshot: about_campuses_girls_active.png');

    // 5. Test Mobile Viewport 390px
    console.log('\n=== MOBILE 390px VIEWPORT AUDIT ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(1000);

    for (const secId of sections) {
      const evalMobile = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.getElementById("${secId}");
          if (!el) return null;
          const container = el.classList.contains("max-w-[1380px]") ? el : el.querySelector(".max-w-\\\\[1380px\\\\]") || el;
          const rect = container.getBoundingClientRect();
          return {
            id: "${secId}",
            left: rect.left,
            right: rect.right,
            width: rect.width
          };
        })()`,
        returnByValue: true,
      });

      const mData = evalMobile.result?.value;
      if (mData) {
        console.log(
          `Mobile #${mData.id.padEnd(20)} -> Left: ${mData.left.toFixed(1)}px | Right: ${mData.right.toFixed(1)}px | Width: ${mData.width.toFixed(1)}px`
        );
      }
    }

    // Capture Mobile Timeline & Campuses
    await send('Runtime.evaluate', {
      expression: `document.getElementById("timeline-section").scrollIntoView({ behavior: "instant", block: "start" })`,
    });
    await sleep(600);
    const snapMobTimeline = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(outDir, 'about_mobile_timeline.png'), Buffer.from(snapMobTimeline.data, 'base64'));
    console.log('Saved screenshot: about_mobile_timeline.png');

    await send('Runtime.evaluate', {
      expression: `document.getElementById("campuses-section").scrollIntoView({ behavior: "instant", block: "start" })`,
    });
    await sleep(600);
    const snapMobCampuses = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(outDir, 'about_mobile_campuses.png'), Buffer.from(snapMobCampuses.data, 'base64'));
    console.log('Saved screenshot: about_mobile_campuses.png');

    console.log('\n🎉 ALL VISUAL AND INTERACTION AUDITS COMPLETED SUCCESSFULLY!');
    chromeProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
