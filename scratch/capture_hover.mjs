import http from "http";
import fs from "fs";

http.get("http://localhost:9222/json", (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", async () => {
    const targets = JSON.parse(data);
    const target = targets.find(t => t.type === "page");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const resp = JSON.parse(evt.data || evt);
        if (resp.id === msgId) {
          ws.removeEventListener("message", handler);
          resolve(resp.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    ws.onopen = async () => {
      await send("Page.navigate", { url: "http://localhost:3000/showcase" });
      await new Promise(r => setTimeout(r, 2000));
      
      const evalRes = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const btn = document.querySelector('[data-visual-id="header-nav-journal"]');
            if (!btn) return null;
            const r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          })()
        `,
        returnByValue: true
      });

      console.log("Coords:", evalRes.result.value);
      const coords = evalRes.result.value;
      if (coords) {
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: Math.round(coords.x),
          y: Math.round(coords.y)
        });
        await new Promise(r => setTimeout(r, 1200));

        const shot = await send("Page.captureScreenshot", {
          clip: { x: Math.max(0, Math.round(coords.x - 220)), y: 0, width: 440, height: 500, scale: 1 }
        });
        fs.writeFileSync("/Users/abelrahmankhalil/.gemini/antigravity/brain/380b8a87-73e8-4479-8f0a-5160a518b9ca/scratch/hover_preview_actual.png", Buffer.from(shot.data, "base64"));
        console.log("Screenshot saved successfully!");
      }
      process.exit(0);
    };
  });
});
