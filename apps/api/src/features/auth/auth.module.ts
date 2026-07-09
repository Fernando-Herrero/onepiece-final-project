import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthSessionService } from './auth-session.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthSessionService, AuthService],
  exports: [AuthSessionService],
})
export class AuthModule {}
