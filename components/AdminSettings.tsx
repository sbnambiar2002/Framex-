import React from 'react';
import { MasterData } from '../types';
import MasterDataSection from './MasterDataSection';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

interface AdminSettingsProps {
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
}

const AdminSettings: React.FC<AdminSettingsProps> = (props) => {
  const DATA_KEYS = [
    'users', 'expenses', 'companyInfo', 'logo', 
    'costCenters', 'projectCodes', 'expensesCategories', 'parties'
  ];

  const handleExport = () => {
    try {
      const allData: { [key: string]: any } = {};
      DATA_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          allData[key] = JSON.parse(data);
        }
      });

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `expense-tracker-data-${date}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("An error occurred while exporting your data. Please check the console for details.");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to import data? This will overwrite all existing data in this browser. This action cannot be undone.")) {
      event.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file.");
        }
        const importedData = JSON.parse(text);

        // Basic validation
        if (!importedData.users || !importedData.expenses) {
          throw new Error("Invalid data file. Missing required keys like 'users' or 'expenses'.");
        }
        
        DATA_KEYS.forEach(key => localStorage.removeItem(key));

        Object.keys(importedData).forEach(key => {
          if (DATA_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(importedData[key]));
          }
        });

        alert("Data imported successfully! The application will now reload.");
        window.location.reload();

      } catch (error) {
        console.error("Error importing data:", error);
        alert(`An error occurred during import: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        event.target.value = ''; // Reset file input in all cases
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-lg">
         <h3 className="text-xl font-bold text-gray-800 mb-4">Data Management</h3>
         <p className="text-sm text-gray-600 mb-4">
           Export all application data to a file for backup or to import into another browser/device. Importing will overwrite all current data.
         </p>
         <div className="flex flex-col sm:flex-row gap-4">
           <button
             onClick={handleExport}
             className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
             aria-label="Export all application data to a file"
           >
             <DownloadIcon className="w-5 h-5 mr-2" />
             Export All Data
           </button>
           <label className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
             aria-label="Import data from a file, overwriting current data"
           >
             <UploadIcon className="w-5 h-5 mr-2" />
             Import from File
             <input
               type="file"
               className="hidden"
               accept=".json,application/json"
               onChange={handleImport}
             />
           </label>
         </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MasterDataSection 
                title="Cost Centers"
                data={props.costCenters}
                onAdd={props.addCostCenter}
                onUpdate={props.updateCostCenter}
                onDelete={props.deleteCostCenter}
            />
            <MasterDataSection 
                title="Project Codes"
                data={props.projectCodes}
                onAdd={props.addProjectCode}
                onUpdate={props.updateProjectCode}
                onDelete={props.deleteProjectCode}
            />
            <MasterDataSection 
                title="Expenses Categories"
                data={props.expensesCategories}
                onAdd={props.addExpensesCategory}
                onUpdate={props.updateExpensesCategory}
                onDelete={props.deleteExpensesCategory}
            />
       </div>
    </div>
  )
};

export default AdminSettings;