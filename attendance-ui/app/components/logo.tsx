export function AuroraMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="aurora-grad-a" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="aurora-grad-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="aurora-grad-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fda4af" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#2d3a2e" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="17.25" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <path
        d="M11 41C17 27 24 20 34 18"
        stroke="url(#aurora-grad-a)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M16 50c8-17 17-25 31-29"
        stroke="url(#aurora-grad-b)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M24 57c10-16 19-25 29-31"
        stroke="url(#aurora-grad-c)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
