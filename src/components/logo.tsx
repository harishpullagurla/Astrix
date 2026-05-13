import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function AstrixLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="astrix-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" /> {/* Violet */}
          <stop offset="50%" stopColor="#3B82F6" /> {/* Electric Blue */}
          <stop offset="100%" stopColor="#22D3EE" /> {/* Cyan */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Stylized 'A' Geometric Mark */}
      <path
        d="M50 10L15 90H32L50 48L68 90H85L50 10Z"
        fill="url(#astrix-gradient)"
        filter="url(#glow)"
      />
      
      {/* Central 'Intelligence Spark' / Star Mark */}
      <path
        d="M50 42L54 52L64 54L54 56L50 66L46 56L36 54L46 52L50 42Z"
        fill="white"
        className="animate-pulse"
        style={{ transformOrigin: 'center' }}
      />

      {/* Connection Nodes representing the Network */}
      <circle cx="50" cy="10" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="15" cy="90" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="85" cy="90" r="3" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
