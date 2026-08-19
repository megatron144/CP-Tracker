const { rateLimit } = require('express-rate-limit');

// Rate limiter for sync endpoints: Max 10 sync calls per 15 minutes per IP
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many sync requests. Please wait a few minutes before synchronizing again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for auth endpoints: Max 30 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  syncLimiter,
  authLimiter
};
