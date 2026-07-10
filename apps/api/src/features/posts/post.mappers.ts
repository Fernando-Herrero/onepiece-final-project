import type { ObjectId, WithId } from 'mongodb';

import {
  serializeAuthorEmbed,
  type UserDocument,
} from '../users/user.mappers.js';

export type PostDocument = {
  _id: ObjectId;
  text: string;
  userId: ObjectId;
  images?: string[];
  visibility: 'public' | 'private' | 'followers';
  isDeleted: boolean;
  shareToken?: string;
  isRetweet: boolean;
  isReply: boolean;
  isPinned: boolean;
  language: string;
  likes: ObjectId[];
  bookmarks: ObjectId[];
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  retweetsCount: number;
  hashtags: string[];
  mentions: string[];
  retweets: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

export const PUBLIC_POST_FILTER = {
  visibility: 'public' as const,
  isDeleted: false,
};

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

export function serializePost(
  post: WithId<PostDocument>,
  author: WithId<UserDocument>,
  viewerId?: string,
) {
  return {
    _id: post._id.toString(),
    text: post.text,
    userId: serializeAuthorEmbed(author),
    images: post.images,
    visibility: post.visibility,
    isDeleted: post.isDeleted,
    shareToken: post.shareToken,
    isRetweet: post.isRetweet,
    isReply: post.isReply,
    isPinned: post.isPinned,
    language: post.language,
    likes: post.likes.map(String),
    bookmarks: post.bookmarks.map(String),
    likesCount: post.likesCount,
    bookmarksCount: post.bookmarksCount,
    commentsCount: post.commentsCount,
    retweetsCount: post.retweetsCount,
    hashtags: post.hashtags,
    mentions: post.mentions,
    retweets: post.retweets.map(String),
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    ...(viewerId
      ? {
          userLiked: post.likes.some(id => id.toString() === viewerId),
          userBookmarked: post.bookmarks.some(id => id.toString() === viewerId),
        }
      : {}),
  };
}
