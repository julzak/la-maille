"use client";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  showTagline?: boolean;
}

// SVG logo component - uses the actual logo file
// Logo SVG dimensions: 220x155 (ratio 1.42:1)
// Mobile: 40px height → 57px width
// Desktop: 48px height → 68px width
export function Logo({ className = "", showTagline = true }: LogoProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-lamaille.svg"
        alt="La Maille"
        className="h-[40px] md:h-[48px] w-auto"
        style={{ minHeight: '40px' }}
      />
      {showTagline && (
        <span className="text-xs md:text-sm text-muted-foreground mt-1">
          your French knitting studio
        </span>
      )}
    </div>
  );
}

// Simple text-based logo - lightweight fallback
// Uses brand colors: écru #F5F0E6, coral #E07A5F
export function LogoText({
  variant = "dark",
  className = "",
  showTagline = true
}: LogoProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className="logo-text text-xl tracking-wider"
        style={{
          color: variant === "dark" ? "#F5F0E6" : "#2D2A26"
        }}
      >
        LA MA
        <span style={{ color: "#E07A5F" }}>I</span>
        LLE
      </span>
      {showTagline && (
        <span className="text-xs text-muted-foreground -mt-0.5">
          your French knitting studio
        </span>
      )}
    </div>
  );
}
