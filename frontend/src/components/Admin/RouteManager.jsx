import React, { useState } from 'react';
import useDartStore from '../../store/dartStore';

const COLORS = ['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00ACC1'];

const emptyForm = { name: '', shortName: '', color: '#E53935', frequency: 10 };

export default function RouteManager() {
  const { routes, stations, addRoute, removeRoute, updateRoute } = useDartStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const handleSave = async () => {
    if (!form.name) return;
    const method = editId ? 'PUT' : 'POST';
    const url    = editId ? `/api/routes/${editId}` : '/api/routes';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stationIds: form.stationIds || [] }),
      });
      if (res.ok) {
        const saved = await res.json();
        editId ? updateRoute(saved) : addRoute(saved);
        setForm(emptyForm); setEditId(null); setShowForm(false);
      }
    } catch {}
  };

  const handleEdit = (r) => {
    setForm({ name: r.name, shortName: r.shortName, color: r.color, frequency: r.frequency, stationIds: r.stationIds });
    setEditId(r.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return;
    await fetch(`/api/routes/${id}`, { method: 'DELETE' });
    removeRoute(id);
  };

  const handleToggle = async (r) => {
    const res = await fetch(`/api/routes/${r.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !r.active }),
    });
    if (res.ok) updateRoute({ id: r.id, active: !r.active });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-dart-dark">Route Management</h2>
        <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm(emptyForm); }}
          className="bg-dart-blue text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">
          + New Route
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-2">
          <div className="font-semibold text-sm text-dart-dark">{editId ? 'Edit Route' : 'New Route'}</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Route name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm col-span-2" />
            <input placeholder="Short code (e.g. A1)" value={form.shortName}
              onChange={e => setForm(p => ({ ...p, shortName: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm" />
            <input type="number" placeholder="Freq (min)" value={form.frequency}
              onChange={e => setForm(p => ({ ...p, frequency: +e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-600">Color:</span>
            {COLORS.map(c => (
              <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                style={{ background: c }}
                className={`w-6 h-6 rounded-full border-2 ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'} transition-transform`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-dart-blue text-white px-4 py-1.5 rounded text-sm font-semibold">Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="border px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {routes.map(r => (
          <div key={r.id} className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: r.color }}>
              {r.shortName}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-dart-dark text-sm">{r.name}</div>
              <div className="text-xs text-gray-400">{r.stationIds.length} stations · Every {r.frequency} min</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(r)}
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {r.active ? 'Active' : 'Suspended'}
              </button>
              <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-700 text-xs font-semibold">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-700 text-xs font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
