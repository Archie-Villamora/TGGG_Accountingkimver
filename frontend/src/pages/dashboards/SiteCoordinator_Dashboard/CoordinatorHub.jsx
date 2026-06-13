import React from "react";
import MaterialRequest from "./MaterialRequest";

const CoordinatorHub = ({ user, onNavigate }) => {
  return (
    <div className="w-full relative animate-fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      


            <MaterialRequest user={user} onNavigate={onNavigate} />

    </div>
  );
};

export default CoordinatorHub;
