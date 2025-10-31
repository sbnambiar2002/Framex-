import React, { useState, useCallback } from 'react';
import { Expense, User, MasterData } from '../types';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import AdminSettings from './AdminSettings';
import UserManagement from './UserManagement';
import ChartSection from './ChartSection';
import PartiesManagement from './PartiesManagement';
import { PlusIcon } from './icons/PlusIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface MasterDataProps {
  costCenters: MasterData[];
  addCostCenter: (name: string) => void;
  updateCostCenter: (item: MasterData) => void;
  deleteCostCenter: (id: string) => void;
  
  projectCodes: MasterData[];
  addProjectCode: (name: string) => void;
  updateProjectCode: (item: MasterData) => void;
  deleteProjectCode: (id: string) => void;

  expensesCategories: MasterData[];
  addExpensesCategory: (name: string) => void;
  updateExpensesCategory: (item: MasterData) => void;
  deleteExpensesCategory: (id: string) => void;

  parties: MasterData[];
  addParty: (name: string) => void;
  updateParty: (item: MasterData) => void;
  deleteParty: (id: string) => void;
}

interface UserManagementProps {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

interface DashboardProps {
  currentUser: User;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  allUsers: User[];
  masterDataProps: MasterDataProps;
  userManagementProps: UserManagementProps;
}

const TABS = [
    { name: 'entries', label: 'Entries', forAll: true },
    { name: 'parties', label: 'Manage Parties', forAll: true },
    { name: 'analytics', label: 'Analytics', forAll: false },
    { name: 'users', label: 'Users', forAll: false },
    { name: 'settings', label: 'App Settings', forAll: false },
];

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { currentUser, expenses, addExpense, updateExpense, deleteExpense, allUsers, masterDataProps, userManagementProps } = props;
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setEditingExpense(null);
    setIsFormVisible(false);
  };
  
  const handleAddNew = () => {
    setEditingExpense(null);
    setIsFormVisible(true);
  }

  const handleExportCSV = useCallback(() => {
    const usersMap = new Map(userManagementProps.users.map(user => [user.id, user.name]));
    
    // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string | number'. Changed parameter to unknown and handled safely.
    const escapeCSV = (str: unknown) => {
        const stringVal = String(str ?? '');
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
    };

    const headers = [
        'Date',
        ...(currentUser.role === 'admin' ? ['User'] : []),
        'Type',
        'Paid To / Received From',
        'Payment',
        'Receipt',
        'Cost Center',
        'Project Code',
        'Expenses Category',
        'Nature'
    ];

    const csvRows = [headers.join(',')];

    expenses.forEach(expense => {
        const row = [
            escapeCSV(new Date(expense.timestamp).toLocaleDateString()),
            ...(currentUser.role === 'admin' ? [escapeCSV(usersMap.get(expense.paidBy) || 'Unknown User')] : []),
            escapeCSV(expense.transactionType),
            escapeCSV(expense.party),
            escapeCSV(expense.transactionType === 'payment' ? expense.amount.toFixed(2) : ''),
            escapeCSV(expense.transactionType === 'receipt' ? expense.amount.toFixed(2) : ''),
            escapeCSV(expense.costCenter),
            escapeCSV(expense.projectCode),
            escapeCSV(expense.expensesCategory),
            escapeCSV(expense.expenseNature),
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `expense_export_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }, [expenses, currentUser.role, userManagementProps.users]);

  const netBalance = expenses.reduce((sum, exp) => {
    if (exp.transactionType === 'payment') {
      return sum - Number(exp.amount);
    }
    return sum + Number(exp.amount);
  }, 0);

  const renderTabButton = (tabName: string, label: string) => (
    <button
      key={tabName}
      onClick={() => setActiveTab(tabName)}
      className={`${activeTab === tabName ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
      aria-current={activeTab === tabName ? 'page' : undefined}
    >
      {label}
    </button>
  );
  
  const renderContent = () => {
    switch(activeTab) {
      case 'entries':
        return (
          <>
            <div className="flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-2 sm:space-y-0 mb-6">
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                    disabled={expenses.length === 0}
                    aria-label="Export all entries to a CSV file"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Export to CSV
                </button>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    aria-label="Add a new expense entry"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add New Entry
                </button>
            </div>
            
            <ExpenseList
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={deleteExpense}
              currentUser={currentUser}
              allUsers={userManagementProps.users}
            />
          </>
        );
      case 'parties':
        return (
          <PartiesManagement
            parties={masterDataProps.parties}
            addParty={masterDataProps.addParty}
            updateParty={masterDataProps.updateParty}
            deleteParty={masterDataProps.deleteParty}
          />
        );
      case 'analytics':
        return currentUser.role === 'admin' ? <ChartSection expenses={expenses} /> : null;
      case 'users':
        return currentUser.role === 'admin' ? <UserManagement {...userManagementProps} /> : null;
      case 'settings':
        return currentUser.role === 'admin' ? 
          <AdminSettings 
            costCenters={masterDataProps.costCenters}
            addCostCenter={masterDataProps.addCostCenter}
            updateCostCenter={masterDataProps.updateCostCenter}
            deleteCostCenter={masterDataProps.deleteCostCenter}
            projectCodes={masterDataProps.projectCodes}
            addProjectCode={masterDataProps.addProjectCode}
            updateProjectCode={masterDataProps.updateProjectCode}
            deleteProjectCode={masterDataProps.deleteProjectCode}
            expensesCategories={masterDataProps.expensesCategories}
            addExpensesCategory={masterDataProps.addExpensesCategory}
            updateExpensesCategory={masterDataProps.updateExpensesCategory}
            deleteExpensesCategory={masterDataProps.deleteExpensesCategory}
          /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {currentUser.name}</h2>
            <p className="text-gray-500 mt-1">
                {currentUser.role === 'admin' ? `Viewing all ${expenses.length} entries.` : `You have ${expenses.length} expense entries.`}
            </p>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
            <p className="text-gray-500 text-sm">Net Balance</p>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-secondary' : 'text-red-600'}`}>
                {netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
      </div>
      
      {isFormVisible && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-xl shadow-lg"
          >
              <ExpenseForm
                currentUser={currentUser}
                addExpense={addExpense}
                updateExpense={updateExpense}
                editingExpense={editingExpense}
                onClose={handleFormClose}
                allUsers={allUsers}
                costCenters={masterDataProps.costCenters}
                projectCodes={masterDataProps.projectCodes}
                expensesCategories={masterDataProps.expensesCategories}
                parties={masterDataProps.parties}
                addParty={masterDataProps.addParty}
              />
          </div>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {TABS.map(tab => 
              (tab.forAll || currentUser.role === 'admin') && renderTabButton(tab.name, tab.label)
            )}
        </nav>
      </div>

      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;