import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { PostsPersistence } from '../posts/posts.persistence.js';
import { UsersPersistence } from './users.persistence.js';

/**
 * Colecciones compartidas por el módulo users (perfil) hasta que posts, comments y
 * notifications tengan su propio feature module con MongoModule.forFeature propio.
 * Ver docs/NEST-MIGRATION.md — patrón *Persistence (guía MongoDB admin).
 */
@Module({
  imports: [
    MongoModule.forFeature(['users', 'posts', 'comments', 'notifications']),
  ],
  providers: [
    UsersPersistence,
    PostsPersistence,
    CommentsPersistence,
    NotificationsPersistence,
  ],
  exports: [
    UsersPersistence,
    PostsPersistence,
    CommentsPersistence,
    NotificationsPersistence,
  ],
})
export class UsersDataModule {}
