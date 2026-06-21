import {
  getProfileAvatarPickerOptions,
  getRegisterAvatarPickerOptions,
  type SerieProgress,
} from '@logpose/contracts/common/avatar.schemas';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

type AvatarPickerComponentProps = {
  value: string;
  onChange: (path: string) => void;
  error?: string;
  /** Register: omit. Profile: pass user serieProgress (+ current avatar preserved internally). */
  serieProgress?: SerieProgress;
};

export function AvatarPickerComponent({
  value,
  onChange,
  error,
  serieProgress,
}: AvatarPickerComponentProps) {
  const { t } = useTranslation();

  const options =
    serieProgress === undefined
      ? getRegisterAvatarPickerOptions()
      : getProfileAvatarPickerOptions(serieProgress, value);

  return (
    <Flex
      direction="column"
      gap="3"
      width="100%"
      maxWidth="28rem"
      px="2"
      mt="4"
    >
      <Flex direction="column" gap="1" align="center">
        <Text as="p" size="2" weight="medium" className="text-[#f4ede1]/90">
          {t('avatar.pick_title')}
        </Text>
        <Text as="p" size="1" color="gray">
          {t('avatar.pick_hint')}
        </Text>
      </Flex>

      <Flex wrap="wrap" align="start" justify="center" gap="3">
        {options.map(option => {
          const selected = value === option.path;

          return (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              color={selected ? 'orange' : 'gray'}
              highContrast={selected}
              aria-label={t(`avatar.characters.${option.id}`)}
              aria-pressed={selected}
              onClick={() => onChange(option.path)}
              className="h-auto cursor-pointer flex-col gap-1.5 p-1 hover:bg-transparent active:bg-transparent"
            >
              <Box
                className={`group relative size-[60px] overflow-hidden rounded-full shadow-md transition-transform duration-300 hover:-translate-y-1 hover:scale-110 ${
                  selected ? 'scale-110 ring-4 ring-[#f97316]' : 'ring-0'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={option.previewPath}
                  alt=""
                  width={60}
                  height={60}
                  className="block size-full object-cover"
                />
                <Box
                  className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    selected ? 'opacity-100' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={option.path}
                    alt=""
                    width={60}
                    height={60}
                    className="block size-full object-cover"
                  />
                </Box>
              </Box>
              <Text
                as="span"
                size="1"
                weight="bold"
                className={`text-[#f2d9a8] ${selected ? 'pt-1' : ''}`}
              >
                {t(`avatar.characters.${option.id}`)}
              </Text>
            </Button>
          );
        })}
      </Flex>

      {error ? (
        <Text as="p" size="1" color="red" align="center">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}
