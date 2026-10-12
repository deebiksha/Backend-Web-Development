
const express = require('express');
const { posts } = require('../data');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

function canManagePost(req, post) {
  return (
    post.authorId === req.user.id ||
    ['moderator', 'admin'].includes(req.user.role)
  );
}

// List posts — any authenticated user.
router.get('/', (req, res) => {
  return res.status(200).json(posts);
});

// Create a post.
router.post('/', (req, res) => {
  const post = {
    id: String(posts.length + 1),
    authorId: req.user.id,
    title: req.body?.title ?? 'Untitled',
    hidden: false,
  };

  posts.push(post);
  return res.status(201).json(post);
});

// Update a post — owner, moderator, or admin.
router.patch('/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  if (!canManagePost(req, post)) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this post' },
    });
  }

  post.title = req.body?.title ?? post.title;
  return res.status(200).json(post);
});

// Delete a post — owner, moderator, or admin.
router.delete('/:id', (req, res) => {
  const idx = posts.findIndex((p) => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  if (!canManagePost(req, posts[idx])) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this post' },
    });
  }

  posts.splice(idx, 1);
  return res.status(200).json({ ok: true });
});

// Hide a post — moderator or admin only.
router.post('/:id/hide', requireRole('moderator', 'admin'), (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  post.hidden = true;
  return res.status(200).json(post);
});

module.exports = router;
