
'use strict';

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // Maximum 5 attempts per IP
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// In production with multiple app instances behind a load balancer,
// use a shared Redis store such as rate-limit-redis.
// The default in-memory store keeps separate counters in each process,
// so requests reaching different instances would not share the same limit.

module.exports = authLimiter;
