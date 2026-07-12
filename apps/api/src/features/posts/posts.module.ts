import { Module } from '@nestjs/common';

import { UsersDataModule } from '../users/users-data.module.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

@Module({
  imports: [UsersDataModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
