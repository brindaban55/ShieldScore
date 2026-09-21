import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
}) => {
  return (
    <div
      className={`relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-[0_12px_36px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Ambient specular hover radiance */}
      <div
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent pointer-events-none transition-opacity duration-500 blur-sm ${
          glow ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      />
      {/* Inner frosted obsidian surface */}
      <div className="relative rounded-[calc(1rem-1px)] bg-[#0D131F]/90 backdrop-blur-xl p-6 h-full flex flex-col justify-between overflow-hidden">
        {children}
      </div>
    </div>
  );
};
