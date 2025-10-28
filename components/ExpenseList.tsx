
import React from 'react';
import { Expense, User } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { EmptyStateIcon } from './icons/EmptyStateIcon';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  allUsers: User[]; // This now includes all users (admins and regular users)
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete, currentUser, allUsers }) => {
  const usersMap = new Map(allUsers.map(user => [user.id, user.name]));

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this entry?')) {
          onDelete(id);
      }
  }

  if (expenses.length === 0) {
    return (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <EmptyStateIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Entries Found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new entry.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid To / Received From</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Center</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Code</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nature</th>
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usersMap.get(expense.paidBy) || 'Unknown User'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expense.transactionType === 'payment' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {expense.transactionType}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.party}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                        {expense.transactionType === 'payment' ? expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                        {expense.transactionType === 'receipt' ? expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.costCenter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.projectCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.expensesCategory}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={expense.expenseNature}>{expense.expenseNature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                            <button onClick={() => onEdit(expense)} className="text-primary hover:text-indigo-900" title="Edit">
                                <EditIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                <DeleteIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
      </div>
    </div>
  );
};

export default ExpenseList;