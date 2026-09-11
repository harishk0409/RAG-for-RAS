import { useRef, useEffect } from 'react';

interface TelemetryMarker {
  x: number;
  y: number;
  label: string;
  blinkPhase: number;
}

interface Node {
  x: number;
  y: number;
  pulsePhase: number;
}

interface Spark {
  fromX: number; fromY: number;
  toX: number; toY: number;
  progress: number;
  speed: number;
}

const TELEMETRY_LABELS = [
  'REV3_CAD', 'HIVE_RTPS', 'STD_1872', 'ROS2_RTPS :: OK',
  'CAN_OBC_HASH : 0x9AE4', 'VECTORS_ACTIVE : 482,190', 'PRECISION_THR : 0.820',
];

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

    // scattered telemetry markers, mostly at edges, avoiding center
    const markers: TelemetryMarker[] = TELEMETRY_LABELS.map((label, i) => {
      const edge = i % 4;
      let x, y;
      if (edge === 0) { x = Math.random() * canvas.width * 0.25; y = Math.random() * canvas.height; }
      else if (edge === 1) { x = canvas.width * 0.75 + Math.random() * canvas.width * 0.25; y = Math.random() * canvas.height; }
      else if (edge === 2) { x = Math.random() * canvas.width; y = Math.random() * canvas.height * 0.2; }
      else { x = Math.random() * canvas.width; y = canvas.height * 0.8 + Math.random() * canvas.height * 0.2; }
      return { x, y, label, blinkPhase: Math.random() * Math.PI * 2 };
    });

    const nodes: Node[] = Array.from({ length: 16 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const sparks: Spark[] = [];
    const coreX = () => canvas.width / 2;
    const coreY = () => canvas.height / 2;

    const drawHexGrid = () => {
      const size = 44;
      const h = size * Math.sqrt(3);
      ctx.strokeStyle = 'rgba(255, 199, 44, 0.035)';
      ctx.lineWidth = 1;
      for (let row = -1; row * h < canvas.height + h; row++) {
        for (let col = -1; col * size * 1.5 < canvas.width + size; col++) {
          const cx = col * size * 1.5;
          const cy = row * h + (col % 2 === 0 ? 0 : h / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = cx + size * Math.cos(angle);
            const py = cy + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // simple line-art hexapod, drawn with strokes, gently idling
    const drawHexapod = (x: number, y: number, scale: number, bob: number) => {
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.scale(scale, scale);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      // legs (3 per side, slight animated splay)
      for (let side = -1; side <= 1; side += 2) {
        for (let i = -1; i <= 1; i++) {
          const legSwing = Math.sin(frame * 0.05 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(i * 14, 0);
          ctx.lineTo(i * 14 + side * (26 + legSwing), side * 22);
          ctx.moveTo(i * 14 + side * (26 + legSwing), side * 22);
          ctx.lineTo(i * 14 + side * (34 + legSwing), side * 34);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawHexGrid();

      // static faint links from nodes to core
      ctx.strokeStyle = 'rgba(216, 90, 48, 0.06)';
      ctx.lineWidth = 1;
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(coreX(), coreY());
        ctx.stroke();
      });

      // fire sparks periodically
      if (frame % 65 === 0) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        sparks.push({ fromX: n.x, fromY: n.y, toX: coreX(), toY: coreY(), progress: 0, speed: 0.014 + Math.random() * 0.008 });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.progress += s.speed;
        const x = s.fromX + (s.toX - s.fromX) * s.progress;
        const y = s.fromY + (s.toY - s.fromY) * s.progress;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 199, 44, 0.85)';
        ctx.fill();
        if (s.progress >= 1) sparks.splice(i, 1);
      }

      // pulsing document nodes
      nodes.forEach((n) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.02 + n.pulsePhase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 90, 48, ${0.25 + pulse * 0.3})`;
        ctx.fill();
      });

      // core glow
      const corePulse = 0.6 + 0.4 * Math.sin(frame * 0.025);
      const grad = ctx.createRadialGradient(coreX(), coreY(), 0, coreX(), coreY(), 28 * corePulse);
      grad.addColorStop(0, 'rgba(255, 199, 44, 0.35)');
      grad.addColorStop(1, 'rgba(255, 199, 44, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coreX(), coreY(), 28 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // telemetry markers with blinking status dot
      ctx.font = '10px monospace';
      markers.forEach((m) => {
        const blink = 0.4 + 0.6 * Math.sin(frame * 0.03 + m.blinkPhase);
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 90, 48, ${blink})`;
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillText(m.label, m.x + 8, m.y + 3);
      });

      // idle hexapod bots, gently bobbing, off to the sides
      drawHexapod(canvas.width * 0.15, canvas.height * 0.62, 1, Math.sin(frame * 0.02) * 3);
      drawHexapod(canvas.width * 0.85, canvas.height * 0.7, 0.7, Math.sin(frame * 0.02 + 1.5) * 3);

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    />
  );
}