import React from 'react';
import { MasterData } from '../types';
import MasterDataSection from './MasterDataSection';

interface PartiesManagementProps {
  parties: MasterData[];
  addParty: (name: string) => void;
  updateParty: (item: MasterData) => void;
  deleteParty: (id: string) => void;
}

const PartiesManagement: React.FC<PartiesManagementProps> = (props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MasterDataSection 
            title="Parties (Paid To / Received From)"
            data={props.parties}
            onAdd={props.addParty}
            onUpdate={props.updateParty}
            onDelete={props.deleteParty}
        />
    </div>
  );
};

export default PartiesManagement;
