import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9338;

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

  await send('Page.navigate', { url: 'http://localhost:3000/accreditations' });
  await sleep(2500);

  // 1. Capture Hero
  const resHero = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/accreditations_hero.png', Buffer.from(resHero.data, 'base64'));

  // 1.b Capture Hero Scrolled (to see 3D fan-out in action)
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 260);' });
  await sleep(600);
  const resHeroScrolled = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/accreditations_hero_scrolled.png', Buffer.from(resHeroScrolled.data, 'base64'));
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);' });
  await sleep(300);

  // 2. Scroll to Cognia Pavilion
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('cognia-section');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -40);
      }
    `
  });
  await sleep(1000);
  const resPavilion = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/accreditations_pavilion.png', Buffer.from(resPavilion.data, 'base64'));

  // 3. Scroll to Career Pipeline & Scanner
  await send('Runtime.evaluate', {
    expression: `
      window.scrollBy(0, 900);
    `
  });
  await sleep(1000);
  const resPipeline = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/accreditations_pipeline.png', Buffer.from(resPipeline.data, 'base64'));

  console.log('Accreditations screenshots captured successfully!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
