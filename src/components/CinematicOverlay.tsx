import { useEffect, useState } from 'react';

export function CinematicOverlay() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      {/* 鼠标柔光 - 极淡 */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
        style={{
          background: `radial-gradient(500px circle at ${pos.x * 100}% ${
            pos.y * 100
          }%, rgba(212,175,55,0.04), transparent 55%)`,
        }}
      />

      {/* 暗角 - 极淡 */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* 信箱式黑边 - 极窄、常驻 */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[55] h-[2.5vh] bg-black" />
      <div className="pointer-events-none fixed left-0 right-0 bottom-0 z-[55] h-[2.5vh] bg-black" />
    </>
  );
}
