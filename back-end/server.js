const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data stores for demonstration - replace with DB in production
let salaryEntries = [];
let houseEntries = [];
let officeEntries = [];

// Helper to get store by type
function getStore(type) {
  if (type === 'salary') return salaryEntries;
  if (type === 'house') return houseEntries;
  if (type === 'office') return officeEntries;
  return null;
}

// GET list
app.get('/api/:type', (req, res) => {
  const store = getStore(req.params.type);
  if (!store) return res.status(404).send({ error: 'Invalid type' });
  res.json(store);
});

// POST new entry
app.post('/api/:type', (req, res) => {
  const store = getStore(req.params.type);
  if (!store) return res.status(404).send({ error: 'Invalid type' });
  const entry = req.body;
  entry.id = uuidv4();
  store.push(entry);
  res.status(201).json(entry);
});

// PUT update entry
app.put('/api/:type/:id', (req, res) => {
  const store = getStore(req.params.type);
  if (!store) return res.status(404).send({ error: 'Invalid type' });
  const idx = store.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).send({ error: 'Entry not found' });
  store[idx] = {...store[idx], ...req.body, id: req.params.id};
  res.json(store[idx]);
});

// DELETE entry
app.delete('/api/:type/:id', (req, res) => {
  const store = getStore(req.params.type);
  if (!store) return res.status(404).send({ error: 'Invalid type' });
  const idx = store.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).send({ error: 'Entry not found' });
  store.splice(idx, 1);
  res.status(204).send();
});

// Start server
app.listen(port, () => {
  console.log(`NoVAHAMOTECH backend API running on port ${port}`);
});
