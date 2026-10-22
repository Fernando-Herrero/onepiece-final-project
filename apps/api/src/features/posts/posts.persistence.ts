import { InjectCollection } from '@jperezmart/nest-mongodb';
import { POST_FEED_PAGE_SIZE } from '@logpose/contracts/common/post.schemas';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { type Collection, type Filter, ObjectId, type WithId } from 'mongodb';

import { decodePostCursor, type PostDocument } from './posts.mappers.js';

type NewPost = Pick<
  PostDocument,
  'text' | 'userId' | 'images' | 'visibility' | 'language'
> &
  Partial<Pick<PostDocument, 'shareToken' | 'retweetOf'>>;

/**
 * Los métodos de lectura reciben `visible` (`visiblePostsFilter`): un post que
 * el viewer no puede ver no se lista, no se cuenta y no se toca.
 */
@Injectable()
export class PostsPersistence implements OnModuleInit {
  constructor(
    @InjectCollection('posts')
    private readonly posts: Collection<PostDocument>,
  ) {}

  async onModuleInit() {
    await this.posts.createIndexes([
      // Sin `visibility` delante: el filtro del admin y del usuario no la fija.
      { key: { isDeleted: 1, createdAt: -1, _id: -1 } },
      { key: { userId: 1, createdAt: -1, _id: -1 } },
      { key: { likes: 1, createdAt: -1, _id: -1 } },
      { key: { bookmarks: 1, createdAt: -1, _id: -1 } },
      { key: { retweetOf: 1 } },
    ]);
  }

  countByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts.countDocuments({
      ...visible,
      userId: new ObjectId(userId),
      isDeleted: false,
    });
  }

  countLikedByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts.countDocuments({
      ...visible,
      likes: new ObjectId(userId),
      isDeleted: false,
    });
  }

  countBookmarkedByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts.countDocuments({
      ...visible,
      bookmarks: new ObjectId(userId),
      isDeleted: false,
    });
  }

  async findVisibleIds(ids: ObjectId[], visible: Filter<PostDocument>) {
    const rows = await this.posts
      .find(
        { ...visible, _id: { $in: ids }, isDeleted: false },
        { projection: { _id: 1 } },
      )
      .toArray();

    return rows.map(row => row._id);
  }

  findByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts
      .find({
        ...visible,
        userId: new ObjectId(userId),
        isDeleted: false,
      })
      .toArray();
  }

  findLikedByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts
      .find({
        ...visible,
        likes: new ObjectId(userId),
        isDeleted: false,
      })
      .toArray();
  }

  findBookmarkedByUserId(userId: string, visible: Filter<PostDocument>) {
    return this.posts
      .find({
        ...visible,
        bookmarks: new ObjectId(userId),
        isDeleted: false,
      })
      .toArray();
  }

  findByIds(ids: ObjectId[], visible: Filter<PostDocument>) {
    if (ids.length === 0) {
      return Promise.resolve([] as WithId<PostDocument>[]);
    }

    return this.posts
      .find({
        ...visible,
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

  /**
   * Retweets ajenos de estos posts. Al borrar una cuenta se llama antes de
   * `deleteByUserId`: sin esto, los retweets que OTRA gente hizo de sus posts
   * quedan huérfanos (`retweetOf` apuntando a nada) — invisibles gracias al
   * filtro en `serializePostsForViewer`, pero acumulándose sin límite.
   */
  deleteRetweetsOf(postIds: ObjectId[]) {
    if (postIds.length === 0) {
      return Promise.resolve({ deletedCount: 0 });
    }

    return this.posts.deleteMany({ retweetOf: { $in: postIds } });
  }

  findFeedPage(
    visible: Filter<PostDocument>,
    limit = POST_FEED_PAGE_SIZE,
    cursor?: string,
  ) {
    const decoded = cursor ? decodePostCursor(cursor) : null;
    const page: Filter<PostDocument> = decoded
      ? {
          $or: [
            { createdAt: { $lt: decoded.createdAt } },
            { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
          ],
        }
      : {};

    // `$and` y no spread: `visible` y `page` pueden traer los dos un `$or`.
    return this.posts
      .find({ $and: [visible, page], isDeleted: false })
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

  findVisibleById(id: string, visible: Filter<PostDocument>) {
    return this.posts.findOne({
      ...visible,
      _id: new ObjectId(id),
      isDeleted: false,
    });
  }

  /**
   * Añade o quita `userId` del array `likes` o `bookmarks` y ajusta el contador
   * denormalizado. Sin leer antes: el primer `findOneAndUpdate` solo casa si el
   * usuario no está y lo añade; si no casa, el segundo lo quita. Cada uno es
   * atómico, así que dos toggles a la vez no dejan el contador descuadrado.
   * Si tampoco casa el segundo, otro toggle lo quitó entre medias y se vuelve
   * a añadir una vez; si aún no casa, el post no existe o no se ve.
   * Devuelve el post actualizado y si el usuario ya tenía el flag antes.
   */
  async toggleUserField(
    postId: string,
    userId: string,
    field: 'likes' | 'bookmarks',
    visible: Filter<PostDocument>,
  ) {
    const user = new ObjectId(userId);
    const countField = field === 'likes' ? 'likesCount' : 'bookmarksCount';
    const post = { ...visible, _id: new ObjectId(postId), isDeleted: false };
    const add = () =>
      this.posts.findOneAndUpdate(
        { ...post, [field]: { $ne: user } },
        { $addToSet: { [field]: user }, $inc: { [countField]: 1 } },
        { returnDocument: 'after' },
      );

    const added = await add();

    if (added) {
      return { post: added, alreadyHad: false };
    }

    const removed = await this.posts.findOneAndUpdate(
      { ...post, [field]: user },
      { $pull: { [field]: user }, $inc: { [countField]: -1 } },
      { returnDocument: 'after' },
    );

    if (removed) {
      return { post: removed, alreadyHad: true };
    }

    const readded = await add();

    return readded ? { post: readded, alreadyHad: false } : null;
  }

  /**
   * Un retweet es un eco de un original: si el original desaparece, sus
   * copias también. Se cascada aquí (no solo en `posts.service.delete`)
   * porque los otros dos llamantes (deshacer retweet propio, rollback de
   * `toggleRetweet`) siempre operan sobre wrappers, que nunca tienen hijos
   * — el `updateMany` no encuentra nada y es un no-op barato.
   */
  async softDeleteById(id: string) {
    const objectId = new ObjectId(id);
    const deleted = await this.posts.findOneAndUpdate(
      { _id: objectId, isDeleted: false },
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (deleted && !deleted.isRetweet) {
      await this.posts.updateMany(
        { retweetOf: objectId, isDeleted: false },
        { $set: { isDeleted: true, updatedAt: new Date() } },
      );
    }

    return deleted;
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

    const retweetPost = await this.insert({
      text: original.text,
      userId: new ObjectId(userId),
      images: original.images,
      visibility: 'public',
      language: original.language,
      retweetOf: original._id,
    });

    const updated = await this.posts.findOneAndUpdate(
      { _id: new ObjectId(originalId), isDeleted: false },
      {
        $addToSet: { retweets: retweetPost._id },
        $inc: { retweetsCount: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' },
    );

    if (!updated) {
      await this.softDeleteById(retweetPost._id.toString());
      return null;
    }

    return { original: updated, retweeted: true as const, retweetPost };
  }

  /** Único constructor de posts: el resto de campos empieza vacío. */
  async insert(data: NewPost) {
    const now = new Date();
    const document: PostDocument = {
      ...data,
      _id: new ObjectId(),
      images: data.images ?? [],
      isDeleted: false,
      isRetweet: data.retweetOf !== undefined,
      isReply: false,
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
