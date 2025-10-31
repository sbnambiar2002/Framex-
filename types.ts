
export interface Expense {
  id: string;
  transactionType: 'payment' | 'receipt';
  party: string;
  amount: number;
  expenseNature: string;
  costCenter: string;
  projectCode: string;
  expensesCategory: string;
  paidBy: string; // Corresponds to User ID
  createdBy?: string; // Corresponds to User ID of creator
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  role: 'user' | 'admin';
  email: string; // Changed to be non-optional
  mobile?: string;
  password: string;
  forcePasswordChange?: boolean;
  recoveryCode?: string;
}

export interface MasterData {
  id: string;
  name: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  taxInfo: {
    country: string;
    taxIdType: string;
    taxIdNumber: string;
  };
}
