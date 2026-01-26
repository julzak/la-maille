"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  showTagline?: boolean;
}

export function Logo({ variant = "dark", className = "", showTagline = true }: LogoProps) {
  // On dark backgrounds: use the écru color (#F5F0E6)
  // On light backgrounds: invert to show properly
  const filterStyle = variant === "light"
    ? { filter: "invert(1)" } // Invert for light backgrounds
    : { filter: "brightness(0) invert(0.94) sepia(0.05) saturate(0.3)" }; // Écru for dark

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative h-8 w-32" style={filterStyle}>
        <Image
          src="/logo-lamaille.svg"
          alt="La Maille"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
      {showTagline && (
        <span className="text-xs text-muted-foreground -mt-0.5">
          your French knitting studio
        </span>
      )}
    </div>
  );
}

// Simple text-based logo as fallback or for smaller sizes
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
