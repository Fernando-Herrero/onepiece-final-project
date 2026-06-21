import { Badge, Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

type ProfileIdentityCardProps = {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    fullName?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    role: 'user' | 'admin';
    verified: boolean;
    experience: number;
    isActive: boolean;
  };
};

export function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const { t } = useTranslation();

  const displayName =
    user.displayName?.trim() ||
    user.fullName?.trim() ||
    `${user.firstName} ${user.lastName}`.trim();

  return (
    <Card className="overflow-hidden border border-[#f2d9a8]/15 bg-[#05070d]/50 p-0">
      <div className="relative h-32 w-full overflow-hidden bg-linear-to-r from-[#1a0f05] via-[#3d2010] to-[#0b1120]">
        {user.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.coverImage}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        ) : null}
      </div>

      <Flex direction="column" gap="3" className="relative px-5 pt-0 pb-5">
        <div className="-mt-10">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt=""
              className="size-20 rounded-full border-4 border-[#0b1120] object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-[#0b1120] bg-[#f2d9a8]/15 text-3xl">
              👤
            </div>
          )}
        </div>

        <div>
          <Text as="p" size="5" weight="bold" className="text-[#f4ede1]">
            {displayName}
          </Text>
          <Text as="p" size="2" color="gray">
            @{user.username}
          </Text>
        </div>

        {user.bio ? (
          <Text as="p" size="2" className="text-[#f4ede1]/85">
            {user.bio}
          </Text>
        ) : (
          <Text as="p" size="2" color="gray">
            {t('profile.empty_bio')}
          </Text>
        )}

        <Flex gap="2" wrap="wrap">
          <Badge color="orange" variant="soft">
            {t(`profile.role.${user.role}`)}
          </Badge>
          {user.verified ? (
            <Badge color="green" variant="soft">
              {t('profile.verified')}
            </Badge>
          ) : null}
          <Badge color="gray" variant="soft">
            {user.isActive
              ? t('profile.status_online')
              : t('profile.status_offline')}
          </Badge>
          <Badge color="amber" variant="soft">
            {t('profile.experience', { value: user.experience })}
          </Badge>
        </Flex>
      </Flex>
    </Card>
  );
}
