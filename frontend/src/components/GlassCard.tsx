import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverGlow = false }) => {
  return (
    <div className={`glass-panel rounded-2xl p-6 glow-card ${hoverGlow ? 'glass-panel-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};
