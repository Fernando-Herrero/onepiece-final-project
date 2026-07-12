import { InjectCollection } from '@jperezmart/nest-mongodb';
import { POST_FEED_PAGE_SIZE } from '@logpose/contracts/common/post.schemas';
import { Injectable } from '@nestjs/common';
import { type Collection, type Filter, ObjectId, type WithId } from 'mongodb';

import {
  decodePostCursor,
  type PostDocument,
  PUBLIC_POST_FILTER,
} from './posts.mappers.js';

@Injectable()
export class PostsPersistence {
  constructor(
    @InjectCollection('posts')
    private readonly posts: Collection<PostDocument>,
  ) {}

  countByUserId(userId: string) {
    return this.posts.countDocuments({
      userId: new ObjectId(userId),
      isDeleted: false,
    });
  }

  countLikedByUserId(userId: string) {
    return this.posts.countDocuments({
      likes: new ObjectId(userId),
      isDeleted: false,
    });
  }

  countBookmarkedByUserId(userId: string) {
    return this.posts.countDocuments({
      bookmarks: new ObjectId(userId),
      isDeleted: false,
    });
  }

  findPublicByUserId(userId: string) {
    return this.posts
      .find({
        userId: new ObjectId(userId),
        ...PUBLIC_POST_FILTER,
      })
      .toArray();
  }

  findLikedByUserId(userId: string) {
    return this.posts
      .find({
        likes: new ObjectId(userId),
        isDeleted: false,
      })
      .toArray();
  }

  findBookmarkedByUserId(userId: string) {
    return this.posts
      .find({
        bookmarks: new ObjectId(userId),
        isDeleted: false,
      })
      .toArray();
  }

  findByIds(ids: ObjectId[]) {
    if (ids.length === 0) {
      return Promise.resolve([] as WithId<PostDocument>[]);
    }

    return this.posts
      .find({
        _id: { $in: ids },
        isDeleted: false,
      })
      .toArray();
  }

  findIdsByUserId(userId: string) {
    return this.posts
      .find({ userId: new ObjectId(userId) }, { projection: { _id: 1 } })
      .toArray();
  }

  deleteByUserId(userId: string) {
    return this.posts.deleteMany({ userId: new ObjectId(userId) });
  }

  findPublicFeedPage(limit = POST_FEED_PAGE_SIZE, cursor?: string) {
    const filter: Filter<PostDocument> = { ...PUBLIC_POST_FILTER };
    const decoded = cursor ? decodePostCursor(cursor) : null;

    if (decoded) {
      filter.$or = [
        { createdAt: { $lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
      ];
    }

    return this.posts
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();
  }

  findActiveById(id: string) {
    return this.posts.findOne({
      _id: new ObjectId(id),
      isDeleted: false,
    });
  }

  /**
   * Añade o quita `userId` del array `likes` o `bookmarks` y ajusta el contador denormalizado.
   * Devuelve el post actualizado y si el usuario ya tenía el flag antes del toggle.
   */
  async toggleUserField(
    postId: string,
    userId: string,
    field: 'likes' | 'bookmarks',
  ) {
    const post = await this.findActiveById(postId);
    if (!post) {
      return null;
    }

    const userObjectId = new ObjectId(userId);
    const countField = field === 'likes' ? 'likesCount' : 'bookmarksCount';
    const alreadyHad = post[field].some(id => id.equals(userObjectId));

    const updated = await this.posts.findOneAndUpdate(
      { _id: new ObjectId(postId), isDeleted: false },
      alreadyHad
        ? {
            $pull: { [field]: userObjectId },
            $inc: { [countField]: -1 },
          }
        : {
            $addToSet: { [field]: userObjectId },
            $inc: { [countField]: 1 },
          },
      { returnDocument: 'after' },
    );

    if (!updated) {
      return null;
    }

    return { post: updated, alreadyHad };
  }

  async softDeleteById(id: string) {
    return this.posts.findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: false },
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  }

  async findRetweetedOriginalIds(userId: string, originalIds: string[]) {
    const validIds = originalIds.filter(id => ObjectId.isValid(id));

    if (validIds.length === 0) {
      return new Set<string>();
    }

    const rows = await this.posts
      .find(
        {
          userId: new ObjectId(userId),
          retweetOf: { $in: validIds.map(id => new ObjectId(id)) },
          isRetweet: true,
          isDeleted: false,
        },
        { projection: { retweetOf: 1 } },
      )
      .toArray();

    return new Set(rows.map(row => row.retweetOf!.toString()));
  }

  findUserRetweet(userId: string, originalId: string) {
    return this.posts.findOne({
      userId: new ObjectId(userId),
      retweetOf: new ObjectId(originalId),
      isRetweet: true,
      isDeleted: false,
    });
  }

  async toggleRetweet(originalId: string, userId: string) {
    const original = await this.findActiveById(originalId);

    if (!original || original.isRetweet) {
      return null;
    }

    const existing = await this.findUserRetweet(userId, originalId);

    if (existing) {
      await this.softDeleteById(existing._id.toString());

      const updated = await this.posts.findOneAndUpdate(
        { _id: new ObjectId(originalId), isDeleted: false },
        {
          $pull: { retweets: existing._id },
          $inc: { retweetsCount: -1 },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

      if (!updated) {
        return null;
      }

      return {
        original: updated,
        retweeted: false as const,
        removedRetweetPostId: existing._id.toString(),
      };
    }

    const now = new Date();
    const retweetPost: PostDocument = {
      _id: new ObjectId(),
      text: original.text,
      userId: new ObjectId(userId),
      images: original.images ?? [],
      visibility: 'public',
      isDeleted: false,
      isRetweet: true,
      retweetOf: new ObjectId(originalId),
      isReply: false,
      isPinned: false,
      language: original.language,
      likes: [],
      bookmarks: [],
      likesCount: 0,
      bookmarksCount: 0,
      commentsCount: 0,
      retweetsCount: 0,
      hashtags: [],
      mentions: [],
      retweets: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.posts.insertOne(retweetPost);

    const updated = await this.posts.findOneAndUpdate(
      { _id: new ObjectId(originalId), isDeleted: false },
      {
        $addToSet: { retweets: retweetPost._id },
        $inc: { retweetsCount: 1 },
        $set: { updatedAt: now },
      },
      { returnDocument: 'after' },
    );

    if (!updated) {
      await this.softDeleteById(retweetPost._id.toString());
      return null;
    }

    return { original: updated, retweeted: true as const, retweetPost };
  }

  /** Inserta un post nuevo; devuelve el documento persistido con `_id`. */
  async insert(
    data: Pick<
      PostDocument,
      'text' | 'userId' | 'images' | 'visibility' | 'shareToken' | 'language'
    >,
  ) {
    const now = new Date();
    const document: PostDocument = {
      _id: new ObjectId(),
      text: data.text,
      userId: data.userId,
      images: data.images ?? [],
      visibility: data.visibility,
      isDeleted: false,
      shareToken: data.shareToken,
      isRetweet: false,
      isReply: false,
      isPinned: false,
      language: data.language,
      likes: [],
      bookmarks: [],
      likesCount: 0,
      bookmarksCount: 0,
      commentsCount: 0,
      retweetsCount: 0,
      hashtags: [],
      mentions: [],
      retweets: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.posts.insertOne(document);
    return document;
  }
}
