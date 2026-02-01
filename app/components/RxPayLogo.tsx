// RxPay logo — matches attached image: 4 vertical panels, rounded top corners,
// dark grey top, bright blue bottom, thick black ascending curve, white "AKNA" (one letter per panel)

export function RxPayLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RxPay"
    >
      <defs>
        {/* Rounded top corners for whole logo */}
        <clipPath id="rxpay-rounded">
          <path d="M 0 3 Q 0 0 3 0 L 117 0 Q 120 0 120 3 L 120 32 L 0 32 Z" />
        </clipPath>
        <clipPath id="seg1"><rect x="0" y="0" width="30" height="32" /></clipPath>
        <clipPath id="seg2"><rect x="30" y="0" width="30" height="32" /></clipPath>
        <clipPath id="seg3"><rect x="60" y="0" width="30" height="32" /></clipPath>
        <clipPath id="seg4"><rect x="90" y="0" width="30" height="32" /></clipPath>
      </defs>
      <g clipPath="url(#rxpay-rounded)">
        {/* Thick black curve ascending left to right (divides grey above from blue below) */}
        <path
          d="M -1 24 Q 15 22 30 20 Q 45 17 60 14 Q 75 11 90 8 L 121 5"
          stroke="#000"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Segment 1: grey top, blue bottom */}
        <g clipPath="url(#seg1)">
          <rect x="0" y="0" width="30" height="32" fill="#374151" />
          <rect x="0" y="20" width="30" height="14" fill="#2563eb" />
        </g>
        {/* Segment 2 */}
        <g clipPath="url(#seg2)">
          <rect x="30" y="0" width="30" height="32" fill="#374151" />
          <rect x="30" y="16" width="30" height="18" fill="#2563eb" />
        </g>
        {/* Segment 3 */}
        <g clipPath="url(#seg3)">
          <rect x="60" y="0" width="30" height="32" fill="#374151" />
          <rect x="60" y="11" width="30" height="23" fill="#2563eb" />
        </g>
        {/* Segment 4 */}
        <g clipPath="url(#seg4)">
          <rect x="90" y="0" width="30" height="32" fill="#374151" />
          <rect x="90" y="5" width="30" height="29" fill="#2563eb" />
        </g>
      </g>
      <g clipPath="url(#rxpay-rounded)">
        {/* Thin black vertical dividers between panels */}
        <line x1="30" y1="0" x2="30" y2="32" stroke="#000" strokeWidth="1" />
        <line x1="60" y1="0" x2="60" y2="32" stroke="#000" strokeWidth="1" />
        <line x1="90" y1="0" x2="90" y2="32" stroke="#000" strokeWidth="1" />
      </g>
      {/* White AKNA — one letter per panel, centred in blue */}
      <text x="15" y="27" fill="#fff" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">A</text>
      <text x="45" y="27" fill="#fff" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">K</text>
      <text x="75" y="27" fill="#fff" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">N</text>
      <text x="105" y="27" fill="#fff" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">A</text>
    </svg>
  );
}
