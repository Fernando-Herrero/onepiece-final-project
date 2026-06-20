import { Card, Flex, Heading, Text } from '@radix-ui/themes';

import { useTilt } from '@/features/landing/motion/use-tilt';

type CharacterCardProps = {
  name: string;
  text: string;
  images: readonly [string, string, string];
  isLast?: boolean;
};

export function CharacterCardComponent({
  name,
  text,
  images,
  isLast = false,
}: CharacterCardProps) {
  const tilt = useTilt(6);

  return (
    <Card
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="landing-card group flex w-full max-w-[300px] flex-col items-center overflow-hidden rounded-xl border border-[#f4ede1]/10 bg-linear-to-br from-[#1b2742]/70 to-[#0b1120]/75 backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:min-h-80 lg:max-w-full lg:flex-row lg:gap-4 lg:overflow-visible"
    >
      <div className="relative w-full lg:h-full lg:min-h-80 lg:rounded-tl-xl lg:rounded-bl-xl lg:bg-[#a64242]/25">
        <picture className="z-20 block h-full w-full transition-transform duration-300 group-hover:scale-105 lg:absolute lg:top-0 lg:left-3 lg:group-hover:scale-110">
          <source
            srcSet={images[2]}
            media="(min-width: 1024px)"
            type="image/webp"
          />
          <source
            srcSet={images[1]}
            media="(min-width: 700px)"
            type="image/webp"
          />
          <source
            srcSet={images[0]}
            media="(min-width: 400px)"
            type="image/webp"
          />
          <img
            src={images[0]}
            alt={name}
            className={`block max-h-40 w-full object-cover lg:h-full lg:max-h-none lg:min-w-50 lg:object-cover lg:object-[center_-5px] ${
              isLast ? 'object-[center_-4px]' : ''
            }`}
          />
        </picture>
      </div>

      <Flex direction="column" gap="2" className="px-6 pb-4 text-center lg:max-w-55 lg:justify-center lg:pr-8 lg:text-right">
        <Heading as="h2" size="4" className="font-road-captain tracking-wide text-[#f2d9a8]">
          {name}
        </Heading>
        <Text as="p" size="2" className="leading-relaxed text-[#f4ede1]/75 lg:pl-7">
          {text}
        </Text>
      </Flex>
    </Card>
  );
}
