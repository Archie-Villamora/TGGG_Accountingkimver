import React, { useState } from 'react';
import OvertimeForm from '../Public_Dashboard/OvertimeForm.jsx';
import OvertimeStatus from '../Public_Dashboard/OvertimeStatus.jsx';

const StudioHeadOvertimePage = ({ user, token, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('ot-form');

  return (
    <div className="w-full relative animate-fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      


            {activeTab === 'ot-form' && (
              <OvertimeForm
                token={token}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'ot-status' && (
              <OvertimeStatus
                token={token}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}

    </div>
  );
};

export default StudioHeadOvertimePage;
