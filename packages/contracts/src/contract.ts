import { oc } from '@orpc/contract';
import { authContract } from './features/auth/contract.js';
import { commentsContract } from './features/comments/contract.js';
import { postsContract } from './features/posts/contract.js';
import { usersContract } from './features/users/contract.js';

export const contract = oc.prefix('/api').router({
  auth: authContract,
  users: usersContract,
  posts: postsContract,
  comments: commentsContract,
});
