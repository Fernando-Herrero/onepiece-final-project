import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable } from '@nestjs/common';
import { type Collection, ObjectId, type WithId } from 'mongodb';

import { type PostDocument, PUBLIC_POST_FILTER } from './post.mappers.js';

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
}
