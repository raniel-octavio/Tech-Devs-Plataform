function Bracket({ dir, h }: { dir: 'left' | 'right'; h: number }) {
  const d = dir === 'left' ? 'M16 3 L4 20 L16 37' : 'M4 3 L16 20 L4 37';
  return (
    <svg
      viewBox="0 0 20 40"
      height={h}
      width={h / 2}
      fill="none"
      style={{ filter: 'drop-shadow(0 0 6px rgba(47,123,255,.8))' }}
      aria-hidden
    >
      <path d={d} stroke="#2F7BFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 'sm', tagline = false }: { size?: 'sm' | 'lg'; tagline?: boolean }) {
  const font = size === 'lg' ? 76 : 24;
  const bracket = size === 'lg' ? 120 : 38;
  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        <Bracket dir="left" h={bracket} />
        <div className="flex flex-col items-center leading-[0.88]">
          <span
            className="text-gradient-silver font-display font-black italic tracking-tight"
            style={{ fontSize: font }}
          >
            TECH
          </span>
          <span
            className="text-gradient-blue font-display font-black italic tracking-tight"
            style={{ fontSize: font, filter: 'drop-shadow(0 0 10px rgba(47,123,255,.55))' }}
          >
            DEVS
          </span>
        </div>
        <Bracket dir="right" h={bracket} />
      </div>
      {tagline && (
        <div
          className="mt-3 flex items-center gap-3 font-semibold uppercase text-slate-300"
          style={{ fontSize: size === 'lg' ? 13 : 9, letterSpacing: '0.32em' }}
        >
          <span>Coding</span>
          <span className="text-neon">•</span>
          <span>Tech</span>
          <span className="text-neon">•</span>
          <span>Growth</span>
        </div>
      )}
    </div>
  );
}

export function Rocket({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 240" className={className} aria-hidden>
      <defs>
        <linearGradient id="rk-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset="0.35" stopColor="#FFB020" />
          <stop offset="1" stopColor="#FF6A00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rk-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0B1F5C" />
          <stop offset="0.5" stopColor="#2F7BFF" />
          <stop offset="1" stopColor="#0A173F" />
        </linearGradient>
        <filter id="rk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g className="origin-top animate-flicker" style={{ transformBox: 'fill-box' }}>
        <path
          d="M60 112 C36 156 48 204 60 238 C72 204 84 156 60 112Z"
          fill="#FF9A1F"
          opacity=".55"
          filter="url(#rk-glow)"
        />
        <path d="M60 112 C42 152 52 196 60 232 C68 196 78 152 60 112Z" fill="url(#rk-flame)" />
      </g>
      <path d="M36 74 L12 108 L36 100Z" fill="#1B4DD6" />
      <path d="M84 74 L108 108 L84 100Z" fill="#1B4DD6" />
      <path d="M60 4 C84 24 90 60 86 102 L34 102 C30 60 36 24 60 4Z" fill="url(#rk-body)" />
      <path d="M60 4 C66 30 66 70 62 102 L58 102 C54 70 54 30 60 4Z" fill="#8fd0ff" opacity=".25" />
      <circle cx="60" cy="54" r="11" fill="#07102a" stroke="#3CC8FF" strokeWidth="3" />
      <circle cx="60" cy="54" r="5" fill="#3CC8FF" opacity=".5" />
      <rect x="40" y="96" width="40" height="8" rx="3" fill="#0A173F" />
    </svg>
  );
}
