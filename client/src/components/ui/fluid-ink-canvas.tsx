"use client";

import React, { useEffect, useRef } from "react";

export interface FluidInkCanvasProps {
  className?: string;
  dark?: boolean;
}

interface InkDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  isGold: boolean;
}

interface LetterParticle {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
}

const ARABIC_LITERARY_CHARS = ["ن", "ق", "ف", "ك", "ع", "ض", "ح", "م", "ر", "أ"];

export function FluidInkCanvas({ className = "", dark = true }: FluidInkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

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

    const inkDrops: InkDrop[] = [];
    const letters: LetterParticle[] = [];

    // Seed initial ambient ink clouds
    const goldColor = dark ? "rgba(248, 202, 20," : "rgba(197, 155, 39,";
    const blueColor = dark ? "rgba(8, 70, 125," : "rgba(8, 70, 125,";

    for (let i = 0; i < 7; i++) {
      const isGold = i % 2 === 0;
      inkDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 60 + Math.random() * 80,
        maxRadius: 180 + Math.random() * 80,
        alpha: 0.14 + Math.random() * 0.1,
        color: isGold ? goldColor : blueColor,
        isGold,
      });
    }

    // Seed floating calligraphic letters
    for (let i = 0; i < 14; i++) {
      letters.push({
        char: ARABIC_LITERARY_CHARS[i % ARABIC_LITERARY_CHARS.length],
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.25, // gently floating upward
        size: 18 + Math.random() * 26,
        alpha: 0.15 + Math.random() * 0.2,
        rotation: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.004,
      });
    }

    let t = 0;

    const render = () => {
      t += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and diffuse ink drops (Fluid billows)
      for (let i = inkDrops.length - 1; i >= 0; i--) {
        const drop = inkDrops[i];
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.radius += 0.4;
        drop.alpha *= 0.994;

        if (drop.alpha < 0.01 || drop.radius > drop.maxRadius) {
          inkDrops.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(
          drop.x,
          drop.y,
          0,
          drop.x,
          drop.y,
          drop.radius
        );
        grad.addColorStop(0, `${drop.color} ${drop.alpha})`);
        grad.addColorStop(0.5, `${drop.color} ${drop.alpha * 0.5})`);
        grad.addColorStop(1, `${drop.color} 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Maintain ambient clouds
      if (inkDrops.length < 8 && Math.random() < 0.03) {
        const isGold = Math.random() < 0.4;
        inkDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 40 + Math.random() * 40,
          maxRadius: 160 + Math.random() * 80,
          alpha: 0.18 + Math.random() * 0.12,
          color: isGold ? goldColor : blueColor,
          isGold,
        });
      }

      // 2. Draw Floating Calligraphic Letters
      for (let i = 0; i < letters.length; i++) {
        const l = letters[i];
        l.x += l.vx;
        l.y += l.vy;
        l.rotation += l.rotSpeed;

        // Wrap around boundaries
        if (l.y < -40) {
          l.y = height + 40;
          l.x = Math.random() * width;
        }
        if (l.x < -40) l.x = width + 40;
        if (l.x > width + 40) l.x = -40;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.font = `italic ${l.size}px "Amiri", "Traditional Arabic", serif`;
        ctx.fillStyle = dark
          ? `rgba(248, 202, 20, ${l.alpha * (0.8 + Math.sin(t + i) * 0.2)})`
          : `rgba(8, 70, 125, ${l.alpha * (0.8 + Math.sin(t + i) * 0.2)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(l.char, 0, 0);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Interactive mouse stroke (Dispenses liquid ink droplets along cursor path)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastMousePos.current) {
        const dx = x - lastMousePos.current.x;
        const dy = y - lastMousePos.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 15 && inkDrops.length < 35) {
          const isGold = Math.random() < 0.55;
          inkDrops.push({
            x,
            y,
            vx: dx * 0.08 + (Math.random() - 0.5) * 0.3,
            vy: dy * 0.08 + (Math.random() - 0.5) * 0.3,
            radius: 18 + Math.random() * 22,
            maxRadius: 100 + Math.random() * 60,
            alpha: 0.28,
            color: isGold ? goldColor : blueColor,
            isGold,
          });
        }
      }

      lastMousePos.current = { x, y };
    };

    const handleMouseLeave = () => {
      lastMousePos.current = null;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
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

export default FluidInkCanvas;
