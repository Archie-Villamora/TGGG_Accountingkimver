import React, { useState } from 'react';
import OvertimeForm from './OvertimeForm.jsx';
import OvertimeStatus from './OvertimeStatus.jsx';

const OvertimePage = ({ user, token, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('ot-form');

  return (
    <div className="w-full relative animate-fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      


            {activeTab === 'ot-form' ? (
              <OvertimeForm
                token={token}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <OvertimeStatus
                token={token}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}

    </div>
  );
};

export default OvertimePage;
