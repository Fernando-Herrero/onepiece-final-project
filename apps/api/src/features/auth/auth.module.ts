import { Module } from '@nestjs/common';

import { AuthSessionService } from './auth-session.service.js';

@Module({
  providers: [AuthSessionService],
  exports: [AuthSessionService],
})
export class AuthModule {}
