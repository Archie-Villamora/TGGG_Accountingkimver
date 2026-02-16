import React, { useState } from "react";
import { Plus } from "lucide-react";

const LaborWorkTab = () => {
  const [personnel, setPersonnel] = useState({
    foreman: "",
    carpenter: "",
    mason: "",
    laborer: "",
    electrician: "",
    plumber: "",
  });

  const [overtimeEntry, setOvertimeEntry] = useState({
    number: "",
    role: "",
    hours: "",
    rate: "",
  });

  const [workPerformed, setWorkPerformed] = useState("");
  const [personnelNotes, setPersonnelNotes] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);

  const handlePersonnelChange = (field, value) => {
    setPersonnel((prev) => ({ ...prev, [field]: value }));
  };

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, taskInput]);
      setTaskInput("");
    }
  };

  const sectionClass = "rounded-xl border border-white/10 bg-[#00273C]/60 p-6";
  const labelClass = "block text-white/70 text-sm mb-2";
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50";

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Labor and Personnel</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Foreman</label>
            <input
              type="number"
              value={personnel.foreman}
              onChange={(e) => handlePersonnelChange("foreman", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Carpenter</label>
            <input
              type="number"
              value={personnel.carpenter}
              onChange={(e) => handlePersonnelChange("carpenter", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Mason</label>
            <input
              type="number"
              value={personnel.mason}
              onChange={(e) => handlePersonnelChange("mason", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={labelClass}>Laborer</label>
            <input
              type="number"
              value={personnel.laborer}
              onChange={(e) => handlePersonnelChange("laborer", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Electrician</label>
            <input
              type="number"
              value={personnel.electrician}
              onChange={(e) => handlePersonnelChange("electrician", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Plumber</label>
            <input
              type="number"
              value={personnel.plumber}
              onChange={(e) => handlePersonnelChange("plumber", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 mb-4">
          <h4 className="text-white/80 text-sm font-medium mb-3">Overtime Personnel</h4>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className={labelClass}>Number of Personnel</label>
              <input
                type="number"
                value={overtimeEntry.number}
                onChange={(e) => setOvertimeEntry({ ...overtimeEntry, number: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Role</label>
              <select
                value={overtimeEntry.role}
                onChange={(e) => setOvertimeEntry({ ...overtimeEntry, role: e.target.value })}
                className={inputClass}
              >
                <option value="">Select role</option>
                <option value="foreman">Foreman</option>
                <option value="carpenter">Carpenter</option>
                <option value="mason">Mason</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Hours</label>
              <input
                type="number"
                value={overtimeEntry.hours}
                onChange={(e) => setOvertimeEntry({ ...overtimeEntry, hours: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Rate</label>
              <input
                type="number"
                value={overtimeEntry.rate}
                onChange={(e) => setOvertimeEntry({ ...overtimeEntry, rate: e.target.value })}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <button className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition">
              Add
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Personnel Notes</label>
          <textarea
            value={personnelNotes}
            onChange={(e) => setPersonnelNotes(e.target.value)}
            className={inputClass}
            rows={4}
            placeholder="Additional notes about personnel..."
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Work Performed</h3>
        
        <div className="mb-4">
          <label className={labelClass}>Description of Work Performed</label>
          <textarea
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            className={inputClass}
            rows={5}
            placeholder="Describe the work performed today..."
          />
        </div>

        <div>
          <label className={labelClass}>Tasks Completed</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className={inputClass}
              placeholder="Enter task and press + to add"
            />
            <button
              onClick={addTask}
              className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {tasks.length > 0 && (
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white/80 text-sm flex-1">{task}</span>
                  <button
                    onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                    className="text-white/40 hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaborWorkTab;
