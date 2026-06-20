import { oc } from '@orpc/contract';
import { healthContract } from './features/health/contract.js';
import { authContract } from './features/auth/contract.js';
import { cardsContract } from './features/cards/contract.js';
import { commentsContract } from './features/comments/contract.js';
import { notificationsContract } from './features/notifications/contract.js';
import { postsContract } from './features/posts/contract.js';
import { progressContract } from './features/progress/contract.js';
import { serieContract } from './features/serie/contract.js';
import { usersContract } from './features/users/contract.js';

export const contract = oc.prefix('/api').router({
  health: healthContract,
  auth: authContract,
  users: usersContract,
  posts: postsContract,
  comments: commentsContract,
  progress: progressContract,
  cards: cardsContract,
  notifications: notificationsContract,
  serie: serieContract,
});
