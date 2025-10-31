
import React, { useState } from 'react';
import { User } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SaveIcon } from './icons/SaveIcon';
import { CancelIcon } from './icons/CancelIcon';

interface UserManagementProps {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

// A simple random password generator
const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
}

const UserManagement: React.FC<UserManagementProps> = ({ users, addUser, updateUser, deleteUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' as 'user' | 'admin' });
  const [tempPassword, setTempPassword] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
        alert("Name and Email are required.");
        return;
    }
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        alert("A user with this email already exists.");
        return;
    }
    const password = generateTempPassword();
    addUser({
        ...newUser,
        password: password,
        forcePasswordChange: true,
    });
    setTempPassword(password); // Show the password to the admin
    setNewUser({ name: '', email: '', role: 'user' }); // Reset form
    // Keep isAdding true to show the password, user can close it manually
  };

  const handleUpdateUser = () => {
    if (editingUser) {
        if (users.some(u => u.email.toLowerCase() === editingUser.email.toLowerCase() && u.id !== editingUser.id)) {
            alert("A user with this email already exists.");
            return;
        }
        updateUser(editingUser);
        setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: string) => {
      if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
          deleteUser(id);
      }
  };
  
  const closeAddForm = () => {
    setIsAdding(false);
    setTempPassword('');
    setNewUser({ name: '', email: '', role: 'user' });
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">User Management</h3>
        {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700">
                <PlusIcon className="w-5 h-5 mr-2" /> Add User
            </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="form-input" required />
              <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="form-input" required />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as 'user' | 'admin'})} className="form-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={closeAddForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-transparent rounded-md hover:bg-green-600">Create User</button>
            </div>
          </form>
          {tempPassword && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-800">
                <strong>User created successfully!</strong> Please provide the following temporary password to the user: <strong className="font-mono bg-yellow-200 px-1 rounded">{tempPassword}</strong>
                <p className="mt-1 text-xs">They will be required to change this password on their first login. This password will not be shown again.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
               editingUser?.id === user.id ? (
                <tr key={user.id}>
                  <td className="px-6 py-4"><input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="form-input" /></td>
                  <td className="px-6 py-4"><input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="form-input" /></td>
                  <td className="px-6 py-4">
                    <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})} className="form-select">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={handleUpdateUser} className="text-secondary hover:text-green-700" aria-label="Save changes"><SaveIcon className="w-5 h-5"/></button>
                      <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel editing"><CancelIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
               ) : (
                <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => setEditingUser(user)} className="text-primary hover:text-indigo-900" aria-label={`Edit user ${user.name}`}><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete user ${user.name}`}><DeleteIcon className="w-5 h-5"/></button>
                        </div>
                    </td>
                </tr>
               )
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {users.map(user => (
          editingUser?.id === user.id ? (
            <div key={user.id} className="p-4 space-y-4">
               <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="form-input w-full" placeholder="Name" />
               <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="form-input w-full" placeholder="Email"/>
               <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})} className="form-select w-full">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex items-center justify-end space-x-3">
                  <button onClick={handleUpdateUser} className="text-secondary hover:text-green-700" aria-label="Save changes"><SaveIcon className="w-5 h-5"/></button>
                  <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel editing"><CancelIcon className="w-5 h-5"/></button>
                </div>
            </div>
          ) : (
            <div key={user.id} className="p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs capitalize mt-1">
                        <span className={`px-2 inline-flex leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                    </p>
                </div>
                 <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                    <button onClick={() => setEditingUser(user)} className="text-primary hover:text-indigo-900" aria-label={`Edit user ${user.name}`}><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete user ${user.name}`}><DeleteIcon className="w-5 h-5"/></button>
                </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
