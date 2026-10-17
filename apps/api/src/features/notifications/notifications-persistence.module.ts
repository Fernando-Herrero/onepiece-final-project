import { MongoModule } from '@jperezmart/nest-mongodb';
import { Module } from '@nestjs/common';

import { NotificationsPersistence } from './notifications.persistence.js';

@Module({
  imports: [MongoModule.forFeature(['notifications'])],
  providers: [NotificationsPersistence],
  exports: [NotificationsPersistence],
})
export class NotificationsPersistenceModule {}
