import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense, User, MasterData, CompanyInfo } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import Footer from './components/Footer';

// Helper to check if localStorage is available and writable
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__testLocalStorage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn("localStorage is not available in this browser environment.");
    return false;
  }
};

// Generic function to load from localStorage.
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (!isLocalStorageAvailable()) {
      return defaultValue;
    }
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? (JSON.parse(storedData) as T) : defaultValue;
    } catch (error) {
      console.error(`Failed to load or parse ${key} from localStorage. Data might be corrupted.`, error);
      localStorage.removeItem(key); // Clean up corrupted data
      return defaultValue;
    }
};

// Generic function to save to localStorage with enhanced error handling
const saveToLocalStorage = <T,>(key:string, data: T) => {
    if (!isLocalStorageAvailable()) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert("Error: Could not save your changes because the browser's local storage is full.");
      } else {
        alert(`An unexpected error occurred while trying to save your data for "${key}".`);
      }
    }
};


const App: React.FC = () => {
  // --- STATE INITIALIZATION ---
  // Initialize state DIRECTLY from localStorage to prevent race conditions.
  const [users, setUsers] = useState<User[]>(() => loadFromLocalStorage('users', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromLocalStorage('expenses', []));
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(() => loadFromLocalStorage('companyInfo', null));
  const [logo, setLogo] = useState<string | null>(() => loadFromLocalStorage('logo', null));
  const [costCenters, setCostCenters] = useState<MasterData[]>(() => loadFromLocalStorage('costCenters', []));
  const [projectCodes, setProjectCodes] = useState<MasterData[]>(() => loadFromLocalStorage('projectCodes', []));
  const [expensesCategories, setExpensesCategories] = useState<MasterData[]>(() => loadFromLocalStorage('expensesCategories', []));
  const [parties, setParties] = useState<MasterData[]>(() => loadFromLocalStorage('parties', []));

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // --- PERSISTENCE EFFECTS ---
  // Use useEffect to save to localStorage whenever state changes.
  useEffect(() => { saveToLocalStorage('users', users) }, [users]);
  useEffect(() => { saveToLocalStorage('expenses', expenses) }, [expenses]);
  useEffect(() => { saveToLocalStorage('costCenters', costCenters) }, [costCenters]);
  useEffect(() => { saveToLocalStorage('projectCodes', projectCodes) }, [projectCodes]);
  useEffect(() => { saveToLocalStorage('expensesCategories', expensesCategories) }, [expensesCategories]);
  useEffect(() => { saveToLocalStorage('parties', parties) }, [parties]);
  useEffect(() => { saveToLocalStorage('companyInfo', companyInfo) }, [companyInfo]);
  useEffect(() => { saveToLocalStorage('logo', logo) }, [logo]);

  // --- Auth and User Management ---
  const handleAdminSetup = useCallback((adminData: Omit<User, 'id' | 'role' | 'forcePasswordChange'>, companyData: CompanyInfo): { success: boolean, message?: string } => {
    // CRITICAL SECURITY FIX: Prevent setup if users already exist.
    if (users.length > 0) {
        console.error("Setup attempted when users already exist.");
        return { success: false, message: "Setup has already been completed. Please log in." };
    }
    
    const newAdmin: User = {
        ...adminData,
        id: `admin-${Date.now()}`,
        role: 'admin',
        forcePasswordChange: false,
    };
    setUsers([newAdmin]);
    setCompanyInfo(companyData);
    setLoggedInUser(newAdmin);
    return { success: true };
  }, [users]); // Depend on users to get the latest state
  
  const handleLogin = useCallback((email: string, pass: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      setLoggedInUser(user);
      return true;
    }
    return false;
  }, [users]);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
  }, []);

  const handleChangePassword = useCallback((newPassword: string) => {
    if (loggedInUser) {
      const updatedUser = { ...loggedInUser, password: newPassword, forcePasswordChange: false };
      setLoggedInUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === loggedInUser.id ? updatedUser : u));
    }
  }, [loggedInUser]);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}`};
    setUsers(prev => [...prev, newUser]);
    return newUser; // Return the full user object with ID
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (loggedInUser?.id === updatedUser.id) {
        setLoggedInUser(updatedUser);
    }
  }, [loggedInUser?.id]);

  const deleteUser = useCallback((userId: string) => {
    if (expenses.some(exp => exp.paidBy === userId)) {
        alert("Cannot delete this user as they are associated with existing expense entries. Please reassign their entries before deleting.");
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [expenses]);


  // --- Master Data Handlers ---
  const addCostCenter = useCallback((name: string) => setCostCenters(prev => [...prev, { id: `cc-${Date.now()}`, name }]), []);
  const updateCostCenter = useCallback((item: MasterData) => setCostCenters(prev => prev.map(ph => ph.id === item.id ? item : ph)), []);
  const deleteCostCenter = useCallback((id: string) => {
    const itemToDelete = costCenters.find(item => item.id === id);
    if (itemToDelete && expenses.some(exp => exp.costCenter === itemToDelete.name)) {
      alert(`Cannot delete "${itemToDelete.name}" as it is currently in use.`);
      return;
    }
    setCostCenters(prev => prev.filter(ph => ph.id !== id));
  }, [expenses, costCenters]);

  const addProjectCode = useCallback((name: string) => setProjectCodes(prev => [...prev, { id: `pc-${Date.now()}`, name }]), []);
  const updateProjectCode = useCallback((item: MasterData) => setProjectCodes(prev => prev.map(ph => ph.id === item.id ? item : ph)), []);
  const deleteProjectCode = useCallback((id: string) => {
    const itemToDelete = projectCodes.find(item => item.id === id);
    if (itemToDelete && expenses.some(exp => exp.projectCode === itemToDelete.name)) {
      alert(`Cannot delete "${itemToDelete.name}" as it is currently in use.`);
      return;
    }
    setProjectCodes(prev => prev.filter(ph => ph.id !== id));
  }, [expenses, projectCodes]);

  const addExpensesCategory = useCallback((name: string) => setExpensesCategories(prev => [...prev, { id: `ec-${Date.now()}`, name }]), []);
  const updateExpensesCategory = useCallback((item: MasterData) => setExpensesCategories(prev => prev.map(eh => eh.id === item.id ? item : eh)), []);
  const deleteExpensesCategory = useCallback((id: string) => {
    const itemToDelete = expensesCategories.find(item => item.id === id);
    if (itemToDelete && expenses.some(exp => exp.expensesCategory === itemToDelete.name)) {
      alert(`Cannot delete "${itemToDelete.name}" as it is currently in use.`);
      return;
    }
    setExpensesCategories(prev => prev.filter(eh => eh.id !== id));
  }, [expenses, expensesCategories]);
  
  const addParty = useCallback((name: string) => setParties(prev => [...prev, { id: `p-${Date.now()}`, name }]), []);
  const updateParty = useCallback((item: MasterData) => setParties(prev => prev.map(p => p.id === item.id ? item : p)), []);
  const deleteParty = useCallback((id: string) => {
    const itemToDelete = parties.find(item => item.id === id);
    if (itemToDelete && expenses.some(exp => exp.party === itemToDelete.name)) {
        alert(`Cannot delete "${itemToDelete.name}" as it is currently in use.`);
        return;
    }
    setParties(prev => prev.filter(p => p.id !== id));
  }, [expenses, parties]);
  
  // --- Expense Handlers ---
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense = { ...expense, id: `exp-${Date.now()}`, timestamp: new Date().toISOString(), createdBy: loggedInUser?.id };
    setExpenses(prev => [newExpense, ...prev]);
  }, [loggedInUser]);
  const updateExpense = useCallback((updatedExpense: Expense) => setExpenses(prev => prev.map(exp => (exp.id === updatedExpense.id ? updatedExpense : exp))), []);
  const deleteExpense = useCallback((id: string) => setExpenses(prev => prev.filter(exp => exp.id !== id)), []);

  const displayedExpenses = useMemo(() => {
    if (!loggedInUser) return [];
    if (loggedInUser.role === 'admin') return expenses;
    return expenses.filter(exp => exp.paidBy === loggedInUser.id || exp.createdBy === loggedInUser.id);
  }, [loggedInUser, expenses]);

  const handleLogoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }, []);
  
  const masterDataProps = useMemo(() => ({
    costCenters, expensesCategories, parties, projectCodes,
    addCostCenter, updateCostCenter, deleteCostCenter,
    addProjectCode, updateProjectCode, deleteProjectCode,
    addExpensesCategory, updateExpensesCategory, deleteExpensesCategory,
    addParty, updateParty, deleteParty,
  }), [
    costCenters, expensesCategories, parties, projectCodes,
    addCostCenter, updateCostCenter, deleteCostCenter,
    addProjectCode, updateProjectCode, deleteProjectCode,
    addExpensesCategory, updateExpensesCategory, deleteExpensesCategory,
    addParty, updateParty, deleteParty
  ]);

  const userManagementProps = useMemo(() => ({
    users, addUser, updateUser, deleteUser
  }), [users, addUser, updateUser, deleteUser]);

  // The decision to show setup or login is now based on the fully loaded user state
  const isInitialSetup = users.length === 0;

  if (!loggedInUser) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSetup={handleAdminSetup}
        isInitialSetup={isInitialSetup}
        companyInfo={companyInfo}
      />
    );
  }
  
  if (loggedInUser.forcePasswordChange) {
    return <ChangePasswordModal onChangePassword={handleChangePassword} user={loggedInUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header
        currentUser={loggedInUser}
        onLogout={handleLogout}
        logo={logo}
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