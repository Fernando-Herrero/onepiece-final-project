import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import {
  type ClientSession,
  type Collection,
  type Filter,
  ObjectId,
} from 'mongodb';

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

  /**
   * Borra sus comentarios, los ajenos en sus posts y las respuestas ajenas a
   * los suyos; baja `repliesCount` en los padres que quedan y quita su like
   * del resto. Devuelve los posts que han perdido comentarios.
   */
  async deleteByUser(
    userId: string,
    postIds: ObjectId[],
    session: ClientSession,
  ) {
    const author = new ObjectId(userId);
    const ownIds = await this.comments.distinct('_id', { author }, { session });
    const removed: Filter<CommentDocument> = {
      $or: [
        { author },
        { parentComment: { $in: ownIds } },
        { postId: { $in: postIds } },
      ],
    };

    const touchedPostIds = await this.comments.distinct('postId', removed, {
      session,
    });
    const repliesByParent = await this.countActive(
      { $and: [removed, { parentComment: { $exists: true } }] },
      'parentComment',
      session,
    );

    await this.comments.deleteMany(removed, { session });
    // Después del borrado: un padre que también se ha ido ya no casa.
    if (repliesByParent.length > 0) {
      await this.comments.bulkWrite(
        repliesByParent.map(({ _id, count }) => ({
          updateOne: {
            filter: { _id },
            update: { $inc: { repliesCount: -count } },
          },
        })),
        { session },
      );
    }
    // simplificación: sin índice en `likes`, recorre comments; vale hasta decenas de miles.
    await this.comments.updateMany(
      { likes: author },
      { $pull: { likes: author }, $inc: { likesCount: -1 } },
      { session },
    );

    return touchedPostIds;
  }

  /** Comentarios activos de cada post, con 0 en los que ya no tienen ninguno. */
  async countActiveByPost(postIds: ObjectId[], session: ClientSession) {
    const counts = await this.countActive(
      { postId: { $in: postIds } },
      'postId',
      session,
    );

    return postIds.map(postId => ({
      postId,
      count: counts.find(row => row._id.equals(postId))?.count ?? 0,
    }));
  }

  private countActive(
    filter: Filter<CommentDocument>,
    field: 'postId' | 'parentComment',
    session: ClientSession,
  ) {
    return this.comments
      .aggregate<{
        _id: ObjectId;
        count: number;
      }>(
        [
          { $match: { $and: [filter, { isDeleted: false }] } },
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        ],
        { session },
      )
      .toArray();
  }
}
