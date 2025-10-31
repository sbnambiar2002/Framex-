
import React, { useState, useEffect } from 'react';
import { User, CompanyInfo } from '../types';
import { AppLogo } from './AppLogo';
import { COUNTRIES } from '../constants';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  // FIX: Updated the type of the 'admin' parameter in the onSetup prop to include the password, ensuring type consistency with the implementation in App.tsx.
  onSetup: (admin: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & { password: string }, company: Omit<CompanyInfo, 'id' | 'logo_url'>) => Promise<{ success: boolean, message?: string }>;
  onSignUp: (user: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & {password: string}) => Promise<{ success: boolean, message?: string }>;
  onSendPasswordResetEmail: (email: string) => Promise<boolean>;
  isInitialSetup: boolean;
  companyInfo: CompanyInfo | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSetup, onSignUp, isInitialSetup, companyInfo, onSendPasswordResetEmail }) => {
  const [view, setView] = useState<'choice' | 'login' | 'signup'>('choice');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [setupSuccessMessage, setSetupSuccessMessage] = useState('');
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState('');
  const [authMessage, setAuthMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Admin Setup Form State ---
  const [setupFormData, setSetupFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    companyName: '', address: '', country: 'United States of America', taxIdType: 'EIN', taxIdNumber: '',
  });
  const [setupError, setSetupError] = useState('');
  
  // --- Public Sign Up Form State ---
  const [signUpFormData, setSignUpFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [signUpError, setSignUpError] = useState('');

  // --- Password Recovery State ---
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  useEffect(() => {
    const messageStr = sessionStorage.getItem('authMessage');
    if (messageStr) {
      try {
        const message = JSON.parse(messageStr);
        setAuthMessage(message);
        sessionStorage.removeItem('authMessage');
      } catch (e) {
        console.error("Could not parse auth message from session storage", e);
        sessionStorage.removeItem('authMessage');
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = await onLogin(loginEmail, loginPassword);
    if (!success) {
      setLoginError('Invalid email or password.');
    }
  };
  
  const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSetupFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (setupFormData.password !== setupFormData.confirmPassword) {
      setSetupError('Passwords do not match.'); return;
    }
    if (setupFormData.password.length < 6) {
      setSetupError('Password must be at least 6 characters long.'); return;
    }
    const adminData = { name: setupFormData.name, email: setupFormData.email, password: setupFormData.password };
    const companyData = { name: setupFormData.companyName, address: setupFormData.address, country: setupFormData.country, tax_id_type: setupFormData.taxIdType, tax_id_number: setupFormData.taxIdNumber };
    const result = await onSetup(adminData, companyData);
    if (result.success && result.message) {
        setSetupSuccessMessage(result.message);
    } else {
        setSetupError(result.message || "An unexpected error occurred during setup.");
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    if (signUpFormData.password !== signUpFormData.confirmPassword) {
      setSignUpError("Passwords do not match."); return;
    }
     if (signUpFormData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long.'); return;
    }
    const result = await onSignUp({ name: signUpFormData.name, email: signUpFormData.email, password: signUpFormData.password });
    if (result.success && result.message) {
        setSignUpSuccessMessage(result.message);
    } else {
        setSignUpError(result.message || "An unexpected error occurred during sign up.");
    }
  };
  
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      setRecoveryMessage('');
      const success = await onSendPasswordResetEmail(recoveryEmail);
      if (success) {
          setRecoveryMessage("If an account exists for this email, a password reset link has been sent.");
      } else {
          setRecoveryMessage("There was an error sending the reset email. Please try again.");
      }
  }

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
          {authMessage && (
            <div className={`p-3 my-4 rounded-md text-sm text-center ${authMessage.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
              {authMessage.message}
            </div>
          )}
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
      if (setupSuccessMessage) {
        return (
          <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-xl animate-fade-in">
              <AppLogo className="h-12 w-auto mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-800">Setup Successful!</h2>
              <p className="mt-4 text-gray-600">{setupSuccessMessage}</p>
              <button onClick={() => setView('login')} className="mt-6 w-full px-4 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700">Go to Login</button>
          </div>
        )
      }
      if (isInitialSetup) {
        return ( // Admin & Company Setup Form
          <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fade-in">
            <div className="flex flex-col items-center"><AppLogo className="h-12 w-auto" /><h2 className="mt-6 text-2xl sm:text-3xl font-bold text-center text-gray-800">Admin & Company Setup</h2><p className="mt-2 text-center text-sm text-gray-600">Welcome! Please enter your details to get started.</p></div>
            <form className="mt-8 space-y-12" onSubmit={handleSetupSubmit}>
                <div className="space-y-6"><h3 className="text-lg font-medium text-gray-900 border-b pb-2">Admin User Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"><input name="name" type="text" required placeholder="User Name" value={setupFormData.name} onChange={handleSetupChange} className={setupInputClasses} /><input name="email" type="email" required placeholder="Email Id" value={setupFormData.email} onChange={handleSetupChange} className={setupInputClasses} /><input name="password" type="password" required placeholder="Password (min. 6 characters)" value={setupFormData.password} onChange={handleSetupChange} className={setupInputClasses} /><input name="confirmPassword" type="password" required placeholder="Confirm Password" value={setupFormData.confirmPassword} onChange={handleSetupChange} className={setupInputClasses} /></div></div>
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
      if (signUpSuccessMessage) {
        return (
          <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-xl animate-fade-in">
              <AppLogo className="h-12 w-auto mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-800">Account Created!</h2>
              <p className="mt-4 text-gray-600">{signUpSuccessMessage}</p>
              <button onClick={() => { setView('login'); setSignUpSuccessMessage('') }} className="mt-6 w-full px-4 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700">Go to Login</button>
          </div>
        )
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
              {isInitialSetup ? 'The simple expense tracker for your team.' : (companyInfo ? `Your portal for ${companyInfo.name}` : 'Loading...')}
            </p>
        </div>
        <div className="mt-8 space-y-4">
            <button
              onClick={() => setView('login')}
              disabled={isInitialSetup}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Log In
            </button>
            <button
              onClick={() => setView('signup')}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg group hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {isInitialSetup ? 'Setup Application' : 'Sign Up'}
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
                  <h2 className="text-2xl font-bold text-gray-900">Password Recovery</h2>
                   <form onSubmit={handlePasswordResetRequest} className="space-y-4 mt-4">
                      <p className="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
                      <input type="email" placeholder="Your Email Address" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className={loginInputClasses} required />
                      {recoveryMessage && <p className="text-sm text-green-700">{recoveryMessage}</p>}
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700">Send Reset Link</button>
                  </form>

                  <button onClick={() => setShowForgotPassword(false)} className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Cancel
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AuthPage;
