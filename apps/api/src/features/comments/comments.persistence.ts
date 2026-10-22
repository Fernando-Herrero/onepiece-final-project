import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { type Collection, ObjectId } from 'mongodb';

export type CommentDocument = {
  _id: ObjectId;
  postId: ObjectId;
  author: ObjectId;
  text: string;
  images: string[];
  likes: ObjectId[];
  likesCount: number;
  repliesCount: number;
  isReply: boolean;
  hashtags: string[];
  mentions: string[];
  isDeleted: boolean;
  source: string;
  language: string;
  parentComment?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class CommentsPersistence implements OnModuleInit {
  constructor(
    @InjectCollection('comments')
    private readonly comments: Collection<CommentDocument>,
  ) {}

  async onModuleInit() {
    await this.comments.createIndexes([
      { key: { author: 1, postId: 1 } },
      { key: { postId: 1 } },
    ]);
  }

  distinctPostIdsByAuthor(authorId: string) {
    return this.comments.distinct('postId', {
      author: new ObjectId(authorId),
      isDeleted: false,
    });
  }

  countByAuthor(authorId: string, postIds: ObjectId[]) {
    return this.comments.countDocuments({
      author: new ObjectId(authorId),
      postId: { $in: postIds },
      isDeleted: false,
    });
  }

  deleteByPostIds(postIds: ObjectId[]) {
    if (postIds.length === 0) {
      return Promise.resolve({ deletedCount: 0 });
    }

    return this.comments.deleteMany({ postId: { $in: postIds } });
  }

  deleteByAuthor(authorId: string) {
    return this.comments.deleteMany({ author: new ObjectId(authorId) });
  }
}
