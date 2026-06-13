import mongoose, { type HydratedDocument, Schema, type Types } from 'mongoose';

import { Post, POST_AUTHOR_SELECT } from '../posts/post.model.js';
import type { UserDoc } from '../users/user.model.js';

export type CommentDoc = HydratedDocument<{
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  images: string[];
  likes: Types.ObjectId[];
  likesCount: number;
  repliesCount: number;
  isReply: boolean;
  hashtags: string[];
  mentions: string[];
  isDeleted: boolean;
  source: string;
  language: string;
  parentComment?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}>;

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    text: { type: String, required: true },
    images: { type: [String], default: [] },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
      default: [],
    },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    isReply: { type: Boolean, default: false },
    hashtags: { type: [String], default: [] },
    mentions: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
    source: { type: String, default: 'web' },
    language: { type: String, default: 'es' },
    parentComment: { type: Schema.Types.ObjectId, ref: 'comments' },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<CommentDoc>('comments', commentSchema);

export const COMMENT_AUTHOR_POPULATE = {
  path: 'author',
  select: POST_AUTHOR_SELECT,
} as const;

export const ACTIVE_COMMENT_FILTER = { isDeleted: false } as const;

export async function findActiveCommentById(id: string) {
  return Comment.findOne({ _id: id, isDeleted: false });
}

export async function syncPostCommentsCount(postId: string) {
  const count = await Comment.countDocuments({ postId, isDeleted: false });
  await Post.findByIdAndUpdate(postId, { commentsCount: count });
}

function serializeCommentAuthor(author: UserDoc) {
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

function getPopulatedCommentAuthor(comment: CommentDoc): UserDoc {
  const author = comment.author as UserDoc | Types.ObjectId;

  if (!('username' in author)) {
    throw new Error('Comment author must be populated before serialization');
  }

  return author;
}

export function serializeComment(comment: CommentDoc, viewerId?: string) {
  const author = getPopulatedCommentAuthor(comment);

  const doc = comment.toObject();
  const liked = viewerId
    ? doc.likes.some(id => id.toString() === viewerId)
    : undefined;

  return {
    _id: comment._id.toString(),
    postId: doc.postId.toString(),
    userId: serializeCommentAuthor(author),
    text: doc.text,
    images: doc.images,
    likes: doc.likes.map(String),
    likesCount: doc.likesCount,
    repliesCount: doc.repliesCount,
    isReply: doc.isReply,
    hashtags: doc.hashtags,
    mentions: doc.mentions,
    isDeleted: doc.isDeleted,
    source: doc.source,
    language: doc.language,
    parentComment: doc.parentComment?.toString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    ...(viewerId
      ? {
          userLiked: liked,
          liked,
        }
      : {}),
  };
}
