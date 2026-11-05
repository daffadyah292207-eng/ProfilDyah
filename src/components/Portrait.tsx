export function PortraitArt() {
  return (
    <svg
      viewBox="0 0 400 488"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustrasi abstrak tubuh manusia dalam gerakan"
    >
      <defs>
        <linearGradient id="portrait-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2f6b5a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#f5f0e6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#c85834" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="portrait-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14211d" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#14211d" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="portrait-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffdf8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#fffdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="488" fill="url(#portrait-bg)" />
      <rect width="400" height="488" fill="url(#portrait-glow)" />

      <g opacity="0.18" stroke="#14211d" strokeWidth="1">
        {Array.from({ length: 13 }).map((_, index) => (
          <line key={`v-${index}`} x1={index * 34} y1="0" x2={index * 34} y2="488" />
        ))}
        {Array.from({ length: 15 }).map((_, index) => (
          <line key={`h-${index}`} x1="0" y1={index * 34} x2="400" y2={index * 34} />
        ))}
      </g>

      <circle cx="316" cy="112" r="104" fill="none" stroke="#14211d" strokeOpacity="0.18" />
      <circle cx="316" cy="112" r="74" fill="none" stroke="#14211d" strokeOpacity="0.12" strokeDasharray="3 7" />
      <circle cx="316" cy="112" r="6" fill="#c85834" />

      <g fill="none" stroke="url(#portrait-ink)" strokeWidth="3.2" strokeLinecap="round">
        <circle cx="203" cy="118" r="27" fill="#fffdf8" fillOpacity="0.35" />
        <path d="M203 146c-1 14 2 22 2 32" />
        <path d="M153 191c15-17 33-25 50-25 20 0 39 9 52 27" />
        <path d="M206 169c8 44 10 84 6 128" strokeWidth="3.8" />
        <path d="M169 291c11 21 25 30 41 30 18 0 31-8 42-27" />
        <path d="M155 195c-22 28-35 55-36 80-1 16-5 27-12 39" />
        <path d="M259 195c15 17 27 35 42 42 9 4 18 3 26-3" />
        <path d="M186 314c-11 38-17 74-20 120" />
        <path d="M228 314c12 37 22 74 34 118" />
        <path d="M148 438c8-5 19-7 27-1" />
        <path d="M248 438c10-6 22-5 31 1" />
      </g>

      <g fill="#c85834">
        <circle cx="203" cy="118" r="4" />
        <circle cx="155" cy="195" r="5.5" />
        <circle cx="259" cy="195" r="5.5" />
        <circle cx="118" cy="275" r="4.5" />
        <circle cx="300" cy="238" r="4.5" />
        <circle cx="169" cy="291" r="4.5" />
        <circle cx="253" cy="292" r="4.5" />
        <circle cx="184" cy="356" r="4" />
        <circle cx="237" cy="356" r="4" />
      </g>

      <g fill="none" stroke="#c85834" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 8" opacity="0.85">
        <path d="M300 210c25-12 39-38 37-63" />
        <path d="M110 257c-15-19-17-45-8-67" />
      </g>

      <g fontFamily="Manrope, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="2.2" fill="#14211d" opacity="0.55">
        <text x="34" y="40" transform="rotate(-90 34 40)">MOTION · BALANCE · RECOVERY</text>
        <text x="318" y="454" transform="rotate(-90 318 454)">FISIOTERAPI / 2026</text>
      </g>

      <g fontFamily="Fraunces, serif" fill="#14211d" opacity="0.16">
        <text x="252" y="430" fontSize="118" letterSpacing="-8">D</text>
      </g>
    </svg>
  );
}
