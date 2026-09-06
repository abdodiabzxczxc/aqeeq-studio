"use client";

import React, { useEffect, useRef } from "react";

export interface CobeGlobeProps {
  className?: string;
  dark?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Hub {
  name: string;
  labelEn: string;
  lat: number;
  lng: number;
  isHQ?: boolean;
}

const HUBS: Hub[] = [
  { name: "المدينة المنورة 🇸🇦", labelEn: "Al Madinah (HQ)", lat: 24.5247, lng: 39.5692, isHQ: true },
  { name: "Cognia 🇺🇸", labelEn: "Cognia USA", lat: 34.0754, lng: -84.2941 },
  { name: "Cambridge 🇬🇧", labelEn: "Cambridge UK", lat: 52.2053, lng: 0.1218 },
  { name: "College Board SAT 🇺🇸", labelEn: "SAT / College Board", lat: 40.7128, lng: -74.006 },
  { name: "IELTS 🇦🇺", labelEn: "IELTS Australia", lat: -37.8136, lng: 144.9631 },
];

function latLngTo3D(lat: number, lng: number, radius: number): Point3D {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function CobeGlobe({ className = "", dark = true }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rotVelocity = useRef({ x: 0.0025, y: 0 });
  const rotAngle = useRef({ x: 0.20, y: 1.1 }); // Initial framing for Middle East / Saudi Arabia

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const RADIUS = 270;

    // Generate Fibonacci Sphere Dots (1,800 points)
    const points: Point3D[] = [];
    const NUM_POINTS = 1800;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < NUM_POINTS; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NUM_POINTS);
      points.push({
        x: RADIUS * Math.sin(phi) * Math.cos(theta),
        y: RADIUS * Math.cos(phi),
        z: RADIUS * Math.sin(phi) * Math.sin(theta),
      });
    }

    // Generate Latitude Rings (Equator + Tropics + Arctic)
    const LAT_RINGS = [-60, -30, 0, 30, 60];
    const ringPoints: { ringIndex: number; points: Point3D[] }[] = LAT_RINGS.map((lat, idx) => {
      const pts: Point3D[] = [];
      const steps = 72;
      for (let s = 0; s < steps; s++) {
        const lng = (s / steps) * 360 - 180;
        pts.push(latLngTo3D(lat, lng, RADIUS));
      }
      return { ringIndex: idx, points: pts };
    });

    // Convert hubs to 3D
    const hubPoints = HUBS.map((h) => ({
      ...h,
      pt: latLngTo3D(h.lat, h.lng, RADIUS),
    }));

    let progress = 0;

