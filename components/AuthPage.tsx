import React, { useState } from 'react';
import { User, CompanyInfo } from '../types';
import { AppLogo } from './AppLogo';
import { COUNTRIES } from '../constants';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => boolean;
  onSetup: (admin: Omit<User, 'id' | 'role' | 'forcePasswordChange'>, company: CompanyInfo) => { success: boolean, message?: string };
  onSignUp: (user: Omit<User, 'id' | 'role' | 'forcePasswordChange' | 'mobile'> & {password: string}) => { success: boolean, message?: string };
  isInitialSetup: boolean;
  companyInfo: CompanyInfo | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSetup, onSignUp, isInitialSetup, companyInfo }) => {
  const [view, setView] = useState<'choice' | 'login' | 'signup'>('choice');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    name: '', email: '', password: '', confirmPassword: '', mobile: '',
    companyName: '', address: '', country: 'United States of America', taxIdType: 'EIN', taxIdNumber: '',
  });
  const [setupError, setSetupError] = useState('');
  
  const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSetupFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (setupFormData.password !== setupFormData.confirmPassword) {
      setSetupError('Passwords do not match.'); return;
    }
    if (setupFormData.password.length < 6) {
      setSetupError('Password must be at least 6 characters long.'); return;
    }
    const adminData = { name: setupFormData.name, email: setupFormData.email, password: setupFormData.password, mobile: setupFormData.mobile };
    const companyData = { name: setupFormData.companyName, address: setupFormData.address, taxInfo: { country: setupFormData.country, taxIdType: setupFormData.taxIdType, taxIdNumber: setupFormData.taxIdNumber }};
    const result = onSetup(adminData, companyData);
    if (!result.success) {
        setSetupError(result.message || "An unexpected error occurred during setup.");
    }
  };

  // --- Public Sign Up Form Logic ---
  const [signUpFormData, setSignUpFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [signUpError, setSignUpError] = useState('');

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    if (signUpFormData.password !== signUpFormData.confirmPassword) {
      setSignUpError("Passwords do not match."); return;
    }
     if (signUpFormData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long.'); return;
    }
    const result = onSignUp({ name: signUpFormData.name, email: signUpFormData.email, password: signUpFormData.password });
    if (!result.success) {
        setSignUpError(result.message || "An unexpected error occurred during sign up.");
    }
  };
  
  const loginInputClasses = "relative block w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const setupInputClasses = "block w-full px-1 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-primary transition-colors sm:text-sm";

  const renderContent = () => {
    if (view === 'login') {
      return ( // Login Form
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <AppLogo className="h-12 w-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">User Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              {companyInfo ? `Log in to ${companyInfo.name}` : 'Welcome back! Please log in.'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="space-y-4 rounded-md">
              <input id="email-address" name="email" type="email" autoComplete="email" required className={loginInputClasses} placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <input id="password-input" name="password" type="password" autoComplete="current-password" required className={loginInputClasses} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            {loginError && <p className="text-sm text-center text-red-600 pt-2">{loginError}</p>}
            <div>
              <button type="submit" className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Log In
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <button type="button" onClick={() => setShowForgotPassword(true)} className="font-medium text-primary hover:text-indigo-500">
                Forgot your password?
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setView('signup')} className="font-medium text-primary hover:text-indigo-500">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      );
    }
    
    if (view === 'signup') {
      if (isInitialSetup) {
        return ( // Admin & Company Setup Form
          <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fade-in">
            <div className="flex flex-col items-center"><AppLogo className="h-12 w-auto" /><h2 className="mt-6 text-2xl sm:text-3xl font-bold text-center text-gray-800">Admin & Company Setup</h2><p className="mt-2 text-center text-sm text-gray-600">Welcome! Please enter your details to get started.</p></div>
            <form className="mt-8 space-y-12" onSubmit={handleSetupSubmit}>
                <div className="space-y-6"><h3 className="text-lg font-medium text-gray-900 border-b pb-2">Admin User Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"><input name="name" type="text" required placeholder="User Name" value={setupFormData.name} onChange={handleSetupChange} className={setupInputClasses} /><input name="email" type="email" required placeholder="Email Id" value={setupFormData.email} onChange={handleSetupChange} className={setupInputClasses} /><input name="password" type="password" required placeholder="Password (min. 6 characters)" value={setupFormData.password} onChange={handleSetupChange} className={setupInputClasses} /><input name="confirmPassword" type="password" required placeholder="Confirm Password" value={setupFormData.confirmPassword} onChange={handleSetupChange} className={setupInputClasses} /><div className="md:col-span-1"><input name="mobile" type="tel" placeholder="Mobile Number (Optional)" value={setupFormData.mobile} onChange={handleSetupChange} className={setupInputClasses} /></div></div></div>
                <div className="space-y-6"><h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"><input name="companyName" type="text" required placeholder="Company Name" value={setupFormData.companyName} onChange={handleSetupChange} className={`${setupInputClasses} md:col-span-2`} /><textarea name="address" required placeholder="Address" value={setupFormData.address} onChange={handleSetupChange} className={`${setupInputClasses} md:col-span-2`} rows={3}></textarea></div><h4 className="text-md font-medium text-gray-700 pt-2">Tax Info</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6"><select name="country" value={setupFormData.country} onChange={handleSetupChange} className={setupInputClasses}>{COUNTRIES.map(country => (<option key={country} value={country}>{country}</option>))}</select><input name="taxIdType" type="text" placeholder="Tax ID Type (e.g., EIN, GSTIN)" value={setupFormData.taxIdType} onChange={handleSetupChange} className={setupInputClasses} /><input name="taxIdNumber" type="text" placeholder="Tax ID Number" value={setupFormData.taxIdNumber} onChange={handleSetupChange} className={setupInputClasses} /></div></div>
                {setupError && <p className="text-sm text-center text-red-600">{setupError}</p>}
                <div className="pt-4 flex items-center justify-between">
                    <button type="button" onClick={() => setView('choice')} className="text-sm font-medium text-primary hover:text-indigo-500">
                      &larr; Back
                    </button>
                    <button type="submit" className="flex justify-center py-3 px-8 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Complete Setup</button>
                </div>
            </form>
          </div>
        );
      }
      return ( // Public Sign Up Form
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center"><AppLogo className="h-12 w-auto" /><h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an Account</h2><p className="mt-2 text-sm text-gray-600">Join {companyInfo?.name || 'the team'}</p></div>
            <form className="mt-8 space-y-6" onSubmit={handleSignUpSubmit}>
              <div className="space-y-4 rounded-md">
                  <input name="name" type="text" required className={loginInputClasses} placeholder="Full Name" value={signUpFormData.name} onChange={handleSignUpChange} />
                  <input name="email" type="email" autoComplete="email" required className={loginInputClasses} placeholder="Email address" value={signUpFormData.email} onChange={handleSignUpChange} />
                  <input name="password" type="password" required className={loginInputClasses} placeholder="Password (min. 6 characters)" value={signUpFormData.password} onChange={handleSignUpChange} />
                  <input name="confirmPassword" type="password" required className={loginInputClasses} placeholder="Confirm Password" value={signUpFormData.confirmPassword} onChange={handleSignUpChange} />
              </div>
              {signUpError && <p className="text-sm text-center text-red-600 pt-2">{signUpError}</p>}
              <div><button type="submit" className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Sign Up</button></div>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600"><p>Already have an account?{' '}<button type="button" onClick={() => setView('login')} className="font-medium text-primary hover:text-indigo-500">Log In</button></p></div>
        </div>
      );
    }

    return ( // Choice Screen
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
            <AppLogo className="h-12 w-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to FrameX</h2>
            <p className="mt-2 text-sm text-gray-600">
              {companyInfo ? `Your portal for ${companyInfo.name}` : 'The simple expense tracker for your team.'}
            </p>
        </div>
        <div className="mt-8 space-y-4">
            <button
              onClick={() => setView('login')}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => setView('signup')}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg group hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Sign Up
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-gray py-12 px-4 sm:px-6 lg:px-8">
      {renderContent()}
      {showForgotPassword && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowForgotPassword(false)}>
              <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-gray-900">Password Reset</h2>
                  <p className="mt-4 text-gray-600">To reset your password, please contact your company's administrator. They will be able to provide you with a temporary password.</p>
                  <div className="mt-6"><button onClick={() => setShowForgotPassword(false)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">OK</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AuthPage;
