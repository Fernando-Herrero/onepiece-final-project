import type {
  privacySchema,
  updateUserSchema,
  userPublicSchema,
} from '@logpose/contracts/common/user.schemas';
import type * as z from 'zod/v4';

export type ProfilePostsTab = 'posts' | 'liked' | 'bookmarked' | 'comments';

export type ProfilePrivacy = z.infer<typeof privacySchema>;

export type ProfileUser = z.infer<typeof userPublicSchema>;

export type ProfileViewMoreUser = Pick<
  ProfileUser,
  | '_id'
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'address'
  | 'phoneNumber'
  | 'createdAt'
  | 'displayName'
>;

export type UpdateProfileBody = Pick<
  z.infer<typeof updateUserSchema>,
  | 'displayName'
  | 'bio'
  | 'coverImage'
  | 'avatar'
  | 'address'
  | 'phoneNumber'
  | 'privacy'
>;

export type ProfilePostsTabConfig = {
  key: ProfilePostsTab;
  labelKey:
    | 'profile.posts'
    | 'profile.likes'
    | 'profile.bookmarks'
    | 'profile.comments';
  privacyKey: keyof ProfilePrivacy;
};

export type ProfilePostsEmptyMessageKey =
  | 'profile.no_posts'
  | 'profile.no_liked_posts'
  | 'profile.no_bookmarked_posts'
  | 'profile.no_commented_posts';

export type ProfilePostsPrivateMessageKey =
  | 'profile.private_content'
  | 'profile.private_likes'
  | 'profile.private_bookmarks'
  | 'profile.private_comments';

export type ProfilePostsPrivateMessageOtherKey =
  | 'profile.private_content_other'
  | 'profile.private_likes_other'
  | 'profile.private_bookmarks_other'
  | 'profile.private_comments_other';
