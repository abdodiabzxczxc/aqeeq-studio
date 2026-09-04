import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9335;

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,1100',
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);

  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget) {
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

  await new Promise(resolve => ws.onopen = resolve);

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

  await send('Page.navigate', { url: 'http://localhost:3000/about' });
  await sleep(2500);

  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('campuses-section');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -50);
      }
    `
  });
  await sleep(1000);

  // Capture Desktop Default (Facility 1 active)
  const res1 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/campus_accordion_final_fac1.png', Buffer.from(res1.data, 'base64'));

  // Switch to Facility 2 (معامل الذكاء الاصطناعي)
  await send('Runtime.evaluate', {
    expression: `
      const pills = Array.from(document.querySelectorAll('button'));
      const p2 = pills.find(el => el.textContent.includes('معامل الذكاء'));
      if (p2) p2.click();
    `
  });
  await sleep(1200);

  const res2 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/campus_accordion_final_fac2.png', Buffer.from(res2.data, 'base64'));

  // Switch to Girls Campus
  await send('Runtime.evaluate', {
    expression: `
      const pills = Array.from(document.querySelectorAll('button'));
      const pGirls = pills.find(el => el.textContent.includes('مجمع البنات'));
      if (pGirls) pGirls.click();
    `
  });
  await sleep(1200);

  const resGirls = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/campus_accordion_final_girls.png', Buffer.from(resGirls.data, 'base64'));

  console.log('Final screenshots captured!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
