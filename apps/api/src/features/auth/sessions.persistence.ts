import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { type ClientSession, type Collection, ObjectId } from 'mongodb';

type SessionDocument = {
  /** SHA-256 del token de la cookie: un volcado de la colección no sirve como cookie. */
  _id: string;
  userId: ObjectId;
  expiresAt: Date;
  lastSeenAt: Date;
};

@Injectable()
export class SessionsPersistence implements OnModuleInit {
  constructor(
    @InjectCollection('sessions')
    private readonly sessions: Collection<SessionDocument>,
  ) {}

  async onModuleInit() {
    await this.sessions.createIndexes([
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      { key: { userId: 1 } },
    ]);
  }

  async insert(id: string, userId: string, expiresAt: Date) {
    await this.sessions.insertOne({
      _id: id,
      userId: new ObjectId(userId),
      expiresAt,
      lastSeenAt: new Date(),
    });
  }

  /** El TTL borra con hasta ~60 s de retraso, así que la caducidad se filtra también aquí. */
  findActive(id: string) {
    return this.sessions.findOne({ _id: id, expiresAt: { $gt: new Date() } });
  }

  async renew(id: string, expiresAt: Date) {
    await this.sessions.updateOne(
      { _id: id },
      { $set: { expiresAt, lastSeenAt: new Date() } },
    );
  }

  async delete(id: string) {
    await this.sessions.deleteOne({ _id: id });
  }

  async deleteByUser(userId: string, session?: ClientSession) {
    await this.sessions.deleteMany(
      { userId: new ObjectId(userId) },
      { session },
    );
  }
}
