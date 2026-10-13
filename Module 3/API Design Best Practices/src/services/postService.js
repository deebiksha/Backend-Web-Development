const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 5;

function listPosts(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page = Number.isInteger(parsedPage) && parsedPage > 0
    ? parsedPage
    : 1;

  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, MAX_LIMIT)
    : DEFAULT_LIMIT;

  const allPosts = store.getAllPosts();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = allPosts.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

function getPost(id) {
  return store.getPostById(id) || null;
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);

  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return post;
}

function explode() {
  throw new Error('Internal server error');
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
