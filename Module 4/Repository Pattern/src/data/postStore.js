// Map storage can later be replaced by Prisma without changing the services.
const posts = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

module.exports = {
  posts,
  nextId: () => nextId++,
};
