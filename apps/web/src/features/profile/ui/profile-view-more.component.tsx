import { Button, Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  type UpdateProfileBody,
  useUpdateProfileMutation,
} from '@/features/profile/api/use-update-profile';
import { ProfileEditableField } from '@/features/profile/ui/profile-editable-field.component';
import { ProfileReadonlyRow } from '@/features/profile/ui/profile-readonly-row.component';

type EditableField = 'address' | 'phoneNumber';

type ProfileViewMoreProps = {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    address?: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
    createdAt?: string;
  };
};

export function ProfileViewMore({ user }: ProfileViewMoreProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfileMutation();
  const [open, setOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const fullName =
    user.fullName?.trim() || `${user.firstName} ${user.lastName}`.trim();
  const address = user.address?.trim() ?? '';
  const phoneNumber = user.phoneNumber?.trim() ?? '';
  const createdAtLabel = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '';

  async function saveField(body: UpdateProfileBody) {
    try {
      await updateProfile.mutateAsync({ userId: user._id, body });
      toast.success(t('profile.save_success'));
      setEditingField(null);
    } catch {
      toast.error(t('profile.save_error'));
    }
  }

  return (
    <Card className="border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
      <Button
        type="button"
        variant="ghost"
        color="gray"
        highContrast
        className="-m-0.5 mb-0 flex h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent active:bg-transparent"
        onClick={() => setOpen(current => !current)}
      >
        <Text as="span" size="2" weight="medium" className="text-[#f2d9a8]">
          {open ? t('profile.view_less') : t('profile.view_more')}
        </Text>
        <Text as="span" size="2" color="gray" aria-hidden>
          {open ? '▲' : '▼'}
        </Text>
      </Button>

      {open ? (
        <Flex direction="column" gap="4" mt="4">
          <ProfileReadonlyRow
            label={t('profile.full_name_label')}
            value={fullName}
          />
          <ProfileReadonlyRow
            label={t('profile.email_label')}
            value={user.email}
            emptyText={t('profile.empty_email')}
          />

          <Flex direction="column" gap="1">
            <Text as="span" size="1" color="gray">
              {t('profile.address_label')}
            </Text>
            <ProfileEditableField
              value={address}
              emptyText={t('profile.input_address')}
              placeholder={t('profile.input_address')}
              isEditing={editingField === 'address'}
              isSaving={updateProfile.isPending}
              onStartEdit={() => setEditingField('address')}
              onCancel={() => setEditingField(null)}
              onSave={value =>
                void saveField({
                  address: value.trim() || undefined,
                })
              }
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="span" size="1" color="gray">
              {t('profile.phone_label')}
            </Text>
            <ProfileEditableField
              value={phoneNumber}
              emptyText={t('profile.phone_placeholder')}
              placeholder={t('profile.phone_placeholder')}
              isEditing={editingField === 'phoneNumber'}
              isSaving={updateProfile.isPending}
              onStartEdit={() => setEditingField('phoneNumber')}
              onCancel={() => setEditingField(null)}
              onSave={value =>
                void saveField({
                  phoneNumber: value.trim() || undefined,
                })
              }
            />
          </Flex>

          <ProfileReadonlyRow
            label={t('profile.role_label')}
            value={t(`profile.role.${user.role}`)}
          />
          <ProfileReadonlyRow
            label={t('profile.created_at_label')}
            value={createdAtLabel}
          />
        </Flex>
      ) : null}
    </Card>
  );
}
