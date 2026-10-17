import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { CommentsPersistence } from './comments.persistence.js';

@Module({
  imports: [MongoModule.forFeature(['comments'])],
  providers: [CommentsPersistence],
  exports: [CommentsPersistence],
})
export class CommentsPersistenceModule {}
