import mongoose, { type HydratedDocument, Schema, type Types } from 'mongoose';

type UserRole = 'user' | 'admin';

export type UserDoc = HydratedDocument<{
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  avatar?: string;
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
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}>;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true,
    },
    password: { type: String, required: true, select: false },
    displayName: { type: String },
    bio: { type: String, maxLength: 2000 },
    phoneNumber: { type: String },
    avatar: { type: String, default: '/pictures/user/default-avatar.png' },
    coverImage: { type: String },
    address: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    verified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    experience: { type: Number, default: 0 },
    serieProgress: {
      saga: { type: Number, default: 0 },
      arc: { type: Number, default: 0 },
      episode: { type: Number, default: 0 },
    },
    unlockedCards: {
      characters: { type: [Number], default: [] },
      items: { type: [Number], default: [] },
      fruits: { type: [Number], default: [] },
      swords: { type: [Number], default: [] },
      boats: { type: [Number], default: [] },
    },
    completedEpisodes: { type: [Number], default: [] },
    privacy: {
      showPosts: { type: Boolean, default: true },
      showLikes: { type: Boolean, default: true },
      showBookmarked: { type: Boolean, default: true },
      showComments: { type: Boolean, default: true },
    },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
      default: [],
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.virtual('fullName').get(function () {
  const doc = this as UserDoc;
  if (doc.firstName && doc.lastName) return `${doc.firstName} ${doc.lastName}`;
  return doc.displayName || doc.username;
});

export const User = mongoose.model<UserDoc>('users', userSchema);

export function serializeUser(user: UserDoc) {
  const doc = user.toObject({ virtuals: true });

  return {
    _id: user._id.toString(),
    username: doc.username,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    displayName: doc.displayName,
    bio: doc.bio,
    phoneNumber: doc.phoneNumber,
    avatar: doc.avatar,
    coverImage: doc.coverImage,
    address: doc.address,
    role: doc.role,
    verified: doc.verified,
    isActive: doc.isActive,
    experience: doc.experience,
    serieProgress: doc.serieProgress,
    unlockedCards: doc.unlockedCards,
    privacy: doc.privacy,
    followers: doc.followers.map(String),
    following: doc.following.map(String),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    fullName: doc.fullName,
  };
}

export function serializeUserSummary(user: UserDoc) {
  const doc = user.toObject({ virtuals: true });

  return {
    _id: user._id.toString(),
    username: doc.username,
    firstName: doc.firstName,
    lastName: doc.lastName,
    avatar: doc.avatar,
    displayName: doc.displayName,
    verified: doc.verified,
    bio: doc.bio,
    privacy: doc.privacy,
    role: doc.role,
    isActive: doc.isActive,
  };
}

export function serializeAuthorEmbed(author: UserDoc) {
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

export function requirePopulatedAuthor(
  author: UserDoc | Types.ObjectId,
): UserDoc {
  if (!('username' in author)) {
    throw new Error('Author must be populated before serialization');
  }

  return author;
}

export type { UserRole };
