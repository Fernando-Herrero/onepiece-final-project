import { Card, Flex, Skeleton } from '@radix-ui/themes';

export function PostCardSkeleton() {
  return (
    <Card className="border border-[#f2d9a8]/10 bg-[#05070d]/40 p-4">
      <Flex gap="3" align="start">
        <Skeleton
          width="32px"
          height="32px"
          className="shrink-0 rounded-full"
        />

        <Flex direction="column" gap="2" className="min-w-0 flex-1">
          <Flex direction="column" gap="1">
            <Skeleton height="14px" width="40%" />
            <Skeleton height="12px" width="55%" />
          </Flex>
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="88%" />
          <Flex gap="3">
            <Skeleton height="12px" width="48px" />
            <Skeleton height="12px" width="64px" />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}

export function PostFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Flex direction="column" gap="3">
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </Flex>
  );
}
