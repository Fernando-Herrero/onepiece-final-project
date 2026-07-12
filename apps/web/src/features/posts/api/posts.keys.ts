export const postsKeys = {
  all: ['posts'] as const,
  feed: () => [...postsKeys.all, 'feed'] as const,
};
