interface DigitoryLogoProps {
  size?: number;
  className?: string;
}

export function DigitoryLogo({ size = 32, className }: DigitoryLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Row 1: top blocks */}
      <rect x="16" y="0" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="32" y="0" width="16" height="16" rx="2" fill="#F96D00" />

      {/* Row 2 */}
      <rect x="0" y="16" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="16" y="16" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="48" y="16" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="64" y="16" width="16" height="16" rx="2" fill="#F96D00" />

      {/* Row 3 */}
      <rect x="0" y="32" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="48" y="32" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="64" y="32" width="16" height="16" rx="2" fill="#F96D00" />

      {/* Row 4 */}
      <rect x="0" y="48" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="16" y="48" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="48" y="48" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="64" y="48" width="16" height="16" rx="2" fill="#F96D00" />

      {/* Row 5: bottom blocks */}
      <rect x="16" y="64" width="16" height="16" rx="2" fill="#F96D00" />
      <rect x="32" y="64" width="16" height="16" rx="2" fill="#F96D00" />
    </svg>
  );
}

export function DigitoryLogoFull({ logoSize = 32, className }: { logoSize?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <DigitoryLogo size={logoSize} />
      <span className="text-lg font-semibold">Digitory</span>
    </div>
  );
}
