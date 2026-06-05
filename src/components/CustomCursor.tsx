import { useEffect, useRef } from 'react';

/**
 * 自定义鎏金光标
 * - 中心金点 + 外圈柔光（追随鼠标）
 * - 悬停在可交互元素上时放大
 * - 自动隐藏原生光标
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 触屏设备：直接返回
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let trailX = 0, trailY = 0;
    let mouseX = 0, mouseY = 0;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      // 环：跟随但有阻尼
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        const scale = hovering ? 1.8 : 1;
        ringRef.current.style.transform =
          `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${scale})`;
      }
      // 拖尾：更慢的阻尼
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;
      if (trailRef.current) {
        const op = hovering ? 0.5 : 0.9;
        trailRef.current.style.opacity = String(op);
        trailRef.current.style.transform =
          `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      const interactive = t.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor="hover"]'
      );
      hovering = !!interactive;
    };

    const onLeave = () => {
      // 离开窗口：隐藏
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (trailRef.current) trailRef.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
      if (trailRef.current) trailRef.current.style.opacity = '0.9';
    };

    // 隐藏原生光标
    document.documentElement.classList.add('custom-cursor-active');

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className="cursor-trail"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden
      />
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden
      />
    </>
  );
}