    const render = () => {
      if (!isDragging.current) {
        rotAngle.current.y += rotVelocity.current.x;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const cosY = Math.cos(rotAngle.current.y);
      const sinY = Math.sin(rotAngle.current.y);
      const cosX = Math.cos(rotAngle.current.x);
      const sinX = Math.sin(rotAngle.current.x);

      // 1. Globe Halo & Glow Rim
      const haloGrad = ctx.createRadialGradient(cx, cy, RADIUS * 0.7, cx, cy, RADIUS * 1.25);
      if (dark) {
        haloGrad.addColorStop(0, "rgba(8, 70, 125, 0.12)");
        haloGrad.addColorStop(0.55, "rgba(8, 70, 125, 0.28)");
        haloGrad.addColorStop(0.85, "rgba(248, 202, 20, 0.16)");
        haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        haloGrad.addColorStop(0, "rgba(8, 70, 125, 0.08)");
        haloGrad.addColorStop(0.7, "rgba(8, 70, 125, 0.22)");
        haloGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Subtle Holographic Latitude Rings
      ctx.lineWidth = 1;
      for (const ring of ringPoints) {
        ctx.beginPath();
        let first = true;
        for (const p of ring.points) {
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;
          const y1 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;

          if (z2 > 0) {
            const px = cx + x1;
            const py = cy + y1;
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = dark ? "rgba(8, 70, 125, 0.28)" : "rgba(8, 70, 125, 0.18)";
        ctx.stroke();
      }

      // 3. Draw Sphere Dots
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        if (z2 > -30) {
          const depthAlpha = Math.max(0.1, (z2 + RADIUS) / (RADIUS * 2));
          const px = cx + x1;
          const py = cy + y1;
          const dotSize = Math.max(0.85, (z2 / RADIUS + 1) * 1.35);

          ctx.fillStyle = dark
            ? `rgba(215, 230, 255, ${depthAlpha * 0.65})`
            : `rgba(8, 70, 125, ${depthAlpha * 0.55})`;
          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Project Hubs
      const projectedHubs = hubPoints.map((h) => {
        const x1 = h.pt.x * cosY - h.pt.z * sinY;
        const z1 = h.pt.x * sinY + h.pt.z * cosY;
        const y1 = h.pt.y * cosX - z1 * sinX;
        const z2 = h.pt.y * sinX + z1 * cosX;
        return {
          ...h,
          px: cx + x1,
          py: cy + y1,
          pz: z2,
          visible: z2 > -20,
        };
      });

      const medina = projectedHubs[0];

      // 5. Draw Glowing Golden Arcs from Medina to World Hubs
      progress += 0.007;
      if (progress > 1) progress = 0;

      for (let i = 1; i < projectedHubs.length; i++) {
        const dest = projectedHubs[i];
        if (!medina.visible && !dest.visible) continue;

        const midX = (medina.px + dest.px) / 2;
        const midY = (medina.py + dest.py) / 2 - 65; // High 3D elevation curve

        const alpha = Math.min(
          medina.visible ? 0.9 : 0.25,
          dest.visible ? 0.9 : 0.25
        );

        // Golden Arc Trajectory
        ctx.strokeStyle = dark
          ? `rgba(248, 202, 20, ${alpha * 0.75})`
          : `rgba(248, 202, 20, ${alpha * 0.90})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(medina.px, medina.py);
        ctx.quadraticCurveTo(midX, midY, dest.px, dest.py);
        ctx.stroke();

        // Traveling Photon Packet (Shooting golden star)
        const t = (progress + i * 0.24) % 1;
        const photonX =
          (1 - t) * (1 - t) * medina.px + 2 * (1 - t) * t * midX + t * t * dest.px;
        const photonY =
          (1 - t) * (1 - t) * medina.py + 2 * (1 - t) * t * midY + t * t * dest.py;

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#f8ca14";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(photonX, photonY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Gold trail head
        ctx.fillStyle = "#f8ca14";
        ctx.beginPath();
        ctx.arc(photonX, photonY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 6. Hub Beacons & Floating Badges
      for (const h of projectedHubs) {
        if (!h.visible) continue;

        if (h.isHQ) {
          // Medina HQ Pulsing Beacon
          const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
          ctx.strokeStyle = `rgba(248, 202, 20, ${0.5 + pulse * 0.5})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(h.px, h.py, 10 + pulse * 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#f8ca14";
          ctx.shadowColor = "#f8ca14";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(h.px, h.py, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Medina Label
          ctx.font = "bold 12px Tajawal, sans-serif";
          ctx.fillStyle = "#f8ca14";
          ctx.fillText(h.name, h.px + 12, h.py + 4);
        } else {
          // Partner Hubs
          ctx.fillStyle = "#f8ca14";
          ctx.shadowColor = "#f8ca14";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(h.px, h.py, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Hub Label if facing forward
          if (h.pz > 30) {
            ctx.font = "bold 10.5px Tajawal, sans-serif";
            ctx.fillStyle = dark ? "rgba(248, 202, 20, 0.85)" : "rgba(8, 70, 125, 0.95)";
            ctx.fillText(h.name, h.px + 8, h.py + 3);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dark]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={780}
        height={780}
        onMouseDown={(e) => {
          isDragging.current = true;
          lastMousePos.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!isDragging.current) return;
          const dx = e.clientX - lastMousePos.current.x;
          const dy = e.clientY - lastMousePos.current.y;
          rotAngle.current.y += dx * 0.006;
          rotAngle.current.x = Math.max(-0.6, Math.min(0.6, rotAngle.current.x + dy * 0.004));
          lastMousePos.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseUp={() => {
          isDragging.current = false;
        }}
        onMouseLeave={() => {
          isDragging.current = false;
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

export default CobeGlobe;
