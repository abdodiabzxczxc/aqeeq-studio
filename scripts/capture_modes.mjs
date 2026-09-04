import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9333;

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,1050',
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);

  // Get debug target
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

  console.log('Navigating to http://localhost:3000/about...');
  await send('Page.navigate', { url: 'http://localhost:3000/about' });
  await sleep(3000);

  // Scroll campuses section into view
  console.log('Scrolling to #campuses-section...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('campuses-section');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60);
      }
    `
  });
  await sleep(1000);

  async function capture(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const path = `/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/${filename}`;
    writeFileSync(path, buffer);
    console.log(`Saved screenshot: ${path}`);
  }

  // 1. Accordion Mode (default)
  console.log('Capturing Accordion mode...');
  await capture('campus_mode_accordion.png');

  // 2. Coverflow Mode
  console.log('Switching to Coverflow mode...');
  const resCoverflow = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.includes('المسرح 3D'));
      if (b) { b.click(); return 'clicked coverflow'; }
      return 'not found';
    })()`
  });
  console.log('Coverflow click result:', resCoverflow.result?.value);
  await sleep(1500);
  await capture('campus_mode_coverflow.png');

  // 3. Deck Mode
  console.log('Switching to Deck mode...');
  const resDeck = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.includes('الكروت'));
      if (b) { b.click(); return 'clicked deck'; }
      return 'not found';
    })()`
  });
  console.log('Deck click result:', resDeck.result?.value);
  await sleep(1500);
  await capture('campus_mode_deck.png');

  // 4. Blueprint Mode
  console.log('Switching to Blueprint mode...');
  const resBlue = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.includes('المخطط'));
      if (b) { b.click(); return 'clicked blueprint'; }
      return 'not found';
    })()`
  });
  console.log('Blueprint click result:', resBlue.result?.value);
  await sleep(1500);
  await capture('campus_mode_blueprint.png');

  console.log('All screenshots captured!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
