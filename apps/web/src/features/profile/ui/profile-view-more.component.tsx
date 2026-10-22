import { Button, Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { useSaveProfileField } from '@/features/profile/api/use-profile';
import { getUserDisplayName } from '@/features/profile/profile.constants';
import type { ProfileUser } from '@/features/profile/profile.types';
import { ProfileEditableField } from '@/features/profile/ui/profile-editable-field.component';
import { ProfileReadonlyRow } from '@/features/profile/ui/profile-readonly-row.component';

type EditableField = 'address' | 'phoneNumber';

type ProfileViewMoreProps = {
  user: ProfileUser;
  isOwner?: boolean;
};

export function ProfileViewMore({
  user,
  isOwner = true,
}: ProfileViewMoreProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const fullName = user.fullName?.trim() || getUserDisplayName(user);
  const createdAtLabel = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(i18n.language)
    : '';

  return (
    <Card className="card p-4">
      <Button
        type="button"
        variant="ghost"
        color="gray"
        highContrast
        className="flex h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent active:bg-transparent"
        onClick={() => setOpen(current => !current)}
      >
        <Text as="span" size="2" weight="medium" className="text-highlight">
          {open ? t('profile.view_less') : t('profile.view_more')}
        </Text>
        <Text as="span" size="2" color="gray" aria-hidden>
          {open ? '▲' : '▼'}
        </Text>
      </Button>

      {open ? (
        <Flex
          direction="column"
          gap="4"
          mt="4"
          className="motion-safe:animate-[profile-fade-up_0.5s_ease-out_both]"
        >
          <ProfileReadonlyRow
            label={t('profile.full_name_label')}
            value={fullName}
          />

          {user.access === 'full' ? (
            <ProfilePrivateRows user={user} isOwner={isOwner} />
          ) : null}

          <ProfileReadonlyRow
            label={t('profile.created_at_label')}
            value={createdAtLabel}
          />
        </Flex>
      ) : null}
    </Card>
  );
}

type ProfilePrivateRowsProps = {
  user: Extract<ProfileUser, { access: 'full' }>;
  isOwner: boolean;
};

/** Solo llegan con `access: 'full'`; editables únicamente para el dueño. */
function ProfilePrivateRows({ user, isOwner }: ProfilePrivateRowsProps) {
  const { t } = useTranslation();
  const { save, isSaving } = useSaveProfileField(user._id);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const address = user.address?.trim() ?? '';
  const phoneNumber = user.phoneNumber?.trim() ?? '';

  return (
    <>
      <ProfileReadonlyRow
        label={t('profile.email_label')}
        value={user.email}
        emptyText={t('profile.empty_email')}
      />

      {isOwner ? (
        <Flex direction="column" gap="1">
          <Text as="span" size="1" color="gray">
            {t('profile.address_label')}
          </Text>
          <ProfileEditableField
            value={address}
            emptyText={t('profile.input_address')}
            placeholder={t('profile.input_address')}
            isEditing={editingField === 'address'}
            isSaving={isSaving('address')}
            onStartEdit={() => setEditingField('address')}
            onCancel={() => setEditingField(null)}
            onSave={value =>
              void save({ address: value.trim() || null }, 'address', () =>
                setEditingField(null),
              )
            }
          />
        </Flex>
      ) : (
        <ProfileReadonlyRow
          label={t('profile.address_label')}
          value={address}
          emptyText={t('profile.empty_address_other')}
        />
      )}

      {isOwner ? (
        <Flex direction="column" gap="1">
          <Text as="span" size="1" color="gray">
            {t('profile.phone_label')}
          </Text>
          <ProfileEditableField
            value={phoneNumber}
            emptyText={t('profile.phone_placeholder')}
            placeholder={t('profile.phone_placeholder')}
            isEditing={editingField === 'phoneNumber'}
            isSaving={isSaving('phoneNumber')}
            onStartEdit={() => setEditingField('phoneNumber')}
            onCancel={() => setEditingField(null)}
            onSave={value =>
              void save(
                { phoneNumber: value.trim() || null },
                'phoneNumber',
                () => setEditingField(null),
              )
            }
          />
        </Flex>
      ) : (
        <ProfileReadonlyRow
          label={t('profile.phone_label')}
          value={phoneNumber}
          emptyText={t('profile.empty_phone_other')}
        />
      )}
    </>
  );
}
