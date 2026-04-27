const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JobReady CRM API running' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/companies', require('./routes/companies.routes'));
app.use('/api/stats', require('./routes/stats.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

module.exports = app;