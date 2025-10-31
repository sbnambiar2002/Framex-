
import { createClient } from '@supabase/supabase-js';
import { Expense, User, MasterData, CompanyInfo } from './types';

// --- Supabase Client Initialization ---

// The Supabase URL and public API key are set here for local development.
// This key was provided in your README file.
// Your live Netlify site will securely use the environment variables
// you've already configured in the Netlify dashboard.
const supabaseUrl = 'https://zvdnpslzfbpncbjksvek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZG5wc2x6ZmJwbmNiamtzdmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDU2MTksImV4cCI6MjA3NzQ4MTYxOX0.GuW39JPfnhjOZcNh_SAEQWmXrQH8cPKuyPfwBOZnv7I';

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase URL and Key are not configured. Please provide them as environment variables (SUPABASE_URL, SUPABASE_ANON_KEY). This is a required step for deployment.";
    
    // Display a user-friendly error in the UI
    document.body.innerHTML = `<div style="font-size: 1.2rem; padding: 2rem; font-family: sans-serif; background-color: #fef2f2; color: #b91c1c; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center;">${errorMessage}</div>`;
    
    throw new Error(errorMessage);
}


const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth API ---

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
}

export const checkIsInitialSetup = async (): Promise<boolean> => {
    // This check is more reliable than counting users, as the `users` table may have
    // Row Level Security enabled, preventing an anonymous check. The company_info
    // table is created during setup and is a better indicator of completion.
    const { data, error } = await supabase.from('company_info').select('id').eq('id', 1).maybeSingle();
    
    if (error) {
        console.error("Error checking for initial setup:", error);
        return true; // Fail safe, assume setup is needed if DB check fails.
    }
    
    // If data is null, it means no company info row was found, so setup is needed.
    return data === null;
}

export const adminSetup = async (adminData: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & { password: string }, companyData: Omit<CompanyInfo, 'id' | 'logo_url'>) => {
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
            data: {
                name: adminData.name,
            }
        }
    });

    if (authError || !authData.user) {
        return { success: false, message: authError?.message || "Could not create admin user." };
    }

    // 2. Insert the user profile into our public `users` table
    const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
    });

    if (profileError) {
        return { success: false, message: `User created, but profile failed: ${profileError.message}` };
    }

    // 3. Insert the company info
    const { error: companyError } = await supabase.from('company_info').insert({ ...companyData, id: 1 });

    if (companyError) {
        return { success: false, message: `User & Profile created, but company info failed: ${companyError.message}` };
    }

    return { success: true, message: "Setup successful! Please check your email to confirm your account." };
};

export const signUp = async (userData: Omit<User, 'id' | 'role' | 'forcePasswordChange'> & {password: string}) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                name: userData.name,
            }
        }
    });

    if (authError || !authData.user) {
        return { success: false, message: authError?.message || "Could not create user." };
    }

    const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        role: 'user',
    });

    if (profileError) {
        return { success: false, message: profileError.message };
    }

    return { success: true, message: "Signup successful! Please check your email to confirm your account." };
};

export const login = async (email: string, pass: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error || !data.user) {
        return null;
    }
    return getUserProfile(data.user.id);
};

export const logout = async () => {
    await supabase.auth.signOut();
};

export const getUserProfile = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data;
};

export const updateUserPassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Error updating password:', error);
      return null;
    }
    return data.user;
};

export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    return !error;
}

export const addUser = async (userData: Omit<User, 'id' | 'forcePasswordChange'> & { password?: string }) => {
     const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
         options: {
            data: {
                name: userData.name,
            }
        }
    });

    if (error || !data.user) {
        return { success: false, message: error?.message || "Could not invite user." };
    }

    const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
    });
     if (profileError) {
        return { success: false, message: profileError.message };
    }
    return { success: true, message: "User invited successfully. They must confirm their email." };
};

export const updateUserProfile = async (user: User): Promise<User | null> => {
    const { data, error } = await supabase.from('users').update({ name: user.name, role: user.role, email: user.email }).eq('id', user.id).select().single();
    if (error) return null;
    return data;
}

// --- Data Fetching API ---

export const getCompanyInfo = async(): Promise<CompanyInfo | null> => {
    const { data, error } = await supabase.from('company_info').select('*').eq('id', 1).single();
    if (error) return null;
    return data;
}

export const getInitialData = async () => {
    const [ users, expenses, companyInfo, costCenters, projectCodes, expensesCategories, parties ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        getCompanyInfo(),
        supabase.from('master_data').select('*').eq('type', 'costCenter'),
        supabase.from('master_data').select('*').eq('type', 'projectCode'),
        supabase.from('master_data').select('*').eq('type', 'expensesCategory'),
        supabase.from('master_data').select('*').eq('type', 'party'),
    ]);
    
    return {
        users: users.data || [],
        expenses: expenses.data || [],
        companyInfo: companyInfo,
        costCenters: costCenters.data || [],
        projectCodes: projectCodes.data || [],
        expensesCategories: expensesCategories.data || [],
        parties: parties.data || [],
    };
};

// --- Expense API ---

export const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>, createdById: string): Promise<Expense | null> => {
    const expenseToInsert = { ...expenseData, created_by: createdById };
    const { data, error } = await supabase.from('expenses').insert(expenseToInsert).select().single();
    if (error) {
        console.error("Error adding expense:", error);
        return null;
    }
    return data;
};

export const updateExpense = async (updatedExpense: Expense): Promise<Expense | null> => {
    const { data, error } = await supabase.from('expenses').update(updatedExpense).eq('id', updatedExpense.id).select().single();
     if (error) {
        console.error("Error updating expense:", error);
        return null;
    }
    return data;
};

export const deleteExpense = async (expenseId: string): Promise<boolean> => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) console.error("Error deleting expense:", error);
    return !error;
};


// --- Master Data API ---
type MasterDataType = 'costCenter' | 'projectCode' | 'expensesCategory' | 'party';

export const addMasterDataItem = async (type: MasterDataType, name: string): Promise<MasterData | null> => {
    const { data, error } = await supabase.from('master_data').insert({ name, type }).select().single();
    if (error) return null;
    return data;
};

export const updateMasterDataItem = async (item: MasterData): Promise<MasterData | null> => {
    const { data, error } = await supabase.from('master_data').update({ name: item.name }).eq('id', item.id).select().single();
    if (error) return null;
    return { ...data, type: item.type }; // type doesn't come back from DB, so we add it back
};

export const deleteMasterDataItem = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('master_data').delete().eq('id', id);
    return !error;
};

// --- Logo API ---
export const setLogo = async (file: File): Promise<CompanyInfo | null> => {
    const fileName = `public/logo_${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if a file with the same name exists
    });
    if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
    
    const { data, error: updateError } = await supabase
        .from('company_info')
        .update({ logo_url: publicUrl })
        .eq('id', 1)
        .select()
        .single();
        
    if (updateError) {
        console.error("Error saving logo URL:", updateError);
        return null;
    }
    return data;
};
