const postStore = require('../data/postStore');

// Repository boundary: services do not access storage directly.
async function findAll() {
  return Array.from(postStore.posts.values());
}

async function findById(id) {
  return postStore.posts.get(Number(id)) || null;
}

async function create(fields) {
  const post = { id: postStore.nextId(), ...fields };
  postStore.posts.set(post.id, post);
  return post;
}

async function update(id, changes) {
  const post = await findById(id);
  if (!post) return null;

  Object.assign(post, changes);
  return post;
}

async function remove(id) {
  return postStore.posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
