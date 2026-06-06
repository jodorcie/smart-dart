const express = require('express');
const router = express.Router();

module.exports = (state) => {
  router.get('/', (req, res) => res.json(state.stations));

  router.get('/:id', (req, res) => {
    const station = state.stations.find(s => s.id === req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json(station);
  });

  router.post('/', (req, res) => {
    const { name, lat, lng, corridor, type } = req.body;
    if (!name || lat == null || lng == null) return res.status(400).json({ error: 'name, lat and lng required' });
    const newStation = {
      id: 'ST' + Date.now(), name, lat: parseFloat(lat), lng: parseFloat(lng),
      corridor: corridor || 'A', type: type || 'station', active: true,
    };
    state.stations.push(newStation);
    res.status(201).json(newStation);
  });

  router.put('/:id', (req, res) => {
    const idx = state.stations.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Station not found' });
    state.stations[idx] = { ...state.stations[idx], ...req.body, id: req.params.id };
    res.json(state.stations[idx]);
  });

  router.delete('/:id', (req, res) => {
    const idx = state.stations.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Station not found' });
    state.stations.splice(idx, 1);
    res.json({ message: 'Station deleted' });
  });

  return router;
};
