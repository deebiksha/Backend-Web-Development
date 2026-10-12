
const postsRepo = require('./../repository/postsRepo');
const commentsRepo = require('./../repository/commentsRepo');
const AppError = require('./../utils/AppError');

exports.addComment = async (postId, userId, body) => {
  const id = Number(postId);
  const post = await postsRepo.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.locked) {
    throw new AppError('Post is locked for new comments', 409);
  }

  const comment = await commentsRepo.insert({
    postId: id,
    authorId: Number(userId),
    body,
  });

  await postsRepo.incrementCommentCount(id);

  return comment;
};
