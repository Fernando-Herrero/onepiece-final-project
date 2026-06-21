import { AVATAR_OPTIONS } from '@logpose/contracts/common/avatar.schemas';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  type UpdateProfileBody,
  useSaveProfileField,
} from '@/features/profile/api/use-profile';
import { ProfileAvatarPickerOverlay } from '@/features/profile/ui/profile-avatar-picker-overlay.component';
import {
  ProfileEditableField,
  profileFieldClassName,
} from '@/features/profile/ui/profile-editable-field.component';
import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

import { ProfileViewMore } from './profile-view-more.component';

const DEFAULT_AVATAR_SRC =
  AVATAR_OPTIONS.find(option => option.id === 'luffy')?.path ??
  '/avatars/luffy/luffy-happy-400.webp';

const avatarFallback = (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={DEFAULT_AVATAR_SRC} alt="" className="size-full object-cover" />
);

type EditableField = 'displayName' | 'bio' | 'coverImage';

type ProfileIdentityCardProps = {
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    address?: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
    verified: boolean;
    experience: number;
    isActive: boolean;
    createdAt?: string;
    serieProgress: {
      saga: number;
      arc: number;
      episode: number;
    };
  };
};

export function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const { t } = useTranslation();
  const { save, isSaving } = useSaveProfileField(user._id);
  const [coverLoadError, setCoverLoadError] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [coverDraft, setCoverDraft] = useState('');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const displayName = user.displayName?.trim() ?? '';
  const bio = user.bio?.trim() ?? '';
  const coverImage = user.coverImage?.trim() ?? '';
  const hasCoverImage = !!coverImage && !coverLoadError;
  const isEditingCover = editingField === 'coverImage';
  const resolvedAvatar = user.avatar?.trim() || DEFAULT_AVATAR_SRC;
  const avatarSrc = avatarLoadError ? DEFAULT_AVATAR_SRC : resolvedAvatar;

  const { saga, arc, episode } = user.serieProgress;
  const hasSerieProgress = saga > 0 && arc > 0 && episode > 0;

  const sagasQuery = useQuery({
    ...allQueriesOptions.serie.sagas(),
    enabled: hasSerieProgress,
  });
  const arcsQuery = useQuery({
    ...allQueriesOptions.serie.arcsBySaga(saga),
    enabled: hasSerieProgress,
  });

  const sagaName = sagasQuery.data?.sagas.find(item => item.id === saga)?.name;
  const arcName = arcsQuery.data?.arcs.find(item => item.id === arc)?.name;

  const progressLabel: string = hasSerieProgress
    ? [
        sagaName ?? t('profile.progress_saga_fallback', { id: saga }),
        arcName ?? t('profile.progress_arc_fallback', { id: arc }),
        t('serie.episode_number', { number: episode }),
      ].join(' · ')
    : t('profile.progress_empty');

  async function saveProfileField(
    body: UpdateProfileBody,
    field: EditableField,
  ) {
    await save(body, field, () => {
      setEditingField(null);
      if ('coverImage' in body) {
        setCoverLoadError(false);
      }
    });
  }

  function startCoverEdit() {
    setCoverDraft(coverImage);
    setEditingField('coverImage');
  }

  function saveCover() {
    void saveProfileField(
      { coverImage: coverDraft.trim() || undefined },
      'coverImage',
    );
  }

  return (
    <>
      <Card className="overflow-hidden border border-[#f2d9a8]/15 bg-[#05070d]/50 p-0">
        <Box
          position="relative"
          className="group h-32 w-full overflow-hidden bg-linear-to-r from-[#1a0f05] via-[#3d2010] to-[#0b1120]"
        >
          {isEditingCover ? (
            <Flex
              direction="column"
              gap="2"
              justify="center"
              className="absolute inset-0 bg-[#0b1120]/92 p-4"
            >
              <TextField.Root
                className={profileFieldClassName}
                value={coverDraft}
                placeholder={t('profile.input_cover_image')}
                autoFocus
                onChange={event => setCoverDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    saveCover();
                  }
                  if (event.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
              />
              <Flex gap="2" justify="end">
                <Button
                  type="button"
                  size="1"
                  color="orange"
                  disabled={isSaving('coverImage')}
                  onClick={saveCover}
                >
                  {isSaving('coverImage')
                    ? t('profile.saving')
                    : t('profile.save_button')}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  disabled={isSaving('coverImage')}
                  onClick={() => setEditingField(null)}
                >
                  {t('profile.cancel')}
                </Button>
              </Flex>
            </Flex>
          ) : (
            <>
              {hasCoverImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- cover URL libre del usuario */}
                  <img
                    src={coverImage}
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                    onError={() => setCoverLoadError(true)}
                  />
                  <Box
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0b1120]/70 via-[#3d2010]/20 to-[#1a0f05]/30"
                    aria-hidden
                  />
                </>
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  className="absolute inset-0 px-6 text-center"
                >
                  <Text as="p" size="2" className="text-[#f4ede1]/45 italic">
                    {t('profile.cover_empty_hint')}
                  </Text>
                </Flex>
              )}
              <Flex
                align="center"
                justify="center"
                className="pointer-events-none absolute inset-0 z-10 bg-[#0b1120]/0 opacity-0 transition duration-200 group-hover:bg-[#0b1120]/50 group-hover:opacity-100"
              >
                <Text
                  as="span"
                  size="2"
                  weight="medium"
                  className="text-[#f2d9a8]"
                >
                  {t('profile.change_cover_img')}
                </Text>
              </Flex>
              <Button
                type="button"
                variant="ghost"
                color="gray"
                aria-label={t('profile.change_cover_img')}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer rounded-none hover:bg-transparent active:bg-transparent"
                onClick={startCoverEdit}
              />
            </>
          )}
        </Box>

        <Flex direction="column" gap="3" className="relative px-5 pt-0 pb-5">
          <Box position="relative" className="z-50 -mt-10 w-fit">
            <Tooltip content={t('profile.change_avatar')}>
              <Button
                type="button"
                variant="ghost"
                color="gray"
                aria-label={t('profile.change_avatar')}
                className="h-auto cursor-pointer rounded-full p-0 hover:bg-transparent active:bg-transparent"
                onClick={() => {
                  setAvatarLoadError(false);
                  setAvatarPickerOpen(true);
                }}
              >
                <Avatar
                  key={resolvedAvatar}
                  src={avatarSrc}
                  fallback={avatarFallback}
                  size="6"
                  radius="full"
                  className="border-4 border-[#0b1120]"
                  onLoadingStatusChange={status => {
                    if (status === 'error') {
                      setAvatarLoadError(true);
                    }
                  }}
                />
              </Button>
            </Tooltip>
            <Box
              position="absolute"
              className={`right-0.5 bottom-0.5 size-4 rounded-full border-[3px] border-[#0b1120] shadow-[0_0_0_1px_rgba(242,217,168,0.35)] ${
                user.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}
              aria-label={
                user.isActive
                  ? t('profile.status_online')
                  : t('profile.status_offline')
              }
            />
          </Box>

          <Flex direction="column" gap="1" align="start">
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
                void saveProfileField(
                  { displayName: value.trim() || undefined },
                  'displayName',
                )
              }
            />
            <Text as="p" size="2" color="gray">
              @{user.username}
            </Text>
          </Flex>

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
              void saveProfileField({ bio: value.trim() || undefined }, 'bio')
            }
          />

          <ProfileViewMore user={user} />

          <Link
            href="/dashboard/serie"
            className="block rounded-md border border-[#f2d9a8]/10 bg-[#05070d]/40 px-3 py-2 transition hover:border-[#f2d9a8]/25 hover:bg-[#05070d]/60"
          >
            <Text as="p" size="1" color="gray" mb="1">
              {t('profile.progress_label')}
            </Text>
            <Text
              as="p"
              size="2"
              className={
                hasSerieProgress
                  ? 'text-[#f2d9a8]/90'
                  : 'text-[#f4ede1]/50 italic'
              }
            >
              {progressLabel}
            </Text>
          </Link>

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

      {avatarPickerOpen ? (
        <ProfileAvatarPickerOverlay
          key={resolvedAvatar}
          userId={user._id}
          currentAvatar={resolvedAvatar}
          serieProgress={user.serieProgress}
          onClose={() => setAvatarPickerOpen(false)}
          onSaved={() => {
            setAvatarLoadError(false);
            setAvatarPickerOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
