import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { SessionsPersistence } from './sessions.persistence.js';

@Module({
  imports: [MongoModule.forFeature(['sessions'])],
  providers: [SessionsPersistence],
  exports: [SessionsPersistence],
})
export class SessionsPersistenceModule {}
