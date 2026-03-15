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
    <div className={`flex flex-col items-center ${className}`}>
      <div
        role="img"
        aria-label="La Maille"
        className="h-[80px] md:h-[100px]"
        style={{
          aspectRatio: '220 / 155',
          backgroundColor: '#E07A5F',
          WebkitMaskImage: 'url(/logo-lamaille.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: 'url(/logo-lamaille.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
      {showTagline && (
        <span className="text-xs md:text-sm text-muted-foreground -mt-6 text-center">
          your French knitting companion
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
          your French knitting companion
        </span>
      )}
    </div>
  );
}
