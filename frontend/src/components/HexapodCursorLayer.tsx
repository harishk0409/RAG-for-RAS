import React, { useEffect, useRef } from 'react';

interface HexapodCursorLayerProps {
  enabled: boolean;
}

export const HexapodCursorLayer: React.FC<HexapodCursorLayerProps> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Instantaneous Pointer State
    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    let isVisible = true;
    let isHovered = false;
    let isClicking = false;

    // Kinematics
    let bodyHeading = -Math.PI / 2;
    let gaitPhase = 0;
    let idleTime = 0;
    let hoverFlare = 0;
    let breathCycle = 0;

    const legConfigs = [
      { id: 0, group: 1, side: -1, rootX: -9, rootY: -10, restX: -26, restY: -22, L1: 15, L2: 17 }, // FL
      { id: 1, group: 2, side: -1, rootX: -13, rootY: 0, restX: -32, restY: 0, L1: 15, L2: 17 }, // ML
      { id: 2, group: 1, side: -1, rootX: -9, rootY: 10, restX: -26, restY: 22, L1: 15, L2: 17 }, // RL
      { id: 3, group: 2, side: 1, rootX: 9, rootY: -10, restX: 26, restY: -22, L1: 15, L2: 17 }, // FR
      { id: 4, group: 1, side: 1, rootX: 13, rootY: 0, restX: 32, restY: 0, L1: 15, L2: 17 }, // MR
      { id: 5, group: 2, side: 1, rootX: 9, rootY: 10, restX: 26, restY: 22, L1: 15, L2: 17 }, // RR
    ];

    const legStates = legConfigs.map((cfg) => ({
      cfg,
      currentX: cfg.restX,
      currentY: cfg.restY,
      lift: 0,
    }));

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisible = true;
    };
    
    const onMouseLeave = () => {
      isVisible = false;
    };
    const onMouseEnter = () => {
      isVisible = true;
    };

    const interactiveSelector = 'a, button, input, textarea, select, [role="button"], [onclick]';
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest(interactiveSelector)) {
        isHovered = true;
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest(interactiveSelector)) {
        isHovered = false;
      }
    };
    let tapActive = false;
    let tapStart = 0;
    const TAP_LEG_ID = 3;
    const TAP_DURATION = 220;
    const TAP_LIFT = 9;

    const onMouseDown = () => {
      isClicking = true;
      tapActive = true;
      tapStart = performance.now();
    };
    const onMouseUp = () => {
      isClicking = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    function solveLocalIK(
      rx: number,
      ry: number,
      fx: number,
      fy: number,
      L1: number,
      L2: number,
      side: number
    ) {
      let dx = fx - rx;
      let dy = fy - ry;
      let dist = Math.sqrt(dx * dx + dy * dy);

      const maxReach = (L1 + L2) * 0.96;
      if (dist > maxReach) {
        const ratio = maxReach / (dist || 1);
        dx *= ratio;
        dy *= ratio;
        dist = maxReach;
        fx = rx + dx;
        fy = ry + dy;
      }
      const d = Math.max(1, dist);
      const baseAngle = Math.atan2(dy, dx);

      let cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
      cosA = Math.max(-1, Math.min(1, cosA));
      const alpha = Math.acos(cosA);

      const bendSign = side < 0 ? -1 : 1;
      const femurAngle = baseAngle + bendSign * alpha;

      const kneeX = rx + Math.cos(femurAngle) * L1;
      const kneeY = ry + Math.sin(femurAngle) * L1;

      return { kneeX, kneeY, footX: fx, footY: fy };
    }

    let lastTime = performance.now();
    let cursorAlpha = 1;

    const renderHexapodCursor = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      cursorAlpha += ((isVisible ? 1 : 0) - cursorAlpha) * 0.2;
      if (cursorAlpha < 0.01) {
        animId = requestAnimationFrame(renderHexapodCursor);
        return;
      }

      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const speed = Math.hypot(dx, dy);
      lastMouseX = mouseX;
      lastMouseY = mouseY;

      if (speed > 0.8) {
        const movementHeading = Math.atan2(dy, dx) + Math.PI / 2;
        const diff =
          ((movementHeading - bodyHeading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        bodyHeading += diff * Math.min(1, 14 * dt);
      }

      const strideLength = 22;
      if (speed > 0.4) {
        const phaseInc = Math.min((speed / strideLength) * Math.PI, Math.PI * 0.45);
        gaitPhase += phaseInc;
        idleTime = 0;
      } else {
        idleTime += dt;
      }

      const targetHoverFlare = isHovered ? 1.0 : 0.0;
      hoverFlare += (targetHoverFlare - hoverFlare) * 0.16;

      breathCycle += dt * 2.4;
      const breathOffset = idleTime > 0.1 ? Math.sin(breathCycle) * 0.6 : 0;

      legStates.forEach((leg) => {
        const cfg = leg.cfg;
        const isGroup1 = cfg.group === 1;

        const flareFactor = 1.0 + hoverFlare * 0.15;
        const restTargetX = cfg.restX * flareFactor;
        const restTargetY = cfg.restY * flareFactor;

        if (speed > 0.4) {
          const legPhase = isGroup1 ? gaitPhase : gaitPhase + Math.PI;
          const cycleProgress =
            ((legPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const isSwing = cycleProgress < Math.PI;
          const t = cycleProgress / Math.PI;

          if (isSwing) {
            const swingSpan = 9.0;
            const swingLead = (t - 0.5) * 2.0 * swingSpan;
            const liftPeak = 7.0;
            leg.lift = Math.sin(t * Math.PI) * liftPeak;
            leg.currentX = restTargetX;
            leg.currentY = restTargetY - swingLead;
          } else {
            const stanceT = (cycleProgress - Math.PI) / Math.PI;
            const stanceLead = (0.5 - stanceT) * 2.0 * 9.0;
            leg.lift = 0;
            leg.currentX = restTargetX;
            leg.currentY = restTargetY - stanceLead;
          }
                } else {
          const settleLerp = 0.22;
          leg.currentX += (restTargetX - leg.currentX) * settleLerp;
          leg.currentY += (restTargetY + breathOffset - leg.currentY) * settleLerp;
          leg.lift += (0 - leg.lift) * settleLerp;
        }
      });

      if (tapActive) {
        const elapsed = now - tapStart;
        if (elapsed < TAP_DURATION) {
          const t = elapsed / TAP_DURATION;
          const tapLeg = legStates.find((l) => l.cfg.id === TAP_LEG_ID);
          if (tapLeg) tapLeg.lift = Math.sin(t * Math.PI) * TAP_LIFT;
        } else {
          tapActive = false;
        }
      }

      
      
      // Render
      ctx.save();
      ctx.globalAlpha = cursorAlpha;
      ctx.translate(mouseX, mouseY);
      ctx.rotate(bodyHeading);

      const BASE_SCALE = 0.55;
      const clickScale = (1.0 + hoverFlare * 0.08) * BASE_SCALE;
      ctx.scale(clickScale, clickScale);

      // Contact shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 15, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      legStates.forEach((leg) => {
        const shadowAlpha = Math.max(0.12, 0.42 - leg.lift * 0.04);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
          leg.currentX,
          leg.currentY + 2 + leg.lift * 0.3,
          3,
          2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
      ctx.restore();

      // Mechanical Legs (Pure White + Silver)
      legStates.forEach((leg) => {
        const cfg = leg.cfg;
        const ik = solveLocalIK(
          cfg.rootX,
          cfg.rootY,
          leg.currentX,
          leg.currentY - leg.lift,
          cfg.L1,
          cfg.L2,
          cfg.side
        );

        // Femur
        ctx.beginPath();
        ctx.moveTo(cfg.rootX, cfg.rootY);
        ctx.lineTo(ik.kneeX, ik.kneeY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.moveTo(cfg.rootX, cfg.rootY);
        ctx.lineTo(ik.kneeX, ik.kneeY);
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Hip Pivot
        ctx.beginPath();
        ctx.arc(cfg.rootX, cfg.rootY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Tibia
        ctx.beginPath();
        ctx.moveTo(ik.kneeX, ik.kneeY);
        ctx.lineTo(ik.footX, ik.footY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Knee Joint
        ctx.beginPath();
        ctx.arc(ik.kneeX, ik.kneeY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#18181b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ik.kneeX, ik.kneeY, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = isHovered ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Foot tip
        ctx.beginPath();
        ctx.arc(ik.footX, ik.footY, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // Abdomen Plate
      ctx.beginPath();
      ctx.ellipse(0, 11, 8.5, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Reactor Core
      const corePulse =
        0.6 + 0.4 * Math.sin(breathCycle * 2.0) + (isHovered ? 0.3 : 0);
      ctx.beginPath();
      ctx.ellipse(0, 11, 4.2, 6.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 11, 2.4, 3.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, corePulse)})`;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cephalothorax Carapace
      ctx.beginPath();
      ctx.ellipse(0, -3.5, 8.8, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Micro slits
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(-2, -1);
      ctx.moveTo(5, -3);
      ctx.lineTo(2, -1);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Optical Sensors
      const eyeGlow = isHovered ? 12 : 6;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = eyeGlow;

      ctx.beginPath();
      ctx.arc(-3.6, -9.8, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-3.6, -9.8, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(3.6, -9.8, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3.6, -9.8, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Antennas
      ctx.beginPath();
      ctx.moveTo(-2.5, -12);
      ctx.lineTo(-4.8, -16.5);
      ctx.moveTo(2.5, -12);
      ctx.lineTo(4.8, -16.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Central crosshair & reticle
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = isHovered ? 10 : 5;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, -7);
      ctx.moveTo(0, 7);
      ctx.lineTo(0, 9);
      ctx.moveTo(-9, 0);
      ctx.lineTo(-7, 0);
      ctx.moveTo(7, 0);
      ctx.lineTo(9, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(renderHexapodCursor);
    };

    animId = requestAnimationFrame(renderHexapodCursor);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      id="hexapod-cursor-layer"
      className="fixed inset-0 pointer-events-none z-[9999999] w-full h-full"
    />
  );
};
