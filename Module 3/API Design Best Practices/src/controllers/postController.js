const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);
  return http.sendList(res, result.data, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);

  if (!post) {
    return http.sendError(res, 404, {
      message: 'Post not found',
      code: 'NOT_FOUND'
    });
  }

  return http.sendOk(res, post);
}

function createPost(req, res) {
  const { title, author } = req.body || {};

  if (
    typeof title !== 'string' || !title.trim() ||
    typeof author !== 'string' || !author.trim()
  ) {
    return http.sendError(res, 400, {
      message: 'Title and author are required',
      code: 'VALIDATION_ERROR'
    });
  }

  const post = service.createPost({
    title: title.trim(),
    author: author.trim()
  });

  return http.sendCreated(res, post);
}

function likePost(req, res) {
  try {
    const post = service.likePost(req.params.id);
    return http.sendOk(res, post);
  } catch (err) {
    return http.sendError(res, err.statusCode || 500, {
      message: err.statusCode === 404 ? 'Post not found' : 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    });
  }
}

function explode(req, res) {
  try {
    service.explode();
  } catch (_err) {
    return http.sendError(res, 500, {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
