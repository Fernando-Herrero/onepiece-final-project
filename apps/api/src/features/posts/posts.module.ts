import { Module } from '@nestjs/common';

import { NotificationsPersistenceModule } from '../notifications/notifications-persistence.module.js';
import { UsersPersistenceModule } from '../users/users-persistence.module.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { PostsPersistenceModule } from './posts-persistence.module.js';

@Module({
  imports: [
    PostsPersistenceModule,
    UsersPersistenceModule,
    NotificationsPersistenceModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
