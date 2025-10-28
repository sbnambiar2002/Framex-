import React from 'react';
import { MasterData } from '../types';
import MasterDataSection from './MasterDataSection';

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
  return (
    <div className="space-y-6">
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