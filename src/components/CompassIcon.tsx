import React from 'react';

interface CompassIconProps {
  degrees: number; // meteorological degrees: direction wind is coming FROM (0=N)
  size?: number;   // px
  className?: string;
  color?: string;  // needle color (defaults to currentColor)
  showCardinal?: boolean; // show faint N/E/S/W markers
}

// Renders a minimal compass with a needle pointing to where the wind BLOWS TO (deg + 180)
const CompassIcon: React.FC<CompassIconProps> = ({
  degrees,
  size = 16,
  className = '',
  color = '#111827', // gray-900 for strong contrast by default
  showCardinal = false,
}) => {
  const toAngle = ((degrees + 180) % 360); // convert FROM -> TO
  const aria = `Wind direction: ${Math.round(degrees)}°, blows to ${(Math.round(toAngle))}°`;
  const ringOpacity = 0.6;
  const ringColor = '#6B7280'; // gray-500

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={aria}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* outer ring */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="#6B7280" strokeOpacity={ringOpacity} strokeWidth="1.6" />
      {/* minor ticks */}
      <g stroke="#6B7280" strokeOpacity={ringOpacity} strokeWidth="0.9">
        <line x1="12" y1="2" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="22" />
        <line x1="2" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="22" y2="12" />
      </g>
      {/* optional N/E/S/W markers */}
      {showCardinal && (
        <g fontSize="3" fill={ringColor} opacity={0.85} textAnchor="middle" dominantBaseline="middle">
          <text x="12" y="4.2">N</text>
          <text x="20" y="12">E</text>
          <text x="12" y="20">S</text>
          <text x="4" y="12">W</text>
        </g>
      )}
      {/* needle (triangle) pointing to TO direction */}
      <g transform={`rotate(${toAngle} 12 12)`}>
        {/* tail */}
        <polygon points="12,13.5 10.7,16.8 13.3,16.8" fill={color} opacity="0.55" />
        {/* head */}
        <polygon points="12,4.5 9.5,11.5 14.5,11.5" fill={color} />
        {/* hub */}
        <circle cx="12" cy="12" r="1.3" fill={color} opacity="0.95" />
      </g>
    </svg>
  );
};

export default CompassIcon;
