import React, { useState } from 'react';
import { MasterData } from '../types';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SaveIcon } from './icons/SaveIcon';
import { CancelIcon } from './icons/CancelIcon';

interface MasterDataSectionProps {
  title: string;
  data: MasterData[];
  onAdd: (name: string) => void;
  onUpdate: (item: MasterData) => void;
  onDelete: (id: string) => void;
}

const MasterDataSection: React.FC<MasterDataSectionProps> = ({ title, data, onAdd, onUpdate, onDelete }) => {
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<MasterData | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName('');
    }
  };

  const handleUpdate = () => {
    if (editingItem && editingItem.name.trim()) {
      onUpdate(editingItem);
      setEditingItem(null);
    }
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <form onSubmit={handleAdd} className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={`New ${title.split(' ')[0].toLowerCase()} name`}
          className="flex-grow block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          aria-label={`New ${title} name`}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label={`Add new ${title.slice(0,-1)}`}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
      <div className="flex-grow overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {data.map(item => (
            <li key={item.id} className="py-3 flex items-center justify-between">
              {editingItem?.id === item.id ? (
                <div className="flex-grow flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="flex-grow block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    aria-label={`Edit ${item.name}`}
                  />
                  <button onClick={handleUpdate} className="text-secondary hover:text-green-700" aria-label="Save changes"><SaveIcon className="w-5 h-5"/></button>
                  <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel editing"><CancelIcon className="w-5 h-5"/></button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-900 break-all mr-2">{item.name}</span>
                  <div className="flex-shrink-0 flex items-center space-x-3">
                    <button onClick={() => setEditingItem(item)} className="text-primary hover:text-indigo-900" aria-label={`Edit ${item.name}`}><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${item.name}`}><DeleteIcon className="w-5 h-5"/></button>
                  </div>
                </>
              )}
            </li>
          ))}
          {data.length === 0 && <li className="py-3 text-sm text-gray-500 text-center">No items yet.</li>}
        </ul>
      </div>
    </div>
  );
};

export default MasterDataSection;
