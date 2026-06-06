const express = require('express');
const router = express.Router();

module.exports = (state) => {
  router.get('/', (req, res) => {
    res.json(state.buses);
  });

  router.get('/:id', (req, res) => {
    const bus = state.buses.find(b => b.id === req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  });

  router.post('/', (req, res) => {
    const { id, routeId, capacity, driver } = req.body;
    if (!id || !routeId) return res.status(400).json({ error: 'id and routeId required' });
    if (state.buses.find(b => b.id === id)) return res.status(409).json({ error: 'Bus ID already exists' });
    const route = state.routes.find(r => r.id === routeId);
    if (!route) return res.status(400).json({ error: 'Route not found' });
    const waypoints = state.routeWaypoints[routeId] || [];
    const newBus = {
      id, routeId, capacity: capacity || 60, driver: driver || 'Unassigned',
      status: 'active', waypointIndex: 0, direction: 1, speed: 35,
      lat: waypoints[0]?.[0], lng: waypoints[0]?.[1],
    };
    state.buses.push(newBus);
    res.status(201).json(newBus);
  });

  router.put('/:id', (req, res) => {
    const idx = state.buses.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Bus not found' });
    state.buses[idx] = { ...state.buses[idx], ...req.body, id: req.params.id };
    res.json(state.buses[idx]);
  });

  router.delete('/:id', (req, res) => {
    const idx = state.buses.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Bus not found' });
    state.buses.splice(idx, 1);
    res.json({ message: 'Bus removed' });
  });

  return router;
};
