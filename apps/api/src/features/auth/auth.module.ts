import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { UsersPersistenceModule } from '../users/users-persistence.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthSessionService } from './auth-session.service.js';
import { SessionGuard } from './session.guard.js';

@Module({
  imports: [UsersPersistenceModule],
  controllers: [AuthController],
  providers: [
    AuthSessionService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
  exports: [AuthSessionService],
})
export class AuthModule {}
