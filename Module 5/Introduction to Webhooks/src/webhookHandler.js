'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers['x-webhook-signature'];

  // 1. Verify the HMAC-SHA256 signature
  if (!secret || typeof signature !== 'string' ||
      !signature.startsWith('sha256=')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const received = signature.slice('sha256='.length);

  if (!/^[0-9a-fA-F]{64}$/.test(received)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest();

  const receivedBuffer = Buffer.from(received, 'hex');

  if (!crypto.timingSafeEqual(expected, receivedBuffer)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Parse the body only after signature verification
  let event;

  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (!event || typeof event.id !== 'string' || !event.id) {
    return res.status(400).json({ error: 'Invalid event' });
  }

  // 3. Skip duplicate events
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Mark the event before processing
  _processedIds.add(event.id);

  // 5. Acknowledge first, then process asynchronously
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch((error) => {
      console.error('Webhook processing failed:', error);
    });
  });
}

module.exports = { handleWebhook, _processedIds };
