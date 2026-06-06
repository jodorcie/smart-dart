const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

module.exports = (state) => {
  router.get('/', (req, res) => res.json(state.routes));

  router.get('/:id', (req, res) => {
    const route = state.routes.find(r => r.id === req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  });

  router.post('/', (req, res) => {
    const { name, shortName, color, stationIds, frequency } = req.body;
    if (!name || !stationIds) return res.status(400).json({ error: 'name and stationIds required' });
    const newRoute = {
      id: 'RT' + Date.now(), name, shortName: shortName || name.slice(0, 3).toUpperCase(),
      color: color || '#E53935', stationIds: stationIds || [], active: true,
      frequency: frequency || 10,
    };
    state.routes.push(newRoute);
    res.status(201).json(newRoute);
  });

  router.put('/:id', (req, res) => {
    const idx = state.routes.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Route not found' });
    state.routes[idx] = { ...state.routes[idx], ...req.body, id: req.params.id };
    res.json(state.routes[idx]);
  });

  router.delete('/:id', (req, res) => {
    const idx = state.routes.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Route not found' });
    state.routes.splice(idx, 1);
    res.json({ message: 'Route deleted' });
  });

  return router;
};
