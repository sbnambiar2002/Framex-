import React from 'react';

export const FramexLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const darkGray = "#2E3A48";
  const primaryColor = "#4f46e5";

  return (
    <svg 
      viewBox="0 0 155 40"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text 
        x="0" 
        y="32"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="38"
        fontWeight="600"
        fontStyle="italic"
        fill={darkGray}
      >
        Frame<tspan fill={primaryColor}>X</tspan>
      </text>
    </svg>
  );
};
