import React, { useState } from "react";
import PublicNavigation from "../Public_Dashboard/PublicNavigation";
import { Info, Users, Package, AlertCircle, CheckSquare, Upload, X } from "lucide-react";
import ProjectInfoTab from "./components/ProjectInfoTab";
import LaborWorkTab from "./components/LaborWorkTab";
import MaterialsEquipmentTab from "./components/MaterialsEquipmentTab";

const TABS = [
  { id: "project", label: "Project Info", icon: Info },
  { id: "labor", label: "Labor & Work", icon: Users },
  { id: "materials", label: "Materials & Equipment", icon: Package },
  { id: "delays", label: "Delays & Documentation", icon: AlertCircle },
  { id: "review", label: "Review & Submit", icon: CheckSquare },
];

const DelaysTab = () => {
  const [delays, setDelays] = useState([]);
  const [delayType, setDelayType] = useState("");
  const [delayDescription, setDelayDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const addDelay = () => {
    if (delayType && delayDescription) {
      setDelays([...delays, { type: delayType, description: delayDescription }]);
      setDelayType("");
      setDelayDescription("");
    }
  };

  const removeDelay = (index) => {
    setDelays(delays.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
        <h3 className="text-white font-semibold mb-4">Quality Issues</h3>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50"
          rows={5}
          placeholder="Describe any quality issues encountered..."
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
        <h3 className="text-white font-semibold mb-4">Safety Incidents</h3>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50"
          rows={5}
          placeholder="Report any safety incidents or concerns..."
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
        <h3 className="text-white font-semibold mb-4">Delays and Issues</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Delay Type</label>
              <select
                value={delayType}
                onChange={(e) => setDelayType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FF7120]/50"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" style={{ background: '#00273C', color: 'white' }}>Select Type</option>
                <option value="Weather" style={{ background: '#00273C', color: 'white' }}>Weather</option>
                <option value="Material" style={{ background: '#00273C', color: 'white' }}>Material Shortage</option>
                <option value="Equipment" style={{ background: '#00273C', color: 'white' }}>Equipment Failure</option>
                <option value="Labor" style={{ background: '#00273C', color: 'white' }}>Labor Issues</option>
                <option value="Other" style={{ background: '#00273C', color: 'white' }}>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Description</label>
              <input
                type="text"
                value={delayDescription}
                onChange={(e) => setDelayDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50"
              />
            </div>
          </div>
          <button
            onClick={addDelay}
            className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition"
          >
            + Add Delay
          </button>

          {delays.length > 0 && (
            <div className="mt-4 space-y-2">
              {delays.map((delay, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div>
                    <span className="text-[#FF7120] font-medium">{delay.type}</span>
                    <span className="text-white/70 ml-2">- {delay.description}</span>
                  </div>
                  <button onClick={() => removeDelay(index)} className="text-white/50 hover:text-white transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
        <h3 className="text-white font-semibold mb-4">Photo Documentation</h3>
        <label className="block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center cursor-pointer hover:border-[#FF7120]/50 transition">
            <Upload className="h-10 w-10 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Click to upload photos</p>
            <p className="text-white/40 text-xs mt-1">or drag and drop</p>
          </div>
        </label>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewTab = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
      <h3 className="text-white font-semibold mb-4">Project Information</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-white/50 text-sm mb-1">Project Name</label>
            <p className="text-white font-medium">Sample Project</p>
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Current Milestone</label>
            <p className="text-white font-medium">Foundation Work</p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <label className="block text-white/50 text-sm mb-1">Entry Date</label>
            <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Progress Percentage</label>
            <p className="text-white font-medium">45%</p>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
      <h3 className="text-white font-semibold mb-4">Work Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Tasks Completed</p>
          <p className="text-white text-3xl font-bold">12</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Materials Delivered</p>
          <p className="text-white text-3xl font-bold">8</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Equipment Used</p>
          <p className="text-white text-3xl font-bold">5</p>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-white/10 bg-[#00273C]/60 p-6">
      <h3 className="text-white font-semibold mb-4">Issues & Documentation</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Delays Reported</p>
          <p className="text-white text-3xl font-bold">2</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Quality Issues</p>
          <p className="text-white text-3xl font-bold">No</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-white/50 text-sm mb-1">Photos Uploaded</p>
          <p className="text-white text-3xl font-bold">6</p>
        </div>
      </div>
    </div>

    <div className="flex gap-3 justify-end">
      <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition">
        Save as Draft
      </button>
      <button className="px-6 py-3 bg-[#FF7120] text-white rounded-xl font-semibold hover:brightness-95 transition">
        Submit Entry
      </button>
    </div>
  </div>
);

const SiteEngineerDiaryHub = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState("project");

  const cardClass = "rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg";

  return (
    <div className="min-h-screen bg-[#00273C] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#FF7120]/20 blur-[80px]" />
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      <PublicNavigation onNavigate={onNavigate} currentPage="engineer-hub" user={user} />

      <div className="relative pt-28 px-6 pb-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex gap-6">
            <aside className="w-64 shrink-0">
              <div className={`${cardClass} p-4 sticky top-24`}>
                <nav className="space-y-2">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                          isActive
                            ? "bg-[#FF7120] text-white"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className={cardClass}>
                <div className="p-6 border-b border-white/10">
                  <h1 className="text-2xl font-semibold text-white">New Site Diary Entry</h1>
                  <p className="text-white/60 text-sm mt-1">Record daily site activities and progress</p>
                </div>

                <div className="p-6">
                  {activeTab === "project" && <ProjectInfoTab />}
                  {activeTab === "labor" && <LaborWorkTab />}
                  {activeTab === "materials" && <MaterialsEquipmentTab />}
                  {activeTab === "delays" && <DelaysTab />}
                  {activeTab === "review" && <ReviewTab />}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteEngineerDiaryHub;
