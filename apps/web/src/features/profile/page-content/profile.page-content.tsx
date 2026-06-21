import { Card, Grid, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { useAuthSession } from '@/features/auth/api/use-auth';
import { ProfileIdentityCard } from '@/features/profile/ui/profile-identity-card.component';

export default function ProfilePageContent() {
  const { t } = useTranslation();
  const { user } = useAuthSession();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('profile.title')}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {t('profile.subtitle')}
      </Text>

      <Grid columns={{ initial: '1', lg: '3' }} gap="6">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProfileIdentityCard user={user} />

          {/* 2E: progress · stats · posts tabs */}
        </div>

        <aside className="flex flex-col gap-6">
          <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Text as="p" size="2" weight="medium" className="text-[#f2d9a8]">
              {t('profile.sidebar_ranking_title')}
            </Text>
            <Text as="p" size="1" color="gray" mt="2">
              {t('profile.sidebar_ranking_soon')}
            </Text>
          </Card>
        </aside>
      </Grid>
    </div>
  );
}
