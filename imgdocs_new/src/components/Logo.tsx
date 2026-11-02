/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-10 w-10' }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} id="app-logo-graphics">
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="redArrowGrad" x1="160" y1="20" x2="30" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="40%" stopColor="#FF4F38" />
            <stop offset="85%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FFCC00" />
          </linearGradient>

          <linearGradient id="blueArrowGrad" x1="40" y1="180" x2="170" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0055FF" />
            <stop offset="45%" stopColor="#0088FF" />
            <stop offset="80%" stopColor="#00CFFF" />
            <stop offset="100%" stopColor="#30F2FF" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- RED/ORANGE LOOP (Left side, sweeps from top-right down to left) --- */}
        {/* Glow underlayer */}
        <path
          d="M 130,35 C 75,35 40,75 40,115 C 40,128 44,140 50,150"
          stroke="url(#redArrowGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#softGlow)"
        />
        {/* Main Red Track */}
        <path
          d="M 130,35 C 75,35 40,75 40,115 C 40,128 44,140 50,150"
          stroke="url(#redArrowGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Red Arrow Head (pointed down-left) */}
        <path
          d="M 28,155 L 64,130 L 52,168 Z"
          fill="url(#redArrowGrad)"
          filter="url(#softGlow)"
        />
        <path
          d="M 28,155 L 64,130 L 52,168 Z"
          fill="url(#redArrowGrad)"
        />

        {/* --- BLUE/CYAN LOOP (Right side, sweeps from bottom-left up to right) --- */}
        {/* Glow underlayer */}
        <path
          d="M 70,165 C 125,165 160,125 160,85 C 160,72 156,60 150,50"
          stroke="url(#blueArrowGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#softGlow)"
        />
        {/* Main Blue Track */}
        <path
          d="M 70,165 C 125,165 160,125 160,85 C 160,72 156,60 150,50"
          stroke="url(#blueArrowGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Blue Arrow Head (pointed up-right) */}
        <path
          d="M 172,45 L 136,70 L 148,32 Z"
          fill="url(#blueArrowGrad)"
          filter="url(#softGlow)"
        />
        <path
          d="M 172,45 L 136,70 L 148,32 Z"
          fill="url(#blueArrowGrad)"
        />

        {/* --- DIGITAL PIXEL BLOCKS (Floating dispersed fragments on the right) --- */}
        {/* Row/Cluster of pixel particles */}
        <rect x="140" y="80" width="8" height="8" rx="1.5" fill="#30F2FF" filter="url(#softGlow)" opacity="0.9" />
        <rect x="140" y="80" width="8" height="8" rx="1.5" fill="#30F2FF" />

        <rect x="152" y="92" width="7" height="7" rx="1" fill="#00CFFF" opacity="0.8" />
        <rect x="162" y="84" width="9" height="9" rx="1.5" fill="#0088FF" opacity="0.95" />
        <rect x="175" y="88" width="6" height="6" rx="1" fill="#30F2FF" opacity="0.7" />

        <rect x="148" y="106" width="8" height="8" rx="1.5" fill="#00CFFF" opacity="0.85" />
        <rect x="138" y="116" width="6" height="6" rx="1" fill="#0055FF" opacity="0.6" />
        <rect x="128" y="108" width="7" height="7" rx="1" fill="#30F2FF" opacity="0.5" />

        <rect x="158" y="108" width="5" height="5" rx="0.8" fill="#30F2FF" opacity="0.6" />
        <rect x="166" y="100" width="6" height="6" rx="1" fill="#0088FF" opacity="0.75" />
      </svg>
    </div>
  );
}
