import React from 'react';
import { CompanyInfo } from '../types';

interface AppLogoProps extends React.SVGProps<SVGSVGElement> {
    companyInfo: CompanyInfo | null;
}

export const AppLogo: React.FC<AppLogoProps> = ({ companyInfo, ...props }) => {
  const darkGray = "#2E3A48";
  const primaryColor = "#4f46e5";
  
  const logoText = companyInfo?.name || 'ExpenseApp';
  const lastChar = logoText.slice(-1);
  const mainText = logoText.slice(0, -1);

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
        {mainText}<tspan fill={primaryColor}>{lastChar}</tspan>
      </text>
    </svg>
  );
};
