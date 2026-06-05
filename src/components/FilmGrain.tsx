import { useEffect, useState } from 'react';

export function FilmGrain() {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeed((s) => s + 1), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="film-grain"
      aria-hidden
      key={seed}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }}
    />
  );
}
