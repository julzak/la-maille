"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  showTagline?: boolean;
}

// SVG logo component - uses the actual logo file
// Note: Current logo is 306KB (embedded PNG in SVG), consider getting a true vector version
export function Logo({ className = "", showTagline = true }: LogoProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative h-8 w-28 md:h-10 md:w-36">
        <Image
          src="/logo-lamaille.svg"
          alt="La Maille"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
      {showTagline && (
        <span className="text-xs text-muted-foreground">
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
