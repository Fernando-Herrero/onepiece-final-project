import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { PostsPersistence } from './posts.persistence.js';

@Module({
  imports: [MongoModule.forFeature(['posts'])],
  providers: [PostsPersistence],
  exports: [PostsPersistence],
})
export class PostsPersistenceModule {}
