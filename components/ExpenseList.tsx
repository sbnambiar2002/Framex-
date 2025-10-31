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
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {

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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid To / Received From</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses Category</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.paid_by || 'Unknown User'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expense.transaction_type === 'payment' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {expense.transaction_type}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.party}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                          {expense.transaction_type === 'payment' ? expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                          {expense.transaction_type === 'receipt' ? expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={`${expense.cost_center} / ${expense.project_code}`}>{expense.expenses_category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                              <button onClick={() => onEdit(expense)} className="text-primary hover:text-indigo-900" aria-label={`Edit expense for ${expense.party}`}>
                                  <EditIcon className="w-5 h-5"/>
                              </button>
                              <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete expense for ${expense.party}`}>
                                  <DeleteIcon className="w-5 h-5"/>
                              </button>
                          </div>
                      </td>
                  </tr>
                  ))}
              </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {expenses.map(expense => (
            <div key={expense.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-bold text-gray-900">{expense.party}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.created_at).toLocaleDateString()} &bull; {expense.paid_by || 'Unknown'}
                      </p>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                      <button onClick={() => onEdit(expense)} className="text-primary hover:text-indigo-900" aria-label={`Edit expense for ${expense.party}`}><EditIcon className="w-5 h-5"/></button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete expense for ${expense.party}`}><DeleteIcon className="w-5 h-5"/></button>
                  </div>
              </div>

              <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">{expense.expenses_category}</p>
                    <p className="text-xs text-gray-500 truncate" title={expense.expense_nature}>{expense.expense_nature}</p>
                  </div>
                  {expense.transaction_type === 'payment' ? (
                     <p className="text-lg font-bold text-red-600">
                       -{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                  ) : (
                     <p className="text-lg font-bold text-green-600">
                       +{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                  )}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default ExpenseList;