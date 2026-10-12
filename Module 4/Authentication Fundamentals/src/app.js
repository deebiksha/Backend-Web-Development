require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;

if (!process.env.COOKIE_SECRET) {
  throw new Error('COOKIE_SECRET must be configured.');
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Invalid JSON request body.',
    });
  }

  if ([400, 401, 409].includes(error.status)) {
    return res.status(error.status).json({
      error: error.code || 'REQUEST_ERROR',
      message: error.message || 'Request could not be completed.',
    });
  }

  console.error('Request failed:', error.message);

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
  });
});

app.listen(port, () => {
  console.log(`Authentication server listening on port ${port}`);
});
