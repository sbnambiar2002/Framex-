import React, { useState, useEffect, useMemo } from 'react';
import { Expense, User, MasterData } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { CancelIcon } from './icons/CancelIcon';

interface ExpenseFormProps {
  currentUser: User;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateExpense: (expense: Expense) => void;
  editingExpense: Expense | null;
  onClose: () => void;
  allUsers: User[];
  costCenters: MasterData[];
  projectCodes: MasterData[];
  expensesCategories: MasterData[];
  parties: MasterData[];
  addParty: (name: string) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ currentUser, addExpense, updateExpense, editingExpense, onClose, allUsers, costCenters, projectCodes, expensesCategories, parties, addParty }) => {
  const usersMap = useMemo(() => new Map(allUsers.map(user => [user.id, user.name])), [allUsers]);

  const getInitialFormData = () => ({
    transactionType: 'payment' as 'payment' | 'receipt',
    party: '',
    amount: '',
    paidByName: currentUser.name, // Use name for the editable input
    expenseNature: '',
    costCenter: '',
    projectCode: '',
    expensesCategory: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        transactionType: editingExpense.transactionType,
        party: editingExpense.party,
        amount: String(editingExpense.amount),
        paidByName: usersMap.get(editingExpense.paidBy) || '',
        expenseNature: editingExpense.expenseNature,
        costCenter: editingExpense.costCenter,
        projectCode: editingExpense.projectCode,
        expensesCategory: editingExpense.expensesCategory,
      });
    } else {
       setFormData(getInitialFormData());
    }
  }, [editingExpense, currentUser, usersMap]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.party || !formData.amount || !formData.expenseNature || !formData.costCenter || !formData.projectCode || !formData.expensesCategory || !formData.paidByName) {
        alert("Please fill all fields.");
        return;
    }

    // Validate the entered user name
    const paidByUser = allUsers.find(u => u.name.toLowerCase() === formData.paidByName.trim().toLowerCase());
    if (!paidByUser) {
        alert("Paid By user not found. Please select a valid user from the list or enter their exact name.");
        return;
    }

    const partyName = formData.party.trim();
    const partyExists = parties.some(p => p.name.toLowerCase() === partyName.toLowerCase());
    if (partyName && !partyExists) {
      addParty(partyName);
    }
    
    // Exclude paidByName from the final data object
    const { paidByName, ...restOfFormData } = formData;

    const expenseData = {
      ...restOfFormData,
      paidBy: paidByUser.id, // Submit the found user's ID
      party: partyName,
      amount: parseFloat(formData.amount),
    };

    if (editingExpense) {
      updateExpense({ ...expenseData, id: editingExpense.id, timestamp: editingExpense.timestamp });
    } else {
      addExpense(expenseData);
    }
    onClose();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{editingExpense ? 'Edit Entry' : 'Add New Entry'}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-primary focus:ring-primary" name="transactionType" value="payment" checked={formData.transactionType === 'payment'} onChange={handleChange} />
                    <span className="ml-2">Payment</span>
                </label>
                <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-secondary focus:ring-secondary" name="transactionType" value="receipt" checked={formData.transactionType === 'receipt'} onChange={handleChange} />
                    <span className="ml-2">Receipt</span>
                </label>
            </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="party" className="block text-sm font-medium text-gray-700">{formData.transactionType === 'payment' ? 'Paid To' : 'Received From'}</label>
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
          <label htmlFor="costCenter" className="block text-sm font-medium text-gray-700">Cost Center</label>
          <select name="costCenter" id="costCenter" value={formData.costCenter} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Cost Center</option>
            {costCenters.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="projectCode" className="block text-sm font-medium text-gray-700">Project Code</label>
          <select name="projectCode" id="projectCode" value={formData.projectCode} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Project Code</option>
            {projectCodes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="expensesCategory" className="block text-sm font-medium text-gray-700">Expenses Category</label>
          <select name="expensesCategory" id="expensesCategory" value={formData.expensesCategory} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required>
            <option value="" disabled>Select Expenses Category</option>
            {expensesCategories.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-6">
         <label htmlFor="paidByName" className="block text-sm font-medium text-gray-700">Paid By / Entry User</label>
         <input
            type="text"
            name="paidByName"
            id="paidByName"
            list="users-datalist"
            value={formData.paidByName}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
            placeholder="Enter a user's name"
          />
          <datalist id="users-datalist">
            {allUsers.map(user => <option key={user.id} value={user.name} />)}
          </datalist>
        </div>
        
        <div className="md:col-span-6">
          <label htmlFor="expenseNature" className="block text-sm font-medium text-gray-700">Nature of Expense / Receipt</label>
          <textarea name="expenseNature" id="expenseNature" value={formData.expenseNature} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" required />
        </div>
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