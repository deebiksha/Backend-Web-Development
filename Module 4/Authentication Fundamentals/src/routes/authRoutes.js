const express = require('express');
const authService = require('../services/authService');
const sessionStore = require('../sessionStore');
const { cookieOptions, setCookieOptions } = require('../config/cookies');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    const session = sessionStore.create(user.id);

    res.cookie('sid', session.id, setCookieOptions());

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    const session = sessionStore.get(sessionId);

    if (!session) {
      res.clearCookie('sid', cookieOptions);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    const user = await authService.findPublicById(session.userId);

    if (!user) {
      sessionStore.destroy(sessionId);
      res.clearCookie('sid', cookieOptions);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;

    if (typeof sessionId === 'string') {
      sessionStore.destroy(sessionId);
    }

    res.clearCookie('sid', cookieOptions);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
