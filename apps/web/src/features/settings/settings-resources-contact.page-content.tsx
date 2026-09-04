import { Flex } from '@radix-ui/themes';

import { useAuthSession } from '@/features/auth/api/use-auth';
import { ContactForm } from '@/features/help/ui/contact-form.component';
import { SettingsPageShell } from '@/features/settings/settings-page-shell.component';

export default function SettingsResourcesContactPageContent() {
  const { user } = useAuthSession();

  return (
    <SettingsPageShell
      titleKey="settings.resources.contact_title"
      descriptionKey="settings.resources.contact_text"
      backHref="/dashboard/settings/resources"
      backLabelKey="settings.resources.back"
    >
      <Flex justify="center">
        {/* Con sesión ya sabemos quién escribe: no le pedimos otra vez sus datos. */}
        <ContactForm
          initialValues={{
            name: user?.firstName,
            surname: user?.lastName,
            email: user?.email,
          }}
        />
      </Flex>
    </SettingsPageShell>
  );
}
