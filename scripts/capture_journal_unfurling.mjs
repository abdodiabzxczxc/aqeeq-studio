import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9355;

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900',
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
    console.error('No page target found');
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
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };

  await new Promise(res => ws.onopen = res);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:3000/journal' });
  await sleep(3500);

  // 1. Desktop Resting View (Scroll 0)
  let snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_journal_desktop_0.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_journal_desktop_0.png');

  // 2. Desktop Scrolled View (Scroll 500px to see 3D unfurling)
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 500);` });
  await sleep(1000);

  snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_journal_desktop_500.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_journal_desktop_500.png');

  // 2b. Desktop Light Mode Scrolled View
  await send('Runtime.evaluate', { expression: `
    localStorage.setItem('aqeeq-studio-theme', 'light');
    window.location.reload();
  ` });
  await sleep(3000);
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 550);` });
  await sleep(1000);

  snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_journal_desktop_light_scroll.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_journal_desktop_light_scroll.png');

  // Switch back to dark for consistency
  await send('Runtime.evaluate', { expression: `
    localStorage.setItem('aqeeq-studio-theme', 'dark');
  ` });

  // 3. Mobile View (Fresh Navigation)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:3000/journal' });
  await sleep(3500);

  snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_journal_mobile_0.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_journal_mobile_0.png');

  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 400);` });
  await sleep(1000);

  snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_journal_mobile_400.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_journal_mobile_400.png');

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
