import { Badge, Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { VerifiedBadge } from '@/components/verified-badge/verified-badge.component';
import { resolveAvatarSrc } from '@/features/avatar/avatar.constants';
import { useSaveProfileField } from '@/features/profile/api/use-profile';
import type {
  ProfileUser,
  UpdateProfileBody,
} from '@/features/profile/profile.types';
import { ProfileAvatar } from '@/features/profile/ui/profile-avatar.component';
import { ProfileCover } from '@/features/profile/ui/profile-cover.component';
import { ProfileEditableField } from '@/features/profile/ui/profile-editable-field.component';
import { ProfileFollowButton } from '@/features/profile/ui/profile-follow-button.component';

import { ProfileViewMore } from './profile-view-more.component';

type EditableField = 'displayName' | 'bio' | 'coverImage';

type ProfileIdentityCardProps = {
  user: ProfileUser;
  isOwner: boolean;
  isFollowing: boolean;
};

export function ProfileIdentityCard({
  user,
  isOwner,
  isFollowing,
}: ProfileIdentityCardProps) {
  const { t } = useTranslation();
  const { save, isSaving } = useSaveProfileField(user._id);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const displayName = user.displayName?.trim() ?? '';
  const bio = user.bio?.trim() ?? '';
  const coverImage = user.coverImage?.trim() ?? '';

  function saveProfileField(body: UpdateProfileBody, field: EditableField) {
    void save(body, field, () => setEditingField(null));
  }

  return (
    <Card className="card overflow-hidden p-0">
      {/* `key`: con otra URL, ProfileCover vuelve a montarse y olvida el error de carga. */}
      <ProfileCover
        key={coverImage}
        value={coverImage}
        isOwner={isOwner}
        isEditing={editingField === 'coverImage'}
        isSaving={isSaving('coverImage')}
        onStartEdit={() => setEditingField('coverImage')}
        onCancel={() => setEditingField(null)}
        onSave={value =>
          saveProfileField({ coverImage: value.trim() || null }, 'coverImage')
        }
      />

      <Flex direction="column" gap="3" className="relative px-5 pt-0 pb-5">
        <ProfileAvatar
          key={resolveAvatarSrc(user.avatar)}
          user={user}
          isOwner={isOwner}
        />

        <Flex direction="column" gap="1" align="start">
          {isOwner ? (
            <ProfileEditableField
              value={displayName}
              emptyText={t('profile.empty_displayname')}
              placeholder={t('profile.display_name_placeholder')}
              prominent
              isEditing={editingField === 'displayName'}
              isSaving={isSaving('displayName')}
              onStartEdit={() => setEditingField('displayName')}
              onCancel={() => setEditingField(null)}
              onSave={value =>
                saveProfileField(
                  { displayName: value.trim() || null },
                  'displayName',
                )
              }
            />
          ) : (
            <Text
              as="p"
              size="5"
              weight="bold"
              className={
                displayName
                  ? 'text-foreground'
                  : 'text-foreground/50 text-base font-normal italic'
              }
            >
              {displayName || t('profile.empty_displayname_other')}
            </Text>
          )}
          <Flex align="center" gap="1">
            <Text as="p" size="2" color="gray">
              @{user.username}
            </Text>
            <VerifiedBadge verified={user.verified} />
          </Flex>
        </Flex>

        {isOwner ? (
          <ProfileEditableField
            value={bio}
            emptyText={t('profile.empty_bio')}
            placeholder={t('profile.bio_placeholder')}
            multiline
            isEditing={editingField === 'bio'}
            isSaving={isSaving('bio')}
            onStartEdit={() => setEditingField('bio')}
            onCancel={() => setEditingField(null)}
            onSave={value =>
              saveProfileField({ bio: value.trim() || null }, 'bio')
            }
          />
        ) : (
          <Text
            as="p"
            size="2"
            className={bio ? 'text-foreground/85' : 'text-foreground/50 italic'}
          >
            {bio || t('profile.empty_bio_other')}
          </Text>
        )}

        {!isOwner ? (
          <ProfileFollowButton userId={user._id} isFollowing={isFollowing} />
        ) : null}

        <ProfileViewMore user={user} isOwner={isOwner} />

        <Flex gap="2" wrap="wrap">
          <Badge color="orange" variant="soft">
            {t(`profile.role.${user.role}`)}
          </Badge>
          {user.verified ? (
            <Badge color="green" variant="soft">
              {t('profile.verified')}
            </Badge>
          ) : (
            <Badge color="brown" variant="soft">
              {t('profile.not_verified')}
            </Badge>
          )}
          <Badge color="gold" variant="soft">
            {t('profile.experience', { value: user.experience })}
          </Badge>
        </Flex>
      </Flex>
    </Card>
  );
}
