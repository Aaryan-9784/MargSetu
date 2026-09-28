import React from 'react';

export const Logo = ({ size = 'md', showSubtitle = true, light = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Precision Engineered Transportation SVG Logo */}
      <div className={`${iconSizes[size]} flex-shrink-0 relative`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Base badge backdrop */}
          <rect width="48" height="48" rx="10" fill={light ? '#0B1F33' : '#0B1F33'} />
          
          {/* Bridge Suspension Cable / Arch */}
          <path
            d="M6 34C14 18 34 18 42 34"
            stroke="#D89B24"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Vertical Suspension Cables */}
          <line x1="16" y1="22" x2="16" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8" />
          <line x1="24" y1="19.5" x2="24" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8" />
          <line x1="32" y1="22" x2="32" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8" />

          {/* Bridge / Roadway Deck */}
          <path d="M4 34.5H44" stroke="#1976A5" strokeWidth="3" strokeLinecap="round" />

          {/* Dual Perspective Road Lanes vanishing forward */}
          <polygon points="12,44 19,35 29,35 36,44" fill="#123B5D" opacity="0.9" />
          {/* Road Center Dividing Markings */}
          <line x1="24" y1="36" x2="24" y2="44" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${titleSizes[size]} ${
              light ? 'text-white' : 'text-[#0B1F33]'
            }`}
          >
            ROAD<span className="text-[#D89B24]">SETU</span>
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1976A5]/20 text-[#1976A5] tracking-wider uppercase">
            Gov
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-wide mt-1 font-medium ${
              light ? 'text-slate-300' : 'text-[#627D98]'
            }`}
          >
            Transportation Infrastructure Asset System
          </span>
        )}
      </div>
    </div>
  );
};
