import { Grid } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { CREW } from '@/features/help/help.constants';
import { CharacterCardComponent } from '@/features/landing/ui/character-card.component';
import { SettingsPageShell } from '@/features/settings/settings-page-shell.component';

export default function SettingsResourcesCharactersPageContent() {
  const { t } = useTranslation();

  return (
    <SettingsPageShell
      titleKey="settings.resources.characters_title"
      descriptionKey="settings.resources.characters_text"
      backHref="/dashboard/settings/resources"
      backLabelKey="settings.resources.back"
      wide
    >
      {/* Sin el scroll-trigger de la landing: aquí la tripulación es material
          de consulta, no una presentación. */}
      <Grid columns={{ initial: '1', sm: '2' }} gap="4" className="w-full">
        {CREW.map((character, index) => (
          <CharacterCardComponent
            key={character.name}
            name={character.name}
            text={t(`characters.${character.key}`)}
            images={character.images}
            isLast={index === CREW.length - 1}
          />
        ))}
      </Grid>
    </SettingsPageShell>
  );
}
