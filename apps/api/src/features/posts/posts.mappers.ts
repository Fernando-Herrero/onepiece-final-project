import {
  getPostTextMaxLength,
  type postVisibilitySchema,
} from '@logpose/contracts/common/post.schemas';
import { ORPCError } from '@orpc/server';
import { type Filter, ObjectId, type WithId } from 'mongodb';
import type * as z from 'zod/v4';

import type { Viewer } from '../auth/access.js';
import {
  serializeAuthorEmbed,
  type UserDocument,
} from '../users/user.mappers.js';
import type { UsersPersistence } from '../users/users.persistence.js';
import type { PostsPersistence } from './posts.persistence.js';

/**
 * Forma del documento Mongo en la colección `posts`.
 * Los ObjectId se guardan en BD; el contrato oRPC (`postPublicSchema`) expone strings.
 */
export type PostDocument = {
  _id: ObjectId;
  text: string;
  userId: ObjectId;
  images?: string[];
  visibility: z.infer<typeof postVisibilitySchema>;
  isDeleted: boolean;
  shareToken?: string;
  isRetweet: boolean;
  retweetOf?: ObjectId;
  isReply: boolean;
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

/**
 * Valida longitud del texto antes de crear/actualizar un post.
 * Devuelve el mensaje de error o `null` si es válido.
 * La API Nest usará esto en `create`/`update` (fases posteriores).
 */
export function assertTextLength(text: string, verified: boolean) {
  const max = getPostTextMaxLength(verified);
  if (text.length > max) {
    return `Text cannot exceed ${max} characters`;
  }
  return null;
}

/**
 * Contadores del post y, si el viewer tiene sesión, si le ha dado like, lo ha
 * guardado o (si se pasa el set) lo ha retuiteado. Un retweet se pinta con
 * los del original.
 */
function interactionStats(
  post: WithId<PostDocument>,
  viewer: Viewer,
  retweetedOriginalIds?: Set<string>,
) {
  return {
    likesCount: post.likesCount,
    bookmarksCount: post.bookmarksCount,
    commentsCount: post.commentsCount,
    retweetsCount: post.retweetsCount,
    ...(viewer.kind === 'user'
      ? {
          userLiked: post.likes.some(id => id.toString() === viewer.id),
          userBookmarked: post.bookmarks.some(
            id => id.toString() === viewer.id,
          ),
          ...(retweetedOriginalIds
            ? { userRetweeted: retweetedOriginalIds.has(post._id.toString()) }
            : {}),
        }
      : {}),
  };
}

/**
 * Convierte un documento Mongo + autor ya resuelto en la forma `postPublicSchema`.
 *
 * - `userId` pasa de ObjectId a embed del autor (`serializeAuthorEmbed`).
 * - `retweets` (ObjectId) → strings. `likes` y `bookmarks` no salen: dirían
 *   quién ha dado like o guardado; basta con los contadores y los flags.
 * - Fechas → ISO string para JSON.
 * - Contadores y flags del viewer: `interactionStats`.
 */
export function serializePost(
  post: WithId<PostDocument>,
  author: WithId<UserDocument>,
  viewer: Viewer,
  retweetedOriginalIds?: Set<string>,
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
    retweetOf: post.retweetOf?.toString(),
    isReply: post.isReply,
    language: post.language,
    hashtags: post.hashtags,
    mentions: post.mentions,
    retweets: post.retweets.map(String),
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    ...interactionStats(post, viewer, retweetedOriginalIds),
  };
}

/** Cursor estable para paginación del feed: `createdAt ISO|postId`. */
export function encodePostCursor(post: WithId<PostDocument>) {
  const createdAt = post.createdAt?.toISOString() ?? '';
  return `${createdAt}|${post._id.toString()}`;
}

export function decodePostCursor(cursor: string) {
  const separatorIndex = cursor.lastIndexOf('|');
  if (separatorIndex <= 0) {
    return null;
  }

  const iso = cursor.slice(0, separatorIndex);
  const id = cursor.slice(separatorIndex + 1);
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime())) {
    return null;
  }

  return { createdAt, id: new ObjectId(id) };
}

/** El original que envuelve un retweet; `undefined` si el post no lo es. */
function originalIdOf(post: WithId<PostDocument>) {
  return post.isRetweet ? post.retweetOf : undefined;
}

/**
 * Serializa una lista de posts para el viewer con tres lecturas en lote (sin
 * N+1): los originales de los retweets, cuáles ha retuiteado el viewer y los
 * autores. Un retweet sale con el autor y las interacciones de su original.
 */
export async function serializePostsForViewer(
  posts: WithId<PostDocument>[],
  viewer: Viewer,
  visible: Filter<PostDocument>,
  persistence: { posts: PostsPersistence; users: UsersPersistence },
) {
  const originals = await persistence.posts.findByIds(
    posts.map(originalIdOf).filter(id => id !== undefined),
    visible,
  );
  const retweetedOriginalIds =
    viewer.kind === 'user'
      ? await persistence.posts.findRetweetedOriginalIds(
          viewer.id,
          posts.map(post => (originalIdOf(post) ?? post._id).toString()),
        )
      : undefined;
  const authors = await persistence.users.findByIds(
    [...posts, ...originals].map(post => post.userId),
  );
  const originalById = new Map(
    originals.map(original => [original._id.toString(), original]),
  );
  const authorById = new Map(
    authors.map(author => [author._id.toString(), author]),
  );
  const authorOf = (post: WithId<PostDocument>) => {
    const author = authorById.get(post.userId.toString());

    if (!author) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return author;
  };

  return posts
    .map(post => {
      const serialized = serializePost(
        post,
        authorOf(post),
        viewer,
        retweetedOriginalIds,
      );
      const originalId = originalIdOf(post);

      if (!originalId) {
        return serialized;
      }

      const original = originalById.get(originalId.toString());

      if (!original) {
        // Borrado, huérfano (la cascada de `softDeleteById` no llegó a
        // completarse) o no visible: el envoltorio no sale.
        return null;
      }

      return {
        ...serialized,
        originalAuthor: serializeAuthorEmbed(authorOf(original)),
        ...interactionStats(original, viewer, retweetedOriginalIds),
      };
    })
    .filter(post => post !== null);
}
