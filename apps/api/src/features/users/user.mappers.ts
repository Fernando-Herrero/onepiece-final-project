import {
  DEFAULT_USER_PREFERENCES,
  type userPreferencesSchema,
} from '@logpose/contracts/common/user.schemas';
import type { ObjectId, WithId } from 'mongodb';
import type * as z from 'zod/v4';

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export type UserRole = 'user' | 'admin';

export type UserDocument = {
  _id: ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  avatar: string;
  coverImage?: string;
  address?: string;
  role: UserRole;
  verified: boolean;
  isActive: boolean;
  experience: number;
  serieProgress: {
    saga: number;
    arc: number;
    episode: number;
  };
  unlockedCards: {
    characters: number[];
    items: number[];
    fruits: number[];
    swords: number[];
    boats: number[];
  };
  completedEpisodes: number[];
  privacy: {
    showPosts: boolean;
    showLikes: boolean;
    showBookmarked: boolean;
    showComments: boolean;
  };
  /** Opcional en Mongo: los usuarios creados antes de settings no lo tienen. */
  preferences?: UserPreferences;
  followers: ObjectId[];
  following: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Rellena las preferencias que falten con los valores por defecto, grupo a grupo.
 * Sin esto, un usuario antiguo (sin `preferences` en Mongo) rompería
 * `sessionUserSchema` al serializar.
 */
export function withPreferenceDefaults(
  preferences: Partial<UserPreferences> | undefined,
): UserPreferences {
  return {
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...preferences?.notifications,
    },
    timeline: {
      ...DEFAULT_USER_PREFERENCES.timeline,
      ...preferences?.timeline,
    },
    accessibility: {
      ...DEFAULT_USER_PREFERENCES.accessibility,
      ...preferences?.accessibility,
    },
  };
}

function fullName(
  doc: Pick<
    UserDocument,
    'firstName' | 'lastName' | 'displayName' | 'username'
  >,
) {
  if (doc.firstName && doc.lastName) {
    return `${doc.firstName} ${doc.lastName}`;
  }

  return doc.displayName || doc.username;
}

export function serializeUserProfile(user: WithId<UserDocument>) {
  return {
    _id: user._id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName ?? undefined,
    bio: user.bio ?? undefined,
    avatar: user.avatar,
    coverImage: user.coverImage ?? undefined,
    role: user.role,
    verified: user.verified,
    isActive: user.isActive,
    experience: user.experience,
    serieProgress: user.serieProgress,
    unlockedCards: user.unlockedCards,
    privacy: user.privacy,
    followers: user.followers.map(String),
    following: user.following.map(String),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
    fullName: fullName(user),
  };
}

export function serializeSessionUser(user: WithId<UserDocument>) {
  return {
    ...serializeUserProfile(user),
    email: user.email,
    phoneNumber: user.phoneNumber ?? undefined,
    address: user.address ?? undefined,
    preferences: withPreferenceDefaults(user.preferences),
  };
}

export function serializeUserSummary(user: WithId<UserDocument>) {
  return {
    _id: user._id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    displayName: user.displayName ?? undefined,
    verified: user.verified,
    bio: user.bio ?? undefined,
    role: user.role,
    isActive: user.isActive,
  };
}

export function serializeUserRankingEntry(user: WithId<UserDocument>) {
  return {
    _id: user._id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    displayName: user.displayName ?? undefined,
    verified: user.verified,
    isActive: user.isActive,
    experience: user.experience,
  };
}

export function serializeAuthorEmbed(author: WithId<UserDocument>) {
  return {
    _id: author._id.toString(),
    username: author.username,
    firstName: author.firstName,
    lastName: author.lastName,
    avatar: author.avatar,
    displayName: author.displayName,
    verified: author.verified,
  };
}
