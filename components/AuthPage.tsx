import React, { useState, useEffect } from 'react';
import { User, CompanyInfo } from '../types';
import { FramexLogo } from './FramexLogo';
import { COUNTRIES } from '../constants';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => boolean;
  onSetup: (admin: Omit<User, 'id' | 'role' | 'forcePasswordChange'>, company: CompanyInfo) => { success: boolean, message?: string };
  isInitialSetup: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSetup, isInitialSetup }) => {
  const [isLoginView, setIsLoginView] = useState(!isInitialSetup);

  useEffect(() => {
    // This ensures the view switches correctly if the setup is completed.
    setIsLoginView(!isInitialSetup);
  }, [isInitialSetup]);

  // --- Login Form Logic ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onLogin(loginEmail, loginPassword);
    if (!success) {
      setLoginError('Invalid email or password.');
    }
  };

  // --- Admin Setup Form Logic ---
  const [setupFormData, setSetupFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    companyName: '',
    address: '',
    country: 'United States of America',
    taxIdType: 'EIN',
    taxIdNumber: '',
  });
  const [setupError, setSetupError] = useState('');
  
  const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSetupFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (setupFormData.password !== setupFormData.confirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }
    if (setupFormData.password.length < 6) {
      setSetupError('Password must be at least 6 characters long.');
      return;
    }

    const adminData: Omit<User, 'id' | 'role' | 'forcePasswordChange'> = {
      name: setupFormData.name,
      email: setupFormData.email,
      password: setupFormData.password,
      mobile: setupFormData.mobile,
    };

    const companyData: CompanyInfo = {
      name: setupFormData.companyName,
      address: setupFormData.address,
      taxInfo: {
        country: setupFormData.country,
        taxIdType: setupFormData.taxIdType,
        taxIdNumber: setupFormData.taxIdNumber,
      }
    };

    const result = onSetup(adminData, companyData);
    if (!result.success) {
        setSetupError(result.message || "An unexpected error occurred during setup.");
    }
  };
  
  const setupInputClasses = "block w-full px-1 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-primary transition-colors sm:text-sm";
  const loginInputClasses = "relative block w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  const renderLoginView = () => (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <FramexLogo className="h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">User Login</h2>
          <p className="mt-2 text-sm text-gray-600">Welcome to the Expense Tracker</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="space-y-4 rounded-md">
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              className={loginInputClasses}
              placeholder="Email address" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
            />
            <input 
              id="password-input" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              className={loginInputClasses}
              placeholder="Password" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
            />
          </div>
          {loginError && <p className="text-sm text-center text-red-600 pt-2">{loginError}</p>}
          <div>
            <button 
              type="submit" 
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
  );

  const renderSetupView = () => (
    <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
            <FramexLogo className="h-12 w-auto" />
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-center text-gray-800">Admin & Company Setup</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Welcome! Please enter your details to get started.</p>
        </div>
        <form className="mt-8 space-y-12" onSubmit={handleSetupSubmit}>
            <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Admin User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <input name="name" type="text" required placeholder="User Name" value={setupFormData.name} onChange={handleSetupChange} className={setupInputClasses} />
                <input name="email" type="email" required placeholder="Email Id" value={setupFormData.email} onChange={handleSetupChange} className={setupInputClasses} />
                <input name="password" type="password" required placeholder="Password (min. 6 characters)" value={setupFormData.password} onChange={handleSetupChange} className={setupInputClasses} />
                <input name="confirmPassword" type="password" required placeholder="Confirm Password" value={setupFormData.confirmPassword} onChange={handleSetupChange} className={setupInputClasses} />
                <div className="md:col-span-1">
                <input name="mobile" type="tel" placeholder="Mobile Number (Optional)" value={setupFormData.mobile} onChange={handleSetupChange} className={setupInputClasses} />
                </div>
            </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <input name="companyName" type="text" required placeholder="Company Name" value={setupFormData.companyName} onChange={handleSetupChange} className={`${setupInputClasses} md:col-span-2`} />
                <textarea name="address" required placeholder="Address" value={setupFormData.address} onChange={handleSetupChange} className={`${setupInputClasses} md:col-span-2`} rows={3}></textarea>
            </div>
            <h4 className="text-md font-medium text-gray-700 pt-2">Tax Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <select name="country" value={setupFormData.country} onChange={handleSetupChange} className={setupInputClasses}>
                {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
                </select>
                <input name="taxIdType" type="text" placeholder="Tax ID Type (e.g., EIN, GSTIN)" value={setupFormData.taxIdType} onChange={handleSetupChange} className={setupInputClasses} />
                <input name="taxIdNumber" type="text" placeholder="Tax ID Number" value={setupFormData.taxIdNumber} onChange={handleSetupChange} className={setupInputClasses} />
            </div>
            </div>
            {setupError && <p className="text-sm text-center text-red-600">{setupError}</p>}
            <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Complete Setup</button>
            </div>
        </form>
    </div>
  );
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-gray py-12 px-4 sm:px-6 lg:px-8">
        {isLoginView ? renderLoginView() : renderSetupView()}
        <div className="mt-6 text-center text-sm">
            {isInitialSetup && (
                <p className="text-gray-600">
                    {isLoginView ? "Need to setup your company?" : "Already have an account?"}{' '}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary hover:text-indigo-500">
                        {isLoginView ? "Admin Setup" : "User Login"}
                    </button>
                </p>
            )}
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
           <p>Powered by <span className="font-semibold">Framex Technologies</span></p>
        </div>
    </div>
  );
};

export default AuthPage;