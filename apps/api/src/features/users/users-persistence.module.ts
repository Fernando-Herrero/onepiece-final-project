import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { UsersPersistence } from './users.persistence.js';

@Module({
  imports: [MongoModule.forFeature(['users'])],
  providers: [UsersPersistence],
  exports: [UsersPersistence],
})
export class UsersPersistenceModule {}
