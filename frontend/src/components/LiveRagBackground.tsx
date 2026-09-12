import { useRef, useEffect } from 'react';

interface Via {
  x: number;
  y: number;
  pulsePhase: number;
}

interface Trace {
  points: { x: number; y: number }[];
  progress: number;
  speed: number;
}

export function LiveRagBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Cursor tracking, eased for a smooth, non-mechanical response
    let targetMouseX = canvas.width / 2;
    let targetMouseY = canvas.height / 2;
    let mouseX = targetMouseX;
    let mouseY = targetMouseY;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const GRID = 64;

    // "Vias" — small PCB-style connection points, snapped to the grid
    const vias: Via[] = Array.from({ length: 22 }, () => ({
      x: Math.round((Math.random() * canvas.width) / GRID) * GRID,
      y: Math.round((Math.random() * canvas.height) / GRID) * GRID,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Right-angled circuit traces connecting a handful of via pairs,
    // like signal paths on a board. Built once at load.
    const buildTrace = (): Trace => {
      const a = vias[Math.floor(Math.random() * vias.length)];
      const b = vias[Math.floor(Math.random() * vias.length)];
      const midX = b.x;
      const midY = a.y;
      return {
        points: [
          { x: a.x, y: a.y },
          { x: midX, y: midY },
          { x: b.x, y: b.y },
        ],
        progress: 0,
        speed: 0.006 + Math.random() * 0.004,
      };
    };

    const activeTraces: Trace[] = [];

    const drawGrid = () => {
      const spotlightRadius = 380;
      ctx.lineWidth = 1;

      ctx.strokeStyle = 'rgba(120, 140, 160, 0.05)';
      for (let x = 0; x < canvas.width; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // brighten grid lines locally near the cursor, no bloom — just
      // a firmer stroke, like light catching a brushed metal panel
      const nearX = Math.round(mouseX / GRID) * GRID;
      const nearY = Math.round(mouseY / GRID) * GRID;
      for (let gx = nearX - spotlightRadius; gx <= nearX + spotlightRadius; gx += GRID) {
        for (let gy = nearY - spotlightRadius; gy <= nearY + spotlightRadius; gy += GRID) {
          const dist = Math.hypot(gx - mouseX, gy - mouseY);
          const proximity = Math.max(0, 1 - dist / spotlightRadius);
          if (proximity <= 0) continue;
          const opacity = proximity * 0.16;
          ctx.strokeStyle = `rgba(150, 175, 195, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(gx - GRID / 2, gy);
          ctx.lineTo(gx + GRID / 2, gy);
          ctx.moveTo(gx, gy - GRID / 2);
          ctx.lineTo(gx, gy + GRID / 2);
          ctx.stroke();
        }
      }
    };

    const draw = () => {
      frame++;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = '#08090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      // static faint traces between vias
      ctx.strokeStyle = 'rgba(110, 130, 150, 0.06)';
      ctx.lineWidth = 1;
      vias.forEach((v, i) => {
        const next = vias[(i + 3) % vias.length];
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(next.x, v.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      });

      // spawn a traveling signal pulse occasionally
      if (frame % 150 === 0) {
        activeTraces.push(buildTrace());
      }
      for (let i = activeTraces.length - 1; i >= 0; i--) {
        const t = activeTraces[i];
        t.progress += t.speed;
        const segCount = t.points.length - 1;
        const segProgress = t.progress * segCount;
        const segIdx = Math.min(Math.floor(segProgress), segCount - 1);
        const localT = segProgress - segIdx;
        const p0 = t.points[segIdx];
        const p1 = t.points[segIdx + 1];
        const x = p0.x + (p1.x - p0.x) * localT;
        const y = p0.y + (p1.y - p0.y) * localT;

        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160, 190, 210, 0.7)';
        ctx.fill();

        if (t.progress >= 1) activeTraces.splice(i, 1);
      }

      // via points — quiet pulse, no glow/shadow blur
      vias.forEach((v) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.012 + v.pulsePhase);
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1.6 + pulse * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 165, 185, ${0.15 + pulse * 0.1})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(140, 165, 185, ${0.2 + pulse * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}