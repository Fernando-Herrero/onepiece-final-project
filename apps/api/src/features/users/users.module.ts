import { Module } from '@nestjs/common';

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
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
