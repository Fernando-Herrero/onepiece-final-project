import type { ObjectId, WithId } from 'mongodb';

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
  followers: ObjectId[];
  following: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

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

export function serializeUser(user: WithId<UserDocument>) {
  return {
    _id: user._id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    displayName: user.displayName ?? undefined,
    bio: user.bio ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    avatar: user.avatar,
    coverImage: user.coverImage ?? undefined,
    address: user.address ?? undefined,
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
    privacy: user.privacy,
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
