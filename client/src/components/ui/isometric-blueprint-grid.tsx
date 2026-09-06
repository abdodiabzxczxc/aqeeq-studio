"use client";

import React, { useEffect, useRef } from "react";

export interface IsometricBlueprintGridProps {
  className?: string;
  dark?: boolean;
}

export function IsometricBlueprintGrid({ className = "", dark = true }: IsometricBlueprintGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    let t = 0;

    // Isometric building wireframe blocks
    const buildings = [
      { x: -180, y: 120, w: 90, d: 70, h: 140, label: "مجمع البنين" },
      { x: 40, y: 160, w: 110, d: 80, h: 180, label: "مجمع البنات" },
      { x: 220, y: 90, w: 80, d: 60, h: 110, label: "المسار الدولي" },
      { x: -70, y: 60, w: 60, d: 50, h: 80, label: "المختبرات والمكتبة" },
    ];

    const toIso = (x: number, y: number, z: number, originX: number, originY: number) => {
      const isoX = originX + (x - y) * Math.cos(Math.PI / 6);
      const isoY = originY + (x + y) * Math.sin(Math.PI / 6) - z;
      return { x: isoX, y: isoY };
    };

    const render = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      const originX = width * 0.35;
      const originY = height * 0.55;

      // 1. Draw Isometric Ground Grid
      const gridSize = 12;
      const step = 45;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = dark ? "rgba(8, 70, 125, 0.22)" : "rgba(8, 70, 125, 0.12)";

      for (let i = -gridSize; i <= gridSize; i++) {
        const p1 = toIso(i * step, -gridSize * step, 0, originX, originY);
        const p2 = toIso(i * step, gridSize * step, 0, originX, originY);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const q1 = toIso(-gridSize * step, i * step, 0, originX, originY);
        const q2 = toIso(gridSize * step, i * step, 0, originX, originY);
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
      }

      // 2. Laser Scan Plane
      const scanOffset = ((t * 80) % (gridSize * 2 * step)) - gridSize * step;
      const sp1 = toIso(-gridSize * step, scanOffset, 0, originX, originY);
      const sp2 = toIso(gridSize * step, scanOffset, 0, originX, originY);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(248, 202, 20, 0.4)";
      ctx.shadowColor = "#f8ca14";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw Isometric Architectural Wireframes
      for (const b of buildings) {
        const floatH = b.h * (0.95 + Math.sin(t * 1.5 + b.x) * 0.05);

        // 8 vertices of cuboid
        const p000 = toIso(b.x, b.y, 0, originX, originY);
        const p100 = toIso(b.x + b.w, b.y, 0, originX, originY);
        const p110 = toIso(b.x + b.w, b.y + b.d, 0, originX, originY);
        const p010 = toIso(b.x, b.y + b.d, 0, originX, originY);

        const p001 = toIso(b.x, b.y, floatH, originX, originY);
        const p101 = toIso(b.x + b.w, b.y, floatH, originX, originY);
        const p111 = toIso(b.x + b.w, b.y + b.d, floatH, originX, originY);
        const p011 = toIso(b.x, b.y + b.d, floatH, originX, originY);

        // Filled translucent faces
        ctx.fillStyle = dark ? "rgba(8, 70, 125, 0.12)" : "rgba(8, 70, 125, 0.06)";
        ctx.beginPath();
        ctx.moveTo(p001.x, p001.y);
        ctx.lineTo(p101.x, p101.y);
        ctx.lineTo(p111.x, p111.y);
        ctx.lineTo(p011.x, p011.y);
        ctx.closePath();
        ctx.fill();

        // Wireframe edges
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = dark ? "rgba(248, 202, 20, 0.45)" : "rgba(8, 70, 125, 0.35)";

        // Top face
        ctx.beginPath();
        ctx.moveTo(p001.x, p001.y);
        ctx.lineTo(p101.x, p101.y);
        ctx.lineTo(p111.x, p111.y);
        ctx.lineTo(p011.x, p011.y);
        ctx.closePath();
        ctx.stroke();

        // Vertical pillars
        ctx.beginPath();
        ctx.moveTo(p000.x, p000.y);
        ctx.lineTo(p001.x, p001.y);
        ctx.moveTo(p100.x, p100.y);
        ctx.lineTo(p101.x, p101.y);
        ctx.moveTo(p110.x, p110.y);
        ctx.lineTo(p111.x, p111.y);
        ctx.moveTo(p010.x, p010.y);
        ctx.lineTo(p011.x, p011.y);
        ctx.stroke();

        // Blueprint elevation label
        ctx.font = "bold 9px Tajawal, sans-serif";
        ctx.fillStyle = dark ? "rgba(248, 202, 20, 0.6)" : "rgba(8, 70, 125, 0.7)";
        ctx.fillText(b.label, p001.x - 10, p001.y - 8);
      }

      // 4. Blueprint Watermark Coordinates
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = dark ? "rgba(248, 202, 20, 0.3)" : "rgba(8, 70, 125, 0.25)";
      ctx.fillText("EST. 1994 · 1414H", originX - 160, originY + 120);
      ctx.fillText("COORD: 24.5247° N, 39.5692° E", originX - 160, originY + 136);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [dark]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{
        maskImage: "radial-gradient(circle at 45% 55%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
        WebkitMaskImage: "radial-gradient(circle at 45% 55%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default IsometricBlueprintGrid;
