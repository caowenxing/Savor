import React from 'react';

/**
 * Savor Logo SVG Component
 * Based on the design: Orange figure jumping from pink shell with blue waves
 */
export const SavorLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48, 
  className = '' 
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue waves */}
      <g id="waves">
        <path
          d="M 20 120 Q 40 110, 60 120 T 100 120 T 140 120 T 180 120 L 180 160 Q 180 170, 170 170 L 30 170 Q 20 170, 20 160 Z"
          fill="#0099CC"
        />
        <path
          d="M 10 130 Q 30 120, 50 130 T 90 130 T 130 130 T 170 130 L 170 165 Q 170 175, 160 175 L 20 175 Q 10 175, 10 165 Z"
          fill="#33B5E5"
          opacity="0.7"
        />
      </g>

      {/* Pink shell/petals background */}
      <g id="shell">
        {/* Main circle */}
        <circle cx="100" cy="80" r="55" fill="#FF69B4" />
        
        {/* Petal lines */}
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(45 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(90 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(135 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(180 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(225 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(270 100 80)" />
        <line x1="100" y1="25" x2="100" y2="50" stroke="#FFB3D9" strokeWidth="8" strokeLinecap="round" opacity="0.7" transform="rotate(315 100 80)" />
      </g>

      {/* Orange stick figure */}
      <g id="figure">
        {/* Head */}
        <circle cx="100" cy="50" r="10" fill="#FF8C00" />
        
        {/* Body */}
        <rect
          x="97"
          y="62"
          width="6"
          height="20"
          fill="#FF8C00"
        />
        
        {/* Left arm raised */}
        <line
          x1="97"
          y1="68"
          x2="75"
          y2="50"
          stroke="#FF8C00"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Right arm raised */}
        <line
          x1="103"
          y1="68"
          x2="125"
          y2="50"
          stroke="#FF8C00"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Left leg */}
        <line
          x1="97"
          y1="82"
          x2="88"
          y2="102"
          stroke="#FF8C00"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Right leg */}
        <line
          x1="103"
          y1="82"
          x2="112"
          y2="102"
          stroke="#FF8C00"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Smile */}
        <path
          d="M 95 54 Q 100 56, 105 54"
          stroke="#FF8C00"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default SavorLogo;
