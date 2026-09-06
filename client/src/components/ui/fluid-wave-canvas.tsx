"use client";

import React, { useEffect, useRef } from "react";

export interface FluidWaveCanvasProps {
  className?: string;
  dark?: boolean;
}

export function FluidWaveCanvas({ className = "", dark = true }: FluidWaveCanvasProps) {
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

    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // 1. Volumetric Light Beams (Vertical shimmering sunbeams)
      const beamCount = 4;
      for (let b = 0; b < beamCount; b++) {
        const beamX = (width / (beamCount + 1)) * (b + 1) + Math.sin(t * 0.4 + b) * 80;
        const beamWidth = 140 + Math.sin(t * 0.3 + b * 2) * 40;
        const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 40, height);
        beamGrad.addColorStop(0, dark ? "rgba(248, 202, 20, 0.08)" : "rgba(8, 70, 125, 0.06)");
        beamGrad.addColorStop(0.5, dark ? "rgba(8, 70, 125, 0.12)" : "rgba(248, 202, 20, 0.04)");
        beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamX - beamWidth * 0.5, 0);
        ctx.lineTo(beamX + beamWidth * 0.5, 0);
        ctx.lineTo(beamX + beamWidth * 0.9 + 60, height);
        ctx.lineTo(beamX - beamWidth * 0.9 + 60, height);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Multilayered Fluid Ribbon Waves
      const waves = [
        {
          baseY: height * 0.65,
          amp: 38,
          freq: 0.0028,
          speed: 1.2,
          color: dark ? "rgba(8, 70, 125, 0.35)" : "rgba(8, 70, 125, 0.18)",
        },
        {
          baseY: height * 0.72,
          amp: 45,
          freq: 0.0034,
          speed: -0.9,
          color: dark ? "rgba(0, 90, 54, 0.28)" : "rgba(0, 90, 54, 0.14)",
        },
        {
          baseY: height * 0.80,
          amp: 32,
          freq: 0.0042,
          speed: 1.5,
          color: dark ? "rgba(248, 202, 20, 0.22)" : "rgba(248, 202, 20, 0.16)",
        },
      ];

      for (const w of waves) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 8) {
          const y =
            w.baseY +
            Math.sin(x * w.freq + t * w.speed) * w.amp +
            Math.cos(x * w.freq * 0.5 + t * 0.5) * (w.amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      }

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
        maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default FluidWaveCanvas;
