import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9350;

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

  await send('Page.navigate', { url: 'http://localhost:3000/about' });
  await sleep(3500);

  // Scroll to people-leadership-stage
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('people-leadership-stage');
      if (el) {
        window.scrollTo(0, el.offsetTop + 450);
      }
    `,
  });
  await sleep(1500);

  let snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_orbital_desktop_expanded.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_orbital_desktop_expanded.png');

  // Mobile View: Fresh Navigation with mobile metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:3000/about' });
  await sleep(3500);

  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('people-leadership-stage');
      if (el) {
        el.scrollIntoView({ block: 'start' });
      }
    `,
  });
  await sleep(1000);
  await send('Runtime.evaluate', {
    expression: `window.scrollBy(0, 350);`,
  });
  await sleep(1000);

  snap = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch_orbital_mobile_expanded.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved scratch_orbital_mobile_expanded.png');

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
