import mongoose, { type HydratedDocument, Schema, type Types } from 'mongoose';

import type { UserDoc } from '../users/user.model.js';

export type PostDoc = HydratedDocument<{
  _id: Types.ObjectId;
  text: string;
  userId: Types.ObjectId;
  images?: string[];
  visibility: 'public' | 'private' | 'followers';
  isDeleted: boolean;
  shareToken?: string;
  isRetweet: boolean;
  isReply: boolean;
  isPinned: boolean;
  language: string;
  likes: Types.ObjectId[];
  bookmarks: Types.ObjectId[];
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  retweetsCount: number;
  hashtags: string[];
  mentions: string[];
  retweets: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}>;

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    images: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ['public', 'private', 'followers'],
      default: 'public',
    },
    shareToken: { type: String },
    isRetweet: { type: Boolean, default: false },
    isReply: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    language: { type: String, default: 'es' },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
      default: [],
    },
    bookmarks: {
      type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
      default: [],
    },
    likesCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    retweetsCount: { type: Number, default: 0 },
    hashtags: { type: [String], default: [] },
    mentions: { type: [String], default: [] },
    retweets: {
      type: [{ type: Schema.Types.ObjectId, ref: 'posts' }],
      default: [],
    },
  },
  { timestamps: true },
);

export const Post = mongoose.model<PostDoc>('posts', postSchema);

export const POST_AUTHOR_SELECT =
  'username firstName lastName avatar displayName verified';

export const POST_AUTHOR_POPULATE = {
  path: 'userId',
  select: POST_AUTHOR_SELECT,
} as const;

export const PUBLIC_POST_FILTER = {
  visibility: 'public' as const,
  isDeleted: false,
};

export async function findActivePostById(id: string) {
  return Post.findOne({ _id: id, isDeleted: false });
}

export function getTextMaxLength(verified: boolean) {
  return verified ? 600 : 280;
}

export function assertTextLength(text: string, verified: boolean) {
  const max = getTextMaxLength(verified);
  if (text.length > max) {
    return `El texto no puede superar ${max} caracteres`;
  }
  return null;
}

export async function togglePostField(
  postId: string,
  userId: Types.ObjectId,
  field: 'likes' | 'bookmarks',
) {
  const post = await findActivePostById(postId);
  if (!post) {
    return null;
  }

  const countField = `${field}Count` as 'likesCount' | 'bookmarksCount';
  const alreadyHad = post[field].some(id => id.equals(userId));

  const updated = await Post.findByIdAndUpdate(
    postId,
    alreadyHad
      ? { $pull: { [field]: userId }, $inc: { [countField]: -1 } }
      : { $addToSet: { [field]: userId }, $inc: { [countField]: 1 } },
    { new: true },
  );

  return { updated, alreadyHad };
}

function serializePostAuthor(author: UserDoc) {
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

function getPopulatedAuthor(post: PostDoc): UserDoc {
  const author = post.userId as UserDoc | Types.ObjectId;

  if (!('username' in author)) {
    throw new Error('Post author must be populated before serialization');
  }

  return author;
}

export function serializePost(post: PostDoc, viewerId?: string) {
  const author = getPopulatedAuthor(post);

  const doc = post.toObject();

  return {
    _id: post._id.toString(),
    text: doc.text,
    userId: serializePostAuthor(author),
    images: doc.images,
    visibility: doc.visibility,
    isDeleted: doc.isDeleted,
    shareToken: doc.shareToken,
    isRetweet: doc.isRetweet,
    isReply: doc.isReply,
    isPinned: doc.isPinned,
    language: doc.language,
    likes: doc.likes.map(String),
    bookmarks: doc.bookmarks.map(String),
    likesCount: doc.likesCount,
    bookmarksCount: doc.bookmarksCount,
    commentsCount: doc.commentsCount,
    retweetsCount: doc.retweetsCount,
    hashtags: doc.hashtags,
    mentions: doc.mentions,
    retweets: doc.retweets.map(String),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    ...(viewerId
      ? {
          userLiked: doc.likes.some(id => id.toString() === viewerId),
          userBookmarked: doc.bookmarks.some(id => id.toString() === viewerId),
        }
      : {}),
  };
}
