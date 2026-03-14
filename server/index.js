const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leaves', leaveRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Veera Group Employee Manager API is running' });
});

// Diagnostic route
app.get('/api/debug', (req, res) => {
  res.json({
    supabaseUrlSet: !!process.env.SUPABASE_URL,
    supabaseKeySet: !!process.env.SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Veera Group Employee Manager API is running. Please use the frontend on port 5173.');
});

// Initialize DB then start server
if (process.env.NODE_ENV !== 'production') {
  async function start() {
    await getDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on all interfaces at port ${PORT}`);
    });
  }
  start().catch(console.error);
}

module.exports = app;
