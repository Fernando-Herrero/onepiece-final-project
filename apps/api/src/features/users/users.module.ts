import { Module } from '@nestjs/common';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersDataModule } from './users-data.module.js';

@Module({
  imports: [UsersDataModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
