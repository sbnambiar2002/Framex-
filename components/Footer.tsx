import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-center text-sm text-gray-500">
        <p>
          Powered by{' '}
          <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-indigo-700 hover:underline">
            Framex Technologies
          </a>
          . © {currentYear} All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
