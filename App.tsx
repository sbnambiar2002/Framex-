
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense, User, MasterData, CompanyInfo } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import Footer from './components/Footer';
import * as api from './api';
import { AppLogo } from './components/AppLogo';

const App: React.FC = () => {
  // --- STATE INITIALIZATION ---
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [costCenters, setCostCenters] = useState<MasterData[]>([]);
  const [projectCodes, setProjectCodes] = useState<MasterData[]>([]);
  const [expensesCategories, setExpensesCategories] = useState<MasterData[]>([]);
  const [parties, setParties] = useState<MasterData[]>([]);
  
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // --- AUTH & DATA LOADING EFFECT ---
  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      const session = await api.getSession();
      const needsSetup = await api.checkIsInitialSetup();
      setIsInitialSetup(needsSetup);

      if (session?.user) {
        const profile = await api.getUserProfile(session.user.id);
        if (profile) {
          setLoggedInUser(profile);
          const data = await api.getInitialData();
          setUsers(data.users);
          setExpenses(data.expenses);
          setCompanyInfo(data.companyInfo);
          setCostCenters(data.costCenters);
          setProjectCodes(data.projectCodes);
          setExpensesCategories(data.expensesCategories);
          setParties(data.parties);
        } else {
           // This can happen if a user is deleted from the DB but not from auth.
           await api.logout();
        }
      } else if (!needsSetup) {
        // If not setting up and not logged in, fetch public company info
        const publicCompanyInfo = await api.getCompanyInfo();
        setCompanyInfo(publicCompanyInfo);
      }
      setIsLoading(false);
      setSessionChecked(true);
    };

    checkSessionAndLoadData();

    // Listen for Supabase auth events (e.g., for password recovery)
    const { data: { subscription } } = api.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      } else if (event === 'SIGNED_OUT') {
        setLoggedInUser(null);
        window.location.reload(); // Reload to clear all state on logout
      } else if (event === 'SIGNED_IN' && session?.user) {
         checkSessionAndLoadData();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // --- Auth and User Management ---
  // FIX: Updated adminData type to include the password property, which is required by api.adminSetup.
  const handleAdminSetup = async (adminData: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & { password: string }, companyData: Omit<CompanyInfo, 'logo_url' | 'id'>): Promise<{ success: boolean, message?: string }> => {
    const result = await api.adminSetup(adminData, companyData);
    if (result.success) {
      setIsInitialSetup(false);
    }
    return result;
  };
  
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = await api.login(email, pass);
    if (user) {
      setLoggedInUser(user);
      // Reload all data for the logged in user
      const data = await api.getInitialData();
      setUsers(data.users);
      setExpenses(data.expenses);
      setCompanyInfo(data.companyInfo);
      setCostCenters(data.costCenters);
      setProjectCodes(data.projectCodes);
      setExpensesCategories(data.expensesCategories);
      setParties(data.parties);
      return true;
    }
    return false;
  };

  const handleSignUp = async (userData: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & {password: string}): Promise<{ success: boolean, message?: string }> => {
    const result = await api.signUp(userData);
    // After signup, user needs to confirm their email, so we don't log them in automatically.
    // The UI will show a confirmation message.
    return result;
  };

  const handleLogout = useCallback(async () => {
    await api.logout();
    setLoggedInUser(null);
  }, []);

  const handleChangePassword = async (newPassword: string): Promise<boolean> => {
    if (loggedInUser) {
      const updatedUser = await api.updateUserPassword(newPassword);
      if (updatedUser) {
        setLoggedInUser({ ...loggedInUser, forcePasswordChange: false });
        return true;
      }
    }
    return false;
  };
  
  const handlePasswordReset = async (newPassword: string): Promise<boolean> => {
    const user = await api.updateUserPassword(newPassword);
    if (user) {
      setShowPasswordReset(false);
      sessionStorage.setItem('authMessage', JSON.stringify({type: 'success', message: 'Password updated successfully! You can now log in.'}));
      await api.logout();
      return true; // Page will reload after this
    } else {
      return false;
    }
  };
  
  const handleSendPasswordResetEmail = async (email: string) => {
    return api.sendPasswordResetEmail(email);
  }

  const addUser = async (user: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & { password?: string, role: 'admin' | 'user' }) => {
    return api.addUser(user);
  };

  const updateUser = async (updatedUser: User) => {
    const savedUser = await api.updateUserProfile(updatedUser);
    if (savedUser) {
      setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      if (loggedInUser?.id === savedUser.id) {
          setLoggedInUser(savedUser);
      }
    }
  };

  // --- Master Data Handlers ---
  const addMasterDataItem = async (type: 'costCenter' | 'projectCode' | 'expensesCategory' | 'party', name: string) => {
    const newItem = await api.addMasterDataItem(type, name);
    if (!newItem) return;
    switch (type) {
      case 'costCenter': setCostCenters(prev => [...prev, newItem]); break;
      case 'projectCode': setProjectCodes(prev => [...prev, newItem]); break;
      case 'expensesCategory': setExpensesCategories(prev => [...prev, newItem]); break;
      case 'party': setParties(prev => [...prev, newItem]); break;
    }
  };
  const updateMasterDataItem = async (item: MasterData) => {
    const updatedItem = await api.updateMasterDataItem(item);
    if (!updatedItem) return;
    switch (item.type) {
      case 'costCenter': setCostCenters(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i)); break;
      case 'projectCode': setProjectCodes(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i)); break;
      case 'expensesCategory': setExpensesCategories(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i)); break;
      case 'party': setParties(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i)); break;
    }
  };
  const deleteMasterDataItem = async (id: string, type: string) => {
    const success = await api.deleteMasterDataItem(id);
    if (success) {
      switch (type) {
        case 'costCenter': setCostCenters(prev => prev.filter(i => i.id !== id)); break;
        case 'projectCode': setProjectCodes(prev => prev.filter(i => i.id !== id)); break;
        case 'expensesCategory': setExpensesCategories(prev => prev.filter(i => i.id !== id)); break;
        case 'party': setParties(prev => prev.filter(i => i.id !== id)); break;
      }
    }
  };
  
  // --- Expense Handlers ---
  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    if (!loggedInUser) return;
    const newExpense = await api.addExpense(expense, loggedInUser.id);
    if (newExpense) {
      setExpenses(prev => [newExpense, ...prev]);
    }
  };
  const updateExpense = async (updatedExpense: Expense) => {
    const savedExpense = await api.updateExpense(updatedExpense);
    if (savedExpense) {
      setExpenses(prev => prev.map(exp => (exp.id === savedExpense.id ? savedExpense : exp)));
    }
  };
  const deleteExpense = async (id: string) => {
    const success = await api.deleteExpense(id);
    if (success) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  const displayedExpenses = useMemo(() => {
    if (!loggedInUser) return [];
    if (loggedInUser.role === 'admin') return expenses;
    return expenses.filter(exp => exp.created_by === loggedInUser.id);
  }, [loggedInUser, expenses]);

  const handleLogoUpload = async (file: File) => {
    const newCompanyInfo = await api.setLogo(file);
    if (newCompanyInfo) {
      setCompanyInfo(newCompanyInfo);
    }
  };
  
  const masterDataProps = useMemo(() => ({
    costCenters, expensesCategories, parties, projectCodes,
    addCostCenter: (name: string) => addMasterDataItem('costCenter', name),
    updateCostCenter: (item: MasterData) => updateMasterDataItem({ ...item, type: 'costCenter'}),
    deleteCostCenter: (id: string) => deleteMasterDataItem(id, 'costCenter'),
    addProjectCode: (name: string) => addMasterDataItem('projectCode', name),
    updateProjectCode: (item: MasterData) => updateMasterDataItem({ ...item, type: 'projectCode'}),
    deleteProjectCode: (id: string) => deleteMasterDataItem(id, 'projectCode'),
    addExpensesCategory: (name: string) => addMasterDataItem('expensesCategory', name),
    updateExpensesCategory: (item: MasterData) => updateMasterDataItem({ ...item, type: 'expensesCategory'}),
    deleteExpensesCategory: (id: string) => deleteMasterDataItem(id, 'expensesCategory'),
    addParty: (name: string) => addMasterDataItem('party', name),
    updateParty: (item: MasterData) => updateMasterDataItem({ ...item, type: 'party'}),
    deleteParty: (id: string) => deleteMasterDataItem(id, 'party'),
  }), [costCenters, expensesCategories, parties, projectCodes]);

  const userManagementProps = useMemo(() => ({
    users, addUser, updateUser
  }), [users]);

  if (!sessionChecked || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-light-gray">
        <AppLogo className="h-16 w-auto" />
        <div className="mt-4 flex items-center space-x-2 text-gray-500">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading Application...</span>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSetup={handleAdminSetup}
        onSignUp={handleSignUp}
        onSendPasswordResetEmail={handleSendPasswordResetEmail}
        isInitialSetup={isInitialSetup}
        companyInfo={companyInfo}
      />
    );
  }
  
  if (showPasswordReset) {
    return <ChangePasswordModal onChangePassword={handlePasswordReset} user={loggedInUser} isResetting={true} />
  }

  if (loggedInUser.forcePasswordChange) {
    return <ChangePasswordModal onChangePassword={handleChangePassword} user={loggedInUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header
        currentUser={loggedInUser}
        onLogout={handleLogout}
        onLogoUpload={handleLogoUpload}
        companyInfo={companyInfo}
      />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <Dashboard
          currentUser={loggedInUser}
          expenses={displayedExpenses}
          addExpense={addExpense}
          updateExpense={updateExpense}
          deleteExpense={deleteExpense}
          allUsers={users}
          masterDataProps={masterDataProps}
          userManagementProps={userManagementProps}
        />
      </main>
      <Footer companyInfo={companyInfo} />
    </div>
  );
};

export default App;
