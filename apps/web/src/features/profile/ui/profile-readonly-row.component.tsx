import { Flex, Text } from '@radix-ui/themes';

type ProfileReadonlyRowProps = {
  label: string;
  value: string;
  emptyText?: string;
};

export function ProfileReadonlyRow({
  label,
  value,
  emptyText,
}: ProfileReadonlyRowProps) {
  const display = value.trim();

  return (
    <Flex direction="column" gap="1">
      <Text as="span" size="1" color="gray">
        {label}
      </Text>
      {display ? (
        <Text as="p" size="2" className="text-[#f4ede1]/85">
          {display}
        </Text>
      ) : (
        <Text as="p" size="2" className="text-[#f4ede1]/50 italic">
          {emptyText ?? '—'}
        </Text>
      )}
    </Flex>
  );
}
