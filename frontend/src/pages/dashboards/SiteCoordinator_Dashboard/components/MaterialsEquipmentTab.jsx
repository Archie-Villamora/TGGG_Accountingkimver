import React, { useState } from "react";
import { Plus } from "lucide-react";

const MaterialsEquipmentTab = () => {
  const [materialEntry, setMaterialEntry] = useState({
    name: "",
    quantity: "",
    unit: "",
    cost: "",
  });

  const [equipmentEntry, setEquipmentEntry] = useState({
    name: "",
    operator: "",
    hours: "",
  });

  const [materials, setMaterials] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const addMaterial = () => {
    if (materialEntry.name && materialEntry.quantity) {
      setMaterials([...materials, { ...materialEntry, id: Date.now() }]);
      setMaterialEntry({ name: "", quantity: "", unit: "", cost: "" });
    }
  };

  const addEquipment = () => {
    if (equipmentEntry.name && equipmentEntry.operator) {
      setEquipment([...equipment, { ...equipmentEntry, id: Date.now() }]);
      setEquipmentEntry({ name: "", operator: "", hours: "" });
    }
  };

  const sectionClass = "rounded-xl border border-white/10 bg-[#00273C]/60 p-6";
  const labelClass = "block text-white/70 text-sm mb-2";
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#FF7120]/50";

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Materials Delivered</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Material Name</label>
            <input
              type="text"
              value={materialEntry.name}
              onChange={(e) => setMaterialEntry({ ...materialEntry, name: e.target.value })}
              className={inputClass}
              placeholder="e.g., Cement"
            />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              value={materialEntry.quantity}
              onChange={(e) => setMaterialEntry({ ...materialEntry, quantity: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <select
              value={materialEntry.unit}
              onChange={(e) => setMaterialEntry({ ...materialEntry, unit: e.target.value })}
              className={inputClass}
            >
              <option value="">Select unit</option>
              <option value="bags">Bags</option>
              <option value="pcs">Pieces</option>
              <option value="m3">Cubic Meters</option>
              <option value="kg">Kilograms</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Cost</label>
            <input
              type="number"
              value={materialEntry.cost}
              onChange={(e) => setMaterialEntry({ ...materialEntry, cost: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          onClick={addMaterial}
          className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>

        {materials.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-white/70 text-sm font-medium">Added Materials</h4>
            {materials.map((material) => (
              <div key={material.id} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex gap-4 text-sm">
                  <span className="text-white font-medium">{material.name}</span>
                  <span className="text-white/60">{material.quantity} {material.unit}</span>
                  <span className="text-white/60">₱{material.cost}</span>
                </div>
                <button
                  onClick={() => setMaterials(materials.filter((m) => m.id !== material.id))}
                  className="text-white/40 hover:text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <h3 className="text-white font-semibold mb-4">Equipment Used</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Equipment Name</label>
            <input
              type="text"
              value={equipmentEntry.name}
              onChange={(e) => setEquipmentEntry({ ...equipmentEntry, name: e.target.value })}
              className={inputClass}
              placeholder="e.g., Excavator"
            />
          </div>
          <div>
            <label className={labelClass}>Operator Name</label>
            <input
              type="text"
              value={equipmentEntry.operator}
              onChange={(e) => setEquipmentEntry({ ...equipmentEntry, operator: e.target.value })}
              className={inputClass}
              placeholder="Operator name"
            />
          </div>
          <div>
            <label className={labelClass}>Hours Used</label>
            <input
              type="number"
              value={equipmentEntry.hours}
              onChange={(e) => setEquipmentEntry({ ...equipmentEntry, hours: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <button
          onClick={addEquipment}
          className="px-4 py-2.5 bg-[#FF7120] text-white rounded-lg font-medium hover:brightness-95 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>

        {equipment.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-white/70 text-sm font-medium">Added Equipment</h4>
            {equipment.map((equip) => (
              <div key={equip.id} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex gap-4 text-sm">
                  <span className="text-white font-medium">{equip.name}</span>
                  <span className="text-white/60">Operator: {equip.operator}</span>
                  <span className="text-white/60">{equip.hours}h</span>
                </div>
                <button
                  onClick={() => setEquipment(equipment.filter((e) => e.id !== equip.id))}
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
  );
};

export default MaterialsEquipmentTab;
