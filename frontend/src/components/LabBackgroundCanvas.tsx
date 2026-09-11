import React, { useEffect, useRef } from 'react';
import { RagState } from '../types';

interface LabBackgroundCanvasProps {
  ragState: RagState;
  scanlineEnabled?: boolean;
}

export const LabBackgroundCanvas: React.FC<LabBackgroundCanvasProps> = ({
  ragState,
  scanlineEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Gantries
    const gantries = [
      { x: w * 0.2, y: h * 0.35, len: 140, angle: -0.3, speed: 0.0006 },
      { x: w * 0.8, y: h * 0.4, len: 160, angle: 0.4, speed: -0.0005 },
      { x: w * 0.5, y: h * 0.8, len: 120, angle: -0.8, speed: 0.0008 }
    ];

    // Dormant Background Chassis
    const dormantChassis = {
      x: w * 0.76,
      y: h * 0.62,
      breath: 0
    };

    // Micro-dust particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.3 - 0.05,
      radius: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.35 + 0.1,
      pulse: Math.random() * Math.PI * 2
    }));

    // Knowledge Nodes
    const knowledgeNodes = [
      { id: 'sch', label: 'Ares Schematics', code: 'REV3_CAD', x: 0.28, y: 0.38, alpha: 0.2, pulse: 0 },
      { id: 'can', label: 'CAN Telemetry', code: '0x3F2_LOG', x: 0.72, y: 0.36, alpha: 0.2, pulse: 1.2 },
      { id: 'ros', label: 'ROS2 Nav2 Stacks', code: 'MOVEIT_RTPS', x: 0.32, y: 0.68, alpha: 0.2, pulse: 2.4 },
      { id: 'ieee', label: 'IEEE Robotics Stds', code: 'STD_1872', x: 0.68, y: 0.72, alpha: 0.2, pulse: 3.6 }
    ];

    interface Pulse {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      t: number;
      speed: number;
    }
    const activeDataPulses: Pulse[] = [];

    const renderLab = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      const centerX = w * 0.5;
      const centerY = h * 0.46;

      // Blueprint Concentric Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      [160, 280, 420, 560].forEach((rad) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - 580, centerY);
      ctx.lineTo(centerX + 580, centerY);
      ctx.moveTo(centerX, centerY - 400);
      ctx.lineTo(centerX, centerY + 400);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.stroke();
      ctx.restore();

      // Gantries & Mechanisms
      ctx.save();
      gantries.forEach((g) => {
        const stateSpeedMultiplier =
          ragState === 'search' || ragState === 'retrieve' ? 2.5 : 1.0;
        g.angle += g.speed * stateSpeedMultiplier;

        const endX = g.x + Math.cos(g.angle) * g.len;
        const endY = g.y + Math.sin(g.angle) * g.len;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(g.x - 70, g.y);
        ctx.lineTo(g.x + 70, g.y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 199, 44, 0.25)';
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dormant Background Chassis
      dormantChassis.breath += 0.018;
      const bOffset = Math.sin(dormantChassis.breath) * 2;
      const dcX = dormantChassis.x;
      const dcY = dormantChassis.y + bOffset;

      ctx.strokeStyle =
        ragState === 'idle'
          ? 'rgba(102, 0, 24, 0.25)'
          : 'rgba(255, 199, 44, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.rect(dcX - 16, dcY - 12, 32, 24);
      ctx.stroke();

      [-1, 1].forEach((side) => {
        [-8, 0, 8].forEach((legY) => {
          ctx.beginPath();
          ctx.moveTo(dcX + side * 16, dcY + legY);
          ctx.lineTo(dcX + side * 28, dcY + legY + 6);
          ctx.lineTo(dcX + side * 36, dcY + legY + 16);
          ctx.stroke();
        });
      });
      ctx.restore();

      // Micro-dust particles
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.12;
        ctx.fillStyle =
          ragState === 'search' || ragState === 'retrieve'
            ? `rgba(255, 199, 44, ${alpha * 0.85})`
            : `rgba(220, 38, 38, ${alpha * 0.35})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Knowledge Nodes & Hub
      ctx.save();
      const hubX = centerX;
      const hubY = centerY;

      const isProcessing = ragState === 'search' || ragState === 'retrieve';
      const isSynthesized = ragState === 'response';
      const hubPulse = Math.sin(time * 0.004) * 3;

      ctx.beginPath();
      ctx.arc(hubX, hubY, 18 + (isProcessing ? hubPulse : 0), 0, Math.PI * 2);
      ctx.fillStyle = isProcessing
        ? 'rgba(220, 38, 38, 0.25)'
        : isSynthesized
        ? 'rgba(255, 199, 44, 0.2)'
        : 'rgba(102, 0, 24, 0.15)';
      ctx.fill();
      ctx.strokeStyle = isProcessing
        ? 'rgba(239, 68, 68, 0.7)'
        : isSynthesized
        ? 'rgba(255, 199, 44, 0.6)'
        : 'rgba(153, 27, 27, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      knowledgeNodes.forEach((kn) => {
        const nx = w * kn.x;
        const ny = h * kn.y;
        kn.pulse += 0.025;

        const targetAlpha =
          isProcessing || ragState === 'retrieve'
            ? 0.85
            : isSynthesized
            ? 0.45
            : 0.2;
        kn.alpha += (targetAlpha - kn.alpha) * 0.08;

        // Lines connect only to the center hub
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(hubX, hubY);
        ctx.strokeStyle = isProcessing
          ? 'rgba(255, 199, 44, 0.25)'
          : isSynthesized
          ? 'rgba(220, 38, 38, 0.15)'
          : 'rgba(102, 0, 24, 0.12)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18, 8, 12, ${kn.alpha})`;
        ctx.fill();
        ctx.strokeStyle = isProcessing
          ? 'rgba(255, 199, 44, 0.8)'
          : 'rgba(153, 27, 27, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isProcessing ? '#ffc72c' : 'rgba(248, 113, 113, 0.6)';
        ctx.fill();

        if (kn.alpha > 0.25) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(226, 232, 240, ${kn.alpha * 0.9})`;
          ctx.fillText(kn.code, nx + 12, ny + 3);
        }
      });

      // Active pulses traveling between knowledge nodes and hub
      if (ragState === 'retrieve' || ragState === 'search') {
        if (Math.random() < 0.08) {
          const randomNode =
            knowledgeNodes[Math.floor(Math.random() * knowledgeNodes.length)];
          activeDataPulses.push({
            fromX: w * randomNode.x,
            fromY: h * randomNode.y,
            toX: hubX,
            toY: hubY,
            t: 0,
            speed: 0.015 + Math.random() * 0.01
          });
        }
      }

      for (let i = activeDataPulses.length - 1; i >= 0; i--) {
        const dp = activeDataPulses[i];
        dp.t += dp.speed;
        if (dp.t >= 1) {
          activeDataPulses.splice(i, 1);
          continue;
        }

        const curX = dp.fromX + (dp.toX - dp.fromX) * dp.t;
        const curY = dp.fromY + (dp.toY - dp.fromY) * dp.t;

        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffc72c';
        ctx.shadowColor = '#ffc72c';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      animId = requestAnimationFrame(renderLab);
    };

    animId = requestAnimationFrame(renderLab);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [ragState]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="lab-canvas-container">
      {/* Base Atmospheric Vignette & Soft Gradient Glows */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-[#4a0413]/25 via-[#1a060d]/30 to-transparent rounded-full blur-[140px] ambient-lab-glow" />
      <div className="absolute -bottom-40 -right-40 w-[750px] h-[750px] bg-gradient-to-tl from-[#380710]/30 via-[#0f1116] to-transparent rounded-full blur-[150px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#660018]/[0.08] via-transparent to-[#f59e0b]/[0.06] rounded-full blur-[160px]" />

      {/* Blueprint Grid Layer */}
      <div className="blueprint-grid absolute inset-0" />

      {/* Laser Scan Sweep Line */}
      {scanlineEnabled && <div className="laser-scan-line" />}

      {/* Living Laboratory Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" id="lab-research-canvas" />

      {/* Lab Telemetry Axis & Coordinate Overlays */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-6 text-[9px] font-mono text-white/15 select-none hidden lg:flex">
        <div>+ GANTRY_POS: [X: 1420.2, Y: 890.4]</div>
        <div>+ KINEMATICS: 6-DOF ZERO-LAG</div>
        <div>+ PNEUMATIC: 6.2 BAR</div>
        <div className="w-8 h-px bg-white/10" />
        <div id="telemetry-rag-status-marker">
          // RAG_STATE : {ragState.toUpperCase()}
        </div>
      </div>

      <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-6 text-[9px] font-mono text-white/15 items-end select-none hidden lg:flex">
        <div>ROS2_RTPS :: OK</div>
        <div>CAN_DBC_HASH : #0x9AE4</div>
        <div>VECTORS_ACTIVE : 482,190</div>
        <div className="w-8 h-px bg-white/10" />
        <div>PRECISION_THR : 0.820</div>
      </div>
    </div>
  );
};
