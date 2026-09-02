import React, { useEffect, useRef } from "react";

export function triggerNationalCelebration() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aqeeq-national-celebration"));
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle" | "ribbon";
}

const PALETTE = [
  "#005A36", // Saudi Royal Green
  "#5aba1c", // Vibrant Courage Green
  "#f8ca14", // Saudi Gold
  "#facc15", // Sun Gold
  "#ffffff", // Pure White
  "#6565e0", // Vision Indigo
  "#971a4d", // Generosity Ruby
];

export function AqeeqCelebrationConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const spawnBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = 95;
    const newParticles: Particle[] = [];

    // Left cannon & Right cannon
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft ? canvas.width * 0.15 : canvas.width * 0.85;
      const startY = canvas.height * 0.35;
      const angle = fromLeft
        ? -Math.PI / 4 + (Math.random() - 0.5) * 0.7
        : (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.7;
      const speed = 7 + Math.random() * 11;

      newParticles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 5 + Math.random() * 8,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        opacity: 1,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "ribbon",
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animFrameRef.current) {
      loop();
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const gravity = 0.22;
    const drag = 0.985;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= drag;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.007;

      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "ribbon") {
        ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 2.5);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleCelebrate = () => {
      spawnBurst();
    };

    window.addEventListener("aqeeq-national-celebration", handleCelebrate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("aqeeq-national-celebration", handleCelebrate);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    />
  );
}
