import type { IconProps } from '@phosphor-icons/react';
import {
  BellIcon,
  BookmarkSimpleIcon,
  CardsIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChatCircleIcon,
  ChatsCircleIcon,
  GearSixIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  RepeatIcon,
  ShieldIcon,
  TelevisionIcon,
  UserIcon,
} from '@phosphor-icons/react';

export const Icon = {
  CaretDown: (p: IconProps) => <CaretDownIcon size={14} weight="bold" {...p} />,
  CaretLeft: (p: IconProps) => <CaretLeftIcon size={14} weight="bold" {...p} />,
  CaretRight: (p: IconProps) => (
    <CaretRightIcon size={14} weight="bold" {...p} />
  ),
  User: (p: IconProps) => <UserIcon size={18} {...p} />,
  Community: (p: IconProps) => <ChatsCircleIcon size={18} {...p} />,
  Serie: (p: IconProps) => <TelevisionIcon size={18} {...p} />,
  Cards: (p: IconProps) => <CardsIcon size={18} {...p} />,
  Search: (p: IconProps) => <MagnifyingGlassIcon size={18} {...p} />,
  Bell: (p: IconProps) => <BellIcon size={18} {...p} />,
  Settings: (p: IconProps) => <GearSixIcon size={18} {...p} />,
  Admin: (p: IconProps) => <ShieldIcon size={18} {...p} />,
  Heart: (p: IconProps) => <HeartIcon size={16} {...p} />,
  HeartFill: (p: IconProps) => <HeartIcon size={16} weight="fill" {...p} />,
  Bookmark: (p: IconProps) => <BookmarkSimpleIcon size={16} {...p} />,
  BookmarkFill: (p: IconProps) => (
    <BookmarkSimpleIcon size={16} weight="fill" {...p} />
  ),
  Comment: (p: IconProps) => <ChatCircleIcon size={16} {...p} />,
  Repeat: (p: IconProps) => <RepeatIcon size={16} {...p} />,
  RepeatFill: (p: IconProps) => <RepeatIcon size={16} weight="fill" {...p} />,
} as const;

export type DashboardNavIcon = keyof Pick<
  typeof Icon,
  | 'User'
  | 'Community'
  | 'Serie'
  | 'Cards'
  | 'Search'
  | 'Bell'
  | 'Settings'
  | 'Admin'
>;
