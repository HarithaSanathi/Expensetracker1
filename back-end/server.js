require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const expenseSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  amt: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
}, { timestamps: true });

const Salary = mongoose.model('Salary', expenseSchema);
const House = mongoose.model('House', expenseSchema);
const Office = mongoose.model('Office', expenseSchema);

app.use(cors());
app.use(express.json());

// Root API route to prevent "Cannot GET /api"
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to NoVAHAMOTECH API',
    availableTypes: ['salary', 'house', 'office'],
    usage: 'Use /api/salary, /api/house, or /api/office endpoints for CRUD operations'
  });
});

// Helper function to get model by type
function getModel(type) {
  switch(type) {
    case 'salary': return Salary;
    case 'house': return House;
    case 'office': return Office;
    default: return null;
  }
}

app.get('/api/:type', async (req, res) => {
  const Model = getModel(req.params.type);
  if (!Model) return res.status(404).json({ error: 'Invalid type' });
  const entries = await Model.find();
  res.json(entries);
});

app.post('/api/:type', async (req, res) => {
  const Model = getModel(req.params.type);
  if (!Model) return res.status(404).json({ error: 'Invalid type' });
  try {
    const entry = new Model(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:type/:id', async (req, res) => {
  const Model = getModel(req.params.type);
  if (!Model) return res.status(404).json({ error: 'Invalid type' });
  try {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:type/:id', async (req, res) => {
  const Model = getModel(req.params.type);
  if (!Model) return res.status(404).json({ error: 'Invalid type' });
  const deleted = await Model.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Entry not found' });
  res.status(204).send();
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// General error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

app.listen(port, () => {
  console.log(`NoVAHAMOTECH backend API running on port ${port}`);
});
