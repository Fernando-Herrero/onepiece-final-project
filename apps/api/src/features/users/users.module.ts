import { Module } from '@nestjs/common';

import { SessionsPersistenceModule } from '../auth/sessions-persistence.module.js';
import { CommentsPersistenceModule } from '../comments/comments-persistence.module.js';
import { NotificationsPersistenceModule } from '../notifications/notifications-persistence.module.js';
import { PostsPersistenceModule } from '../posts/posts-persistence.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersPersistenceModule } from './users-persistence.module.js';

@Module({
  imports: [
    UsersPersistenceModule,
    PostsPersistenceModule,
    CommentsPersistenceModule,
    NotificationsPersistenceModule,
    SessionsPersistenceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
