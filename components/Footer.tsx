import React from 'react';
import { CompanyInfo } from '../types';

interface FooterProps {
    companyInfo: CompanyInfo | null;
}

const Footer: React.FC<FooterProps> = ({ companyInfo }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-center text-sm text-gray-500">
        <p>
          {companyInfo ? companyInfo.name : 'Expense Tracker'} © {currentYear} All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;