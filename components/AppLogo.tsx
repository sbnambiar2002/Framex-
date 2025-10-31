import React from 'react';

interface AppLogoProps extends React.SVGProps<SVGSVGElement> {}

export const AppLogo: React.FC<AppLogoProps> = (props) => {
  const textColor = "#111827"; // Tailwind gray-900 for high contrast
  const primaryColor = "#4f46e5"; // Tailwind indigo-600
  
  const logoText = 'FrameX';
  const lastChar = logoText.slice(-1);
  const mainText = logoText.slice(0, -1);

  return (
    <svg 
      viewBox="0 0 170 50" // Adjusted for better aspect ratio and to prevent clipping
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text 
        x="0" 
        y="38" // Positioned to fit within the viewBox
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="40"
        fontWeight="700" // Reduced from 900 to bold
        fill={textColor}
        letterSpacing="-1"
        fontStyle="italic"
      >
        {mainText}<tspan fill={primaryColor}>{lastChar}</tspan>
      </text>
    </svg>
  );
};