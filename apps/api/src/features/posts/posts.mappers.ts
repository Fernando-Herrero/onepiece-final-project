import { getPostTextMaxLength } from '@logpose/contracts/common/post.schemas';
import { ORPCError } from '@orpc/server';
import { ObjectId, type WithId } from 'mongodb';

import {
  serializeAuthorEmbed,
  type UserDocument,
} from '../users/user.mappers.js';
import type { UsersPersistence } from '../users/users.persistence.js';

/**
 * Forma del documento Mongo en la colección `posts`.
 * Los ObjectId se guardan en BD; el contrato oRPC (`postPublicSchema`) expone strings.
 */
export type PostDocument = {
  _id: ObjectId;
  text: string;
  userId: ObjectId;
  images?: string[];
  visibility: 'public' | 'private' | 'followers';
  isDeleted: boolean;
  shareToken?: string;
  isRetweet: boolean;
  retweetOf?: ObjectId;
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

/**
 * Filtro reutilizable para posts visibles en feed y listados públicos.
 * Excluye borrados lógicos y todo lo que no sea `visibility: 'public'`.
 */
export const PUBLIC_POST_FILTER = {
  visibility: 'public' as const,
  isDeleted: false,
};

/**
 * Límite de caracteres del texto según si el autor está verificado.
 * Reexportado desde contracts — fuente de verdad compartida con web.
 */
export { getPostTextMaxLength as getTextMaxLength };

/**
 * Valida longitud del texto antes de crear/actualizar un post.
 * Devuelve mensaje de error en español o `null` si es válido.
 * La API Nest usará esto en `create`/`update` (fases posteriores).
 */
export function assertTextLength(text: string, verified: boolean) {
  const max = getPostTextMaxLength(verified);
  if (text.length > max) {
    return `El texto no puede superar ${max} caracteres`;
  }
  return null;
}

/**
 * Convierte un documento Mongo + autor ya resuelto en la forma `postPublicSchema`.
 *
 * - `userId` pasa de ObjectId a embed del autor (`serializeAuthorEmbed`).
 * - Arrays de ObjectId (`likes`, `bookmarks`, `retweets`) → strings.
 * - Fechas → ISO string para JSON.
 * - Si hay `viewerId` (sesión JWT), añade `userLiked` y `userBookmarked`
 *   comparando ese id con los arrays del documento.
 */
export function serializePost(
  post: WithId<PostDocument>,
  author: WithId<UserDocument>,
  viewerId?: string,
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
          ...(retweetedOriginalIds
            ? {
                userRetweeted: retweetedOriginalIds.has(post._id.toString()),
              }
            : {}),
        }
      : {}),
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

/** Ids para comprobar si el viewer retweeteó (original, no el wrapper). */
export function collectRetweetCheckIds(posts: WithId<PostDocument>[]) {
  return posts.map(post =>
    post.isRetweet && post.retweetOf
      ? post.retweetOf.toString()
      : post._id.toString(),
  );
}

function applyOriginalInteractionStats(
  serialized: ReturnType<typeof serializePost>,
  original: WithId<PostDocument>,
  originalAuthor: WithId<UserDocument>,
  viewerId?: string,
  retweetedOriginalIds?: Set<string>,
) {
  const originalId = original._id.toString();

  return {
    ...serialized,
    originalAuthor: serializeAuthorEmbed(originalAuthor),
    likesCount: original.likesCount,
    bookmarksCount: original.bookmarksCount,
    retweetsCount: original.retweetsCount,
    commentsCount: original.commentsCount,
    ...(viewerId
      ? {
          userLiked: original.likes.some(id => id.toString() === viewerId),
          userBookmarked: original.bookmarks.some(
            id => id.toString() === viewerId,
          ),
          ...(retweetedOriginalIds
            ? { userRetweeted: retweetedOriginalIds.has(originalId) }
            : {}),
        }
      : {}),
  };
}

/**
 * Enriquece una lista de posts con datos del autor y flags del viewer.
 *
 * Flujo (evita N+1 queries por post):
 * 1. Extrae ids de autor únicos (retweeter + autores originales).
 * 2. Una sola lectura batch en `usersPersistence.findByIds`.
 * 3. Por cada post, empareja autor y llama a `serializePost`.
 *
 * Si `originalPostsById` incluye el original de un retweet, añade `originalAuthor`
 * y sincroniza contadores/interacciones del post original en la card.
 */
export async function serializePostsWithAuthors(
  posts: WithId<PostDocument>[],
  usersPersistence: UsersPersistence,
  viewerId?: string,
  retweetedOriginalIds?: Set<string>,
  originalPostsById?: Map<string, WithId<PostDocument>>,
) {
  if (posts.length === 0) {
    return [];
  }

  const authorIds = new Set(posts.map(post => post.userId.toString()));

  for (const post of posts) {
    if (!post.isRetweet || !post.retweetOf || !originalPostsById) {
      continue;
    }

    const original = originalPostsById.get(post.retweetOf.toString());
    if (original) {
      authorIds.add(original.userId.toString());
    }
  }

  const authors = await usersPersistence.findByIds(
    [...authorIds].map(id => new ObjectId(id)),
  );
  const authorById = new Map(
    authors.map(author => [author._id.toString(), author]),
  );

  return posts.map(post => {
    const author = authorById.get(post.userId.toString());

    if (!author) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const serialized = serializePost(
      post,
      author,
      viewerId,
      retweetedOriginalIds,
    );

    if (!post.isRetweet || !post.retweetOf || !originalPostsById) {
      return serialized;
    }

    const original = originalPostsById.get(post.retweetOf.toString());
    if (!original) {
      return serialized;
    }

    const originalAuthor = authorById.get(original.userId.toString());
    if (!originalAuthor) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return applyOriginalInteractionStats(
      serialized,
      original,
      originalAuthor,
      viewerId,
      retweetedOriginalIds,
    );
  });
}
