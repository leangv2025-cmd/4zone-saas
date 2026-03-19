// 4Zone Backend — server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    'https://4zone.store',
    'https://www.4zone.store',
    'https://app.4zone.store',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Rate Limiting ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ---- Routes ----
app.use('/api/chat', require('./routes/chat'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/image', require('./routes/image'));
app.use('/api/video', require('./routes/video'));
app.use('/api/auth', require('./routes/auth'));

// ---- Health check ----
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }));

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 4Zone API running on port ${PORT}`));

module.exports = app;
