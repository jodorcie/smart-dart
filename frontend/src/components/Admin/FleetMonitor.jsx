import React, { useState } from 'react';
import useDartStore from '../../store/dartStore';

export default function FleetMonitor() {
  const buses   = useDartStore(s => s.buses);
  const routes  = useDartStore(s => s.routes);
  const addBus  = useDartStore(s => s.addBus);
  const removeBus = useDartStore(s => s.removeBus);
  const updateBus = useDartStore(s => s.updateBus);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: '', routeId: '', capacity: 60, driver: '' });
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const handleAdd = async () => {
    if (!form.id || !form.routeId) return;
    try {
      const res = await fetch('/api/buses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (res.ok) { addBus(await res.json()); setForm({ id: '', routeId: '', capacity: 60, driver: '' }); setShowForm(false); }
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm(`Remove bus ${id}?`)) return;
    await fetch(`/api/buses/${id}`, { method: 'DELETE' });
    removeBus(id);
  };

  const handleStatusChange = async (bus, status) => {
    const res = await fetch(`/api/buses/${bus.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) { updateBus({ id: bus.id, status }); setEditId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-dart-dark">Fleet Monitor</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-dart-red text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-red-700">
          + Add Bus
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border rounded-xl p-4 mb-4 space-y-2">
          <div className="font-semibold text-sm text-dart-dark">New Bus</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Bus ID (e.g. DART006)" value={form.id}
              onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm col-span-2" />
            <select value={form.routeId} onChange={e => setForm(p => ({ ...p, routeId: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm">
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.shortName} – {r.name}</option>)}
            </select>
            <input type="number" placeholder="Capacity" value={form.capacity}
              onChange={e => setForm(p => ({ ...p, capacity: +e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm" />
            <input placeholder="Driver name" value={form.driver}
              onChange={e => setForm(p => ({ ...p, driver: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm col-span-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-dart-green text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-green-700">Save</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
              <th className="px-3 py-2 text-left">Bus ID</th>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Speed</th>
              <th className="px-3 py-2 text-left">Driver</th>
              <th className="px-3 py-2 text-left">GPS</th>
              <th className="px-3 py-2 text-left">Last Update</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {buses.map(bus => {
              const route = routes.find(r => r.id === bus.routeId);
              return (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-black text-dart-dark">{bus.id}</td>
                  <td className="px-3 py-2">
                    <span className="text-white text-xs px-2 py-0.5 rounded font-bold"
                      style={{ background: route?.color || '#888' }}>
                      {route?.shortName || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {editId === bus.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        onBlur={() => handleStatusChange(bus, editStatus)}
                        autoFocus className="border rounded px-1 py-0.5 text-xs">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="maintenance">maintenance</option>
                      </select>
                    ) : (
                      <span onClick={() => { setEditId(bus.id); setEditStatus(bus.status); }}
                        className={`text-xs font-semibold capitalize cursor-pointer px-2 py-0.5 rounded-full ${
                          bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {bus.status}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{Math.round(bus.speed || 0)} km/h</td>
                  <td className="px-3 py-2 text-gray-600">{bus.driver || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-semibold ${bus.lat ? 'text-green-600' : 'text-red-500'}`}>
                      {bus.lat ? '● Active' : '○ No Fix'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400 text-xs">
                    {bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(bus.id)}
                      className="text-red-400 hover:text-red-700 text-xs font-semibold">Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
