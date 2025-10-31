export interface Expense {
  id: string;
  transaction_type: 'payment' | 'receipt'; // Matches Supabase column name
  party: string;
  amount: number;
  expense_nature: string;
  cost_center: string;
  project_code: string;
  expenses_category: string;
  paid_by: string;
  created_by?: string; // Corresponds to User ID of creator
  created_at: string; // Matches Supabase column name
}

export interface User {
  id: string;
  name: string;
  role: 'user' | 'admin';
  email: string;
  // Password is now handled by Supabase Auth and not stored here
  forcePasswordChange?: boolean;
}

export interface MasterData {
  id: string;
  name: string;
  type: string;
}

export interface CompanyInfo {
  id?: number;
  name: string;
  address: string;
  country: string;
  tax_id_type: string;
  tax_id_number: string;
  logo_url?: string | null;
}