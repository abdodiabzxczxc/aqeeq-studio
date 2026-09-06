"use client";

import React, { useEffect, useRef } from "react";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";

export interface SpatialAudioReactiveSpectrumProps {
  className?: string;
  dark?: boolean;
}

export function SpatialAudioReactiveSpectrum({
  className = "",
  dark = true,
}: SpatialAudioReactiveSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, activeItem } = usePodcastPlayer();

  const mousePos = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const ripples = useRef<{ x: number; y: number; r: number; alpha: number }[]>([]);

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
    let rotation = 0;

    // Simulated multi-band frequency spectrum (64 bands)
    const bands = new Array(64).fill(0.1);
    const targetBands = new Array(64).fill(0.1);

    const render = () => {
      t += 0.02;
      rotation += isPlaying ? 0.008 : 0.002;

      ctx.clearRect(0, 0, width, height);

      // Center of the 3D acoustic stage
      const cx = width * 0.42;
      const cy = height * 0.62;

      // Update frequency bands with lively music harmonics
      for (let i = 0; i < 64; i++) {
        if (isPlaying) {
          const bass = Math.sin(t * 4 + i * 0.2) * 0.5 + 0.5;
          const mid = Math.cos(t * 6 + i * 0.4) * 0.3 + 0.4;
          const treble = Math.sin(t * 9 + i * 0.6) * 0.2 + 0.3;
          targetBands[i] = Math.max(0.15, (bass * 0.5 + mid * 0.3 + treble * 0.2));
        } else {
          targetBands[i] = 0.12 + Math.sin(t * 1.5 + i * 0.3) * 0.06;
        }
        bands[i] += (targetBands[i] - bands[i]) * 0.15;
      }

      // 1. Draw 3D Perspective Grid / Sound Floor
      const gridSteps = 16;
      ctx.lineWidth = 0.7;
      for (let z = 1; z <= gridSteps; z++) {
        const perspective = z / gridSteps;
        const lineY = cy + (z * z * 0.9);
        const halfW = (width * 0.6) * perspective;
        const alpha = (1 - perspective) * (dark ? 0.2 : 0.12);

        ctx.strokeStyle = dark ? `rgba(8, 70, 125, ${alpha})` : `rgba(8, 70, 125, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(cx - halfW, lineY);
        ctx.lineTo(cx + halfW, lineY);
        ctx.stroke();
      }

      // 2. Giant 3D Holographic Vinyl Turntable (Elliptical projection)
      const rx = 320;
      const ry = 110; // Compressed vertical axis creates real 3D perspective tilt

      // Ambient turntable glow
      const vinylGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, rx * 1.1);
      vinylGlow.addColorStop(0, dark ? "rgba(248, 202, 20, 0.14)" : "rgba(248, 202, 20, 0.10)");
      vinylGlow.addColorStop(0.5, dark ? "rgba(8, 70, 125, 0.16)" : "rgba(8, 70, 125, 0.08)");
      vinylGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = vinylGlow;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.1, ry * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Concentric metallic grooves (Micro-grooves)
      const grooveCount = 18;
      for (let g = 1; g <= grooveCount; g++) {
        const factor = g / grooveCount;
        const gRx = rx * factor;
        const gRy = ry * factor;
        const grooveAlpha = (0.15 + (g % 3 === 0 ? 0.15 : 0)) * (isPlaying ? 1 : 0.6);

        ctx.strokeStyle = g % 4 === 0
          ? `rgba(248, 202, 20, ${grooveAlpha * 0.9})`
          : dark
          ? `rgba(180, 210, 255, ${grooveAlpha * 0.5})`
          : `rgba(8, 70, 125, ${grooveAlpha * 0.6})`;
        ctx.lineWidth = g % 4 === 0 ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, gRx, gRy, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. 64-Band Spatial Frequency Equalizer (Radiating like a 3D audio crown)
      const barCount = 64;
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + rotation;
        const hVal = bands[i];
        const barHeight = 15 + hVal * (isPlaying ? 85 : 25);

        // Base point on the vinyl outer rim
        const bx = cx + Math.cos(angle) * (rx * 0.96);
        const by = cy + Math.sin(angle) * (ry * 0.96);

        // Top point extending upward along the vertical Z-axis
        const tx = bx;
        const ty = by - barHeight;

        // Draw frequency beam
        const beamAlpha = Math.min(0.9, 0.2 + hVal * 0.8);
        const grad = ctx.createLinearGradient(bx, by, tx, ty);
        grad.addColorStop(0, dark ? "rgba(8, 70, 125, 0.3)" : "rgba(8, 70, 125, 0.2)");
        grad.addColorStop(0.7, dark ? `rgba(248, 202, 20, ${beamAlpha})` : `rgba(248, 202, 20, ${beamAlpha * 0.9})`);
        grad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Tip spark
        if (hVal > 0.45 && isPlaying) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#f8ca14";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 4. Center Turntable Spindle & Royal Label
      ctx.fillStyle = dark ? "#0a1320" : "#ffffff";
      ctx.strokeStyle = "#f8ca14";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 46, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center Spindle Pin
      ctx.fillStyle = "#f8ca14";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Sine Wave Harmonics (Horizontal spatial acoustic waves that sweep across)
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const waveY = cy - 40 + w * 35;
        const waveAmp = (isPlaying ? 35 : 12) * (1 - w * 0.25);
        const waveFreq = 0.0035 + w * 0.0015;
        const waveSpeed = (w + 1) * 1.4;

        ctx.moveTo(0, waveY);
        for (let x = 0; x <= width; x += 10) {
          const y = waveY + Math.sin(x * waveFreq + t * waveSpeed) * waveAmp;
          ctx.lineTo(x, y);
        }
        const waveAlpha = (0.28 - w * 0.07) * (isPlaying ? 1 : 0.5);
        ctx.strokeStyle = w === 0
          ? `rgba(248, 202, 20, ${waveAlpha})`
          : dark
          ? `rgba(56, 189, 248, ${waveAlpha})`
          : `rgba(8, 70, 125, ${waveAlpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 6. Interactive Mouse Ripples
      for (let r = ripples.current.length - 1; r >= 0; r--) {
        const rip = ripples.current[r];
        rip.r += 2.5;
        rip.alpha *= 0.96;
        if (rip.alpha < 0.02) {
          ripples.current.splice(r, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(248, 202, 20, ${rip.alpha * 0.5})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.current = { x, y };

      if (Math.random() < 0.25 && ripples.current.length < 12) {
        ripples.current.push({ x, y, r: 8, alpha: 0.6 });
      }
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [dark, isPlaying]);

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

export default SpatialAudioReactiveSpectrum;
