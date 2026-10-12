
'use strict';
// routes/payments.js

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // Rule 1: Reject requests without an idempotency key.
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  // Rule 2: Return the saved response for a repeated key.
  if (idempotency.has(key)) {
    const savedResponse = idempotency.get(key);
    return res.status(savedResponse.status).json(savedResponse.body);
  }

  // Rule 3: Create exactly one charge for a new key.
  const amount = req.body && req.body.amount;
  const charge = {
    id: nextChargeId(),
    amount,
    status: 'charged'
  };

  charges.push(charge);

  const status = 201;
  const body = {
    id: charge.id,
    amount: charge.amount,
    status: charge.status
  };

  // Save the response so retries do not charge again.
  idempotency.set(key, { status, body });

  return res.status(status).json(body);
});

module.exports = router;
