
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { BuildingIcon } from './icons/BuildingIcon';

interface LogoUploadProps {
  logo: string | null;
  onLogoUpload: (file: File) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onLogoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLogoUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <button
        onClick={handleLogoClick}
        className="group relative flex items-center justify-center w-16 h-16 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        title="Upload company logo"
      >
        {logo ? (
          <img src={logo} alt="Company Logo" className="w-full h-full rounded-lg object-contain" />
        ) : (
          <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
            <BuildingIcon className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-lg transition-all duration-200">
          <UploadIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </button>
    </div>
  );
};
