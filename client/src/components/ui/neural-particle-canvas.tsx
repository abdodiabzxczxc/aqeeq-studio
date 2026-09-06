"use client";

import React, { useEffect, useRef } from "react";

export interface NeuralParticleCanvasProps {
  className?: string;
  dark?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  isGold: boolean;
}

interface PulsePacket {
  p1: number;
  p2: number;
  progress: number;
  speed: number;
}

export function NeuralParticleCanvas({ className = "", dark = true }: NeuralParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 160,
  });

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

    // Create particles
    const particleCount = Math.min(65, Math.floor((width * height) / 14000));
    const particles: Particle[] = [];
    const packets: PulsePacket[] = [];

    const goldColor = "#f8ca14";
    const blueColor = dark ? "#38bdf8" : "#08467d";

    for (let i = 0; i < particleCount; i++) {
      const isGold = Math.random() < 0.35;
      const baseR = isGold ? 2.5 + Math.random() * 1.5 : 1.8 + Math.random() * 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: baseR,
        baseRadius: baseR,
        color: isGold ? goldColor : blueColor,
        glowColor: isGold ? "rgba(248, 202, 20, 0.4)" : "rgba(56, 189, 248, 0.3)",
        isGold,
      });
    }

    // Spawn pulses occasionally
    const spawnPulse = () => {
      if (packets.length > 8) return;
      const p1 = Math.floor(Math.random() * particles.length);
      // Find nearest neighbor
      let bestIdx = -1;
      let minDist = 130;
      for (let j = 0; j < particles.length; j++) {
        if (j === p1) continue;
        const dx = particles[p1].x - particles[j].x;
        const dy = particles[p1].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < minDist) {
          minDist = d;
          bestIdx = j;
        }
      }
      if (bestIdx !== -1) {
        packets.push({
          p1,
          p2: bestIdx,
          progress: 0,
          speed: 0.015 + Math.random() * 0.015,
        });
      }
    };

    let pulseInterval = setInterval(spawnPulse, 600);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouseRef.current.radius) {
            const force = (1 - dist / mouseRef.current.radius) * 0.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            p.radius = p.baseRadius * (1 + force * 0.8);
          } else {
            p.radius = p.baseRadius;
          }
        }
      }

      // Draw connection lines
      const maxDist = 130;
      ctx.lineWidth = 0.9;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (dark ? 0.35 : 0.25);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.isGold || p2.isGold
              ? `rgba(248, 202, 20, ${alpha})`
              : dark
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(8, 70, 125, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw pulse packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const pkt = packets[k];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          packets.splice(k, 1);
          continue;
        }
        const p1 = particles[pkt.p1];
        const p2 = particles[pkt.p2];
        if (!p1 || !p2) continue;

        const curX = p1.x + (p2.x - p1.x) * pkt.progress;
        const curY = p1.y + (p2.y - p1.y) * pkt.progress;

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = goldColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        if (p.isGold) {
          ctx.shadowColor = goldColor;
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Mouse listener on window/container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pulseInterval);
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
        maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default NeuralParticleCanvas;
