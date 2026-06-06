import React, { useState } from 'react';
import useDartStore from '../../store/dartStore';

const emptyForm = { name: '', lat: '', lng: '', corridor: 'A', type: 'station' };

export default function StationManager() {
  const { stations, addStation, removeStation, updateStation } = useDartStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const handleSave = async () => {
    if (!form.name || !form.lat || !form.lng) return;
    const method = editId ? 'PUT' : 'POST';
    const url    = editId ? `/api/stations/${editId}` : '/api/stations';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (res.ok) {
        const saved = await res.json();
        editId ? updateStation(saved) : addStation(saved);
        setForm(emptyForm); setEditId(null); setShowForm(false);
      }
    } catch {}
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, lat: s.lat, lng: s.lng, corridor: s.corridor, type: s.type });
    setEditId(s.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this station?')) return;
    await fetch(`/api/stations/${id}`, { method: 'DELETE' });
    removeStation(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-dart-dark">Station Management</h2>
        <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm(emptyForm); }}
          className="bg-dart-green text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-green-700">
          + Add Station
        </button>
      </div>

      {showForm && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 space-y-2">
          <div className="font-semibold text-sm text-dart-dark">{editId ? 'Edit Station' : 'New Station'}</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Station name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm col-span-2" />
            <input type="number" step="0.0001" placeholder="Latitude (e.g. -6.79)" value={form.lat}
              onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm" />
            <input type="number" step="0.0001" placeholder="Longitude (e.g. 39.21)" value={form.lng}
              onChange={e => setForm(p => ({ ...p, lng: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm" />
            <select value={form.corridor} onChange={e => setForm(p => ({ ...p, corridor: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm">
              <option value="A">Corridor A</option>
              <option value="B">Corridor B</option>
              <option value="C">Corridor C</option>
            </select>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm">
              <option value="station">Station</option>
              <option value="terminal">Terminal</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-dart-green text-white px-4 py-1.5 rounded text-sm font-semibold">Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="border px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
              <th className="px-3 py-2 text-left">Station</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Corridor</th>
              <th className="px-3 py-2 text-left">Coordinates</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stations.map(st => (
              <tr key={st.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{st.type === 'terminal' ? '🏛️' : '🏢'}</span>
                    <span className="font-semibold text-dart-dark">{st.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 capitalize text-gray-600">{st.type}</td>
                <td className="px-3 py-2 text-gray-600">{st.corridor}</td>
                <td className="px-3 py-2 text-gray-400 text-xs font-mono">
                  {st.lat.toFixed(4)}, {st.lng.toFixed(4)}
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    st.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>{st.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => handleEdit(st)} className="text-blue-400 hover:text-blue-700 text-xs font-semibold">Edit</button>
                  <button onClick={() => handleDelete(st.id)} className="text-red-400 hover:text-red-700 text-xs font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
