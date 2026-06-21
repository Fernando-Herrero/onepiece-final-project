export const profileKeys = {
  all: ['profile'] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
};
