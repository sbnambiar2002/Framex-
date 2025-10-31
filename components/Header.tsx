import React from 'react';
import { User, CompanyInfo } from '../types';
import { LogoUpload } from './LogoUpload';
import { AppLogo } from './AppLogo';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  logo: string | null;
  onLogoUpload: (file: File) => void;
  companyInfo: CompanyInfo | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, logo, onLogoUpload, companyInfo }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-4">
            <AppLogo className="h-8 w-auto" />
            <div className="hidden sm:block border-l pl-4 border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                Expense Tracker
              </h1>
              {companyInfo && <p className="text-sm text-gray-500">{companyInfo.name}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <LogoUpload logo={logo} onLogoUpload={onLogoUpload} />
            <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                    <p className="font-semibold text-gray-700">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    title="Logout"
                >
                    <LogoutIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
