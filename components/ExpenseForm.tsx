
import React, { useState, useEffect } from 'react';
import { Expense, User, MasterData } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { CancelIcon } from './icons/CancelIcon';

interface ExpenseFormProps {
  currentUser: User;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  updateExpense: (expense: Expense) => void;
  editingExpense: Expense | null;
  onClose: () => void;
  costCenters: MasterData[];
  projectCodes: MasterData[];
  expensesCategories: MasterData[];
  parties: MasterData[];
  addParty: (name: string) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ currentUser, addExpense, updateExpense, editingExpense, onClose, costCenters, projectCodes, expensesCategories, parties, addParty }) => {

  const getInitialFormData = () => ({
    transaction_type: 'payment' as 'payment' | 'receipt',
    party: '',
    amount: '',
    paid_by: currentUser.name, // Defaults to the current user's name
    expense_nature: '',
    cost_center: '',
    project_code: '',
    expenses_category: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        transaction_type: editingExpense.transaction_type,
        party: editingExpense.party,
        amount: String(editingExpense.amount),
        paid_by: editingExpense.paid_by,
        expense_nature: editingExpense.expense_nature,
        cost_center: editingExpense.cost_center,
        project_code: editingExpense.project_code,
        expenses_category: editingExpense.expenses_category,
      });
    } else {
       setFormData(getInitialFormData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingExpense, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.party || !formData.amount || !formData.expense_nature || !formData.cost_center || !formData.project_code || !formData.expenses_category || !formData.paid_by) {
        setError("Please fill all required fields.");
        return;
    }

    const partyName = formData.party.trim();
    const partyExists = parties.some(p => p.name.toLowerCase() === partyName.toLowerCase());
    if (partyName && !partyExists) {
      addParty(partyName);
    }
    
    const expenseData = {
      transaction_type: formData.transaction_type,
      party: partyName,
      amount: parseFloat(formData.amount),
      paid_by: formData.paid_by.trim(),
      expense_nature: formData.expense_nature,
      cost_center: formData.cost_center,
      project_code: formData.project_code,
      expenses_category: formData.expenses_category,
    };

    if (editingExpense) {
      updateExpense({ ...expenseData, id: editingExpense.id, created_at: editingExpense.created_at, created_by: editingExpense.created_by });
    } else {
      addExpense(expenseData);
    }
    onClose();
  };

  return (
    <div className="p-6 sm:p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{editingExpense ? 'Edit Entry' : 'Add New Entry'}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-primary focus:ring-primary" name="transaction_type" value="payment" checked={formData.transaction_type === 'payment'} onChange={handleChange} />
                    <span className="ml-2">Payment</span>
                </label>
                <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-secondary focus:ring-secondary" name="transaction_type" value="receipt" checked={formData.transaction_type === 'receipt'} onChange={handleChange} />
                    <span className="ml-2">Receipt</span>
                </label>
            </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="party" className="block text-sm font-medium text-gray-700">{formData.transaction_type === 'payment' ? 'Paid To' : 'Received From'}</label>
          <input
            type="text"
            name="party"
            id="party"
            list="parties-datalist"
            value={formData.party}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
            placeholder="Enter a name"
          />
          <datalist id="parties-datalist">
            {parties.map(p => <option key={p.id} value={p.name} />)}
          </datalist>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} min="0.01" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="cost_center" className="block text-sm font-medium text-gray-700">Cost Center</label>
          <select name="cost_center" id="cost_center" value={formData.cost_center} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Cost Center</option>
            {costCenters.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="project_code" className="block text-sm font-medium text-gray-700">Project Code</label>
          <select name="project_code" id="project_code" value={formData.project_code} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Project Code</option>
            {projectCodes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="expenses_category" className="block text-sm font-medium text-gray-700">Expenses Category</label>
          <select name="expenses_category" id="expenses_category" value={formData.expenses_category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Expenses Category</option>
            {expensesCategories.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-6">
         <label htmlFor="paid_by" className="block text-sm font-medium text-gray-700">Paid By</label>
         <input
            type="text"
            name="paid_by"
            id="paid_by"
            value={formData.paid_by}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
            placeholder="Enter the name of the person who paid"
          />
        </div>
        
        <div className="md:col-span-6">
          <label htmlFor="expense_nature" className="block text-sm font-medium text-gray-700">Nature of Expense / Receipt</label>
          <textarea name="expense_nature" id="expense_nature" value={formData.expense_nature} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
        </div>
        
        {error && <p className="text-sm text-red-600 md:col-span-6 text-center">{error}</p>}
        
        <div className="md:col-span-6 flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <CancelIcon className="w-5 h-5 mr-2"/>
            Cancel
          </button>
          <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <SaveIcon className="w-5 h-5 mr-2"/>
            {editingExpense ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
