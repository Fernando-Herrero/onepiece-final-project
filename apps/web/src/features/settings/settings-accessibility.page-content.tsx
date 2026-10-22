import { Flex, SegmentedControl, Switch, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';
import { SettingsPageShell } from '@/features/settings/settings-page-shell.component';
import { useSettingsPreferences } from '@/features/settings/use-settings-preferences';

const FONT_SCALES = ['sm', 'md', 'lg'] as const;

export default function SettingsAccessibilityPageContent() {
  const { t } = useTranslation();
  const { preferences, savePreference, isSaving } = useSettingsPreferences();

  if (!preferences) {
    return null;
  }

  const { accessibility } = preferences;

  return (
    <SettingsPageShell
      titleKey="settings.title_accessibility"
      descriptionKey="settings.accessibility.description"
    >
      <Flex direction="column" gap="5">
        <Flex align="center" justify="between" gap="4">
          <Flex direction="column" gap="1">
            <Text as="p" size="2" className="text-foreground/85">
              {t('settings.accessibility.language')}
            </Text>
            <Text as="p" size="1" className="text-foreground/50">
              {t('settings.accessibility.language_hint')}
            </Text>
          </Flex>
          <LandingLocaleToggleComponent />
        </Flex>

        <Flex direction="column" gap="2">
          <Text as="p" size="2" className="text-foreground/85">
            {t('settings.accessibility.font_scale')}
          </Text>
          <SegmentedControl.Root
            value={accessibility.fontScale}
            onValueChange={value => {
              if (value) {
                savePreference('accessibility', {
                  fontScale: value as (typeof FONT_SCALES)[number],
                });
              }
            }}
          >
            {FONT_SCALES.map(scale => (
              <SegmentedControl.Item key={scale} value={scale}>
                {t(`settings.accessibility.font_scale_${scale}`)}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </Flex>

        <Flex align="start" justify="between" gap="4">
          <Flex direction="column" gap="1">
            <Text as="label" size="2" className="text-foreground/85">
              {t('settings.accessibility.reduce_motion')}
            </Text>
            <Text as="p" size="1" className="text-foreground/50">
              {t('settings.accessibility.reduce_motion_hint')}
            </Text>
          </Flex>
          <Switch
            checked={accessibility.reduceMotion}
            disabled={isSaving}
            onCheckedChange={checked =>
              savePreference('accessibility', { reduceMotion: checked })
            }
          />
        </Flex>

        <Flex align="start" justify="between" gap="4">
          <Flex direction="column" gap="1">
            <Text as="label" size="2" className="text-foreground/85">
              {t('settings.accessibility.high_contrast')}
            </Text>
            <Text as="p" size="1" className="text-foreground/50">
              {t('settings.accessibility.high_contrast_hint')}
            </Text>
          </Flex>
          <Switch
            checked={accessibility.highContrast}
            disabled={isSaving}
            onCheckedChange={checked =>
              savePreference('accessibility', { highContrast: checked })
            }
          />
        </Flex>
      </Flex>
    </SettingsPageShell>
  );
}
