import { Module } from '@nestjs/common';

import { UsersDataModule } from '../users/users-data.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthSessionService } from './auth-session.service.js';

@Module({
  imports: [UsersDataModule],
  controllers: [AuthController],
  providers: [AuthSessionService, AuthService],
  exports: [AuthSessionService],
})
export class AuthModule {}
