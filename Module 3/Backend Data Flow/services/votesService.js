
const postsRepo = require('./../repository/postsRepo');
const votesRepo = require('./../repository/votesRepo');
const AppError = require('./../utils/AppError');

exports.castVote = async (postId, userId) => {
  const id = Number(postId);
  const post = await postsRepo.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const existingVote = await votesRepo.find(id, Number(userId));

  if (existingVote) {
    throw new AppError('You have already voted on this post', 409);
  }

  return votesRepo.insert(id, Number(userId));
};

exports.countFor = async (postId) =>
  votesRepo.countByPost(Number(postId));
