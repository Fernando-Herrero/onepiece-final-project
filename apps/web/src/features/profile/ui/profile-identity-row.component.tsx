import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import type { ProfileUser } from '@/features/profile/profile.types';
import { ProfileCollectionTeaser } from '@/features/profile/ui/profile-collection-teaser.component';
import { ProfileFollowCountsCard } from '@/features/profile/ui/profile-follow-counts-card.component';
import { ProfileIdentityCard } from '@/features/profile/ui/profile-identity-card.component';

type ProfileIdentityRowProps = {
  user: ProfileUser;
};

export function ProfileIdentityRow({ user }: ProfileIdentityRowProps) {
  const identityRef = useRef<HTMLDivElement>(null);
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const [identityHeight, setIdentityHeight] = useState<number>();
  const [frozenSideHeight, setFrozenSideHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = identityRef.current;
    if (!el || viewMoreOpen) {
      return;
    }

    const syncHeight = () => {
      setIdentityHeight(el.offsetHeight);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMoreOpen, user]);

  function handleViewMoreOpenChange(open: boolean) {
    if (open && identityRef.current) {
      setFrozenSideHeight(identityRef.current.offsetHeight);
    }
    setViewMoreOpen(open);
  }

  const sideColumnHeight = viewMoreOpen ? frozenSideHeight : identityHeight;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      <div ref={identityRef}>
        <ProfileIdentityCard
          user={user}
          viewMoreOpen={viewMoreOpen}
          onViewMoreOpenChange={handleViewMoreOpenChange}
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-6${
          sideColumnHeight
            ? ' lg:h-[var(--profile-side-height)] lg:max-h-[var(--profile-side-height)]'
            : ''
        }`}
        style={
          sideColumnHeight
            ? ({
                '--profile-side-height': `${sideColumnHeight}px`,
              } as CSSProperties)
            : undefined
        }
      >
        <ProfileFollowCountsCard
          className="max-lg:h-fit max-lg:self-start lg:min-h-0 lg:flex-1"
          followersCount={user.followers.length}
          followingCount={user.following.length}
        />
        <ProfileCollectionTeaser
          className="max-lg:h-fit max-lg:self-start lg:min-h-0 lg:flex-1"
          unlockedCards={user.unlockedCards}
        />
      </div>
    </div>
  );
}
