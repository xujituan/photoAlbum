export function AuroraBackground() {
  return (
    <div className="aurora-bg">
      {/* 极光球群 - 仅 2 个，柔和 */}
      <div
        className="aurora-blob animate-aurora-1"
        style={{
          width: '55vw',
          height: '55vw',
          top: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(0,255,163,0.28) 0%, transparent 70%)',
        }}
      />
      <div
        className="aurora-blob animate-aurora-2"
        style={{
          width: '60vw',
          height: '60vw',
          bottom: '-25%',
          right: '-15%',
          background: 'radial-gradient(circle, rgba(255,0,110,0.22) 0%, transparent 70%)',
        }}
      />

      {/* 星空层 - 减少数量、提高克制 */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.45 }}
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="starGrad">
            <stop offset="0%" stopColor="#f5e6d3" stopOpacity="1" />
            <stop offset="100%" stopColor="#f5e6d3" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 73 + 19) % 100;
          const y = (i * 131 + 7) % 100;
          const r = ((i * 7) % 3) * 0.4 + 0.3;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={r}
              fill="url(#starGrad)"
              opacity={0.3 + (i % 3) * 0.15}
            >
              <animate
                attributeName="opacity"
                values={`${0.2 + (i % 3) * 0.15};${0.65};${0.2 + (i % 3) * 0.15}`}
                dur={`${4 + (i % 5)}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
