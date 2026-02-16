import React, { useState } from "react";
import { Cloud, MapPin } from "lucide-react";

const ProjectInfoTab = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    date: new Date().toISOString().split("T")[0],
    milestone: "",
    completion: "",
    morningStart: "",
    morningEnd: "",
    afternoonStart: "",
    afternoonEnd: "",
    weatherCondition: "",
    tempHigh: "",
    tempLow: "",
    humidity: "",
    windSpeed: "",
    location: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sectionClass = "rounded-xl border border-white/10 bg-[#00273C]/60 p-6";
  const labelClass = "block text-white/70 text-sm mb-2";
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50";

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Project Name</label>
            <select value={formData.projectName} onChange={(e) => handleChange("projectName", e.target.value)} className={inputClass}>
              <option value="">Select project</option>
              <option value="project1">Project Alpha</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Milestone Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Current Milestone</label>
            <select value={formData.milestone} onChange={(e) => handleChange("milestone", e.target.value)} className={inputClass}>
              <option value="">Select milestone</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Completion (%)</label>
            <input type="number" min="0" max="100" value={formData.completion} onChange={(e) => handleChange("completion", e.target.value)} className={inputClass} placeholder="0-100" />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Work Shifts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Morning Start</label>
            <input type="time" value={formData.morningStart} onChange={(e) => handleChange("morningStart", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Morning End</label>
            <input type="time" value={formData.morningEnd} onChange={(e) => handleChange("morningEnd", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Afternoon Start</label>
            <input type="time" value={formData.afternoonStart} onChange={(e) => handleChange("afternoonStart", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Afternoon End</label>
            <input type="time" value={formData.afternoonEnd} onChange={(e) => handleChange("afternoonEnd", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Weather Conditions</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Weather Condition</label>
            <select value={formData.weatherCondition} onChange={(e) => handleChange("weatherCondition", e.target.value)} className={inputClass}>
              <option value="">Select condition</option>
              <option value="sunny">Sunny</option>
              <option value="rainy">Rainy</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Temp High (°C)</label>
              <input type="number" value={formData.tempHigh} onChange={(e) => handleChange("tempHigh", e.target.value)} className={inputClass} placeholder="32" />
            </div>
            <div>
              <label className={labelClass}>Temp Low (°C)</label>
              <input type="number" value={formData.tempLow} onChange={(e) => handleChange("tempLow", e.target.value)} className={inputClass} placeholder="24" />
            </div>
            <div>
              <label className={labelClass}>Humidity (%)</label>
              <input type="number" value={formData.humidity} onChange={(e) => handleChange("humidity", e.target.value)} className={inputClass} placeholder="65" />
            </div>
            <div>
              <label className={labelClass}>Wind Speed (km/h)</label>
              <input type="number" value={formData.windSpeed} onChange={(e) => handleChange("windSpeed", e.target.value)} className={inputClass} placeholder="15" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="h-5 w-5 text-[#FF7120]" />
                <h4 className="text-white font-medium">Morning Weather</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Temperature:</span>
                  <span className="text-white">{formData.tempLow || "--"}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Wind Speed:</span>
                  <span className="text-white">{formData.windSpeed || "--"} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Humidity:</span>
                  <span className="text-white">{formData.humidity || "--"}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="h-5 w-5 text-[#FF7120]" />
                <h4 className="text-white font-medium">Afternoon Weather</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Temperature:</span>
                  <span className="text-white">{formData.tempHigh || "--"}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Wind Speed:</span>
                  <span className="text-white">{formData.windSpeed || "--"} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Humidity:</span>
                  <span className="text-white">{formData.humidity || "--"}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Project Location</label>
              <input type="text" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} className={inputClass} placeholder="Enter location" />
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Fetch Weather
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoTab;
