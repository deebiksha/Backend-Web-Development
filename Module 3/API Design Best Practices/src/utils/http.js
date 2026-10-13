function sendList(res, data, meta) {
  return res.status(200).json({ data, meta });
}

function sendOk(res, data) {
  return res.status(200).json({ data });
}

function sendCreated(res, data) {
  return res.status(201).json({ data });
}

function sendError(res, status, payload) {
  return res.status(status).json({
    error: {
      message: payload.message || 'Request failed',
      code: payload.code || 'INTERNAL_ERROR'
    }
  });
}

module.exports = {
  sendList,
  sendCreated,
  sendOk,
  sendError
};
