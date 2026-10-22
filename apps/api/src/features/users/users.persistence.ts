import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import {
  type ClientSession,
  type Collection,
  ObjectId,
  type WithId,
} from 'mongodb';

import type { UserDocument } from './user.mappers.js';

@Injectable()
export class UsersPersistence implements OnModuleInit {
  constructor(
    @InjectCollection('users')
    private readonly users: Collection<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.users.createIndex({ username: 1 }, { unique: true });
    await this.users.createIndex({ email: 1 }, { unique: true });
  }

  async findById(id: string): Promise<WithId<UserDocument> | null> {
    return this.users.findOne({ _id: new ObjectId(id) });
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<WithId<UserDocument> | null> {
    return this.users.findOne(
      { email: email.toLowerCase() },
      withPassword ? undefined : { projection: { password: 0 } },
    );
  }

  findAccessById(id: string) {
    return this.users.findOne<Pick<UserDocument, 'role' | 'isActive'>>(
      { _id: new ObjectId(id) },
      { projection: { role: 1, isActive: 1 } },
    );
  }

  async findFollowingIds(id: string): Promise<ObjectId[]> {
    const doc = await this.users.findOne(
      { _id: new ObjectId(id) },
      { projection: { following: 1 } },
    );

    return doc?.following ?? [];
  }

  async findByIds(ids: ObjectId[]): Promise<WithId<UserDocument>[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.users.find({ _id: { $in: ids } }).toArray();
  }

  async insert(doc: Omit<UserDocument, '_id'>): Promise<WithId<UserDocument>> {
    const now = new Date();
    const result = await this.users.insertOne({
      ...doc,
      email: doc.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    } as UserDocument);

    const inserted = await this.users.findOne({ _id: result.insertedId });

    if (!inserted) {
      throw new Error('Failed to read inserted user');
    }

    return inserted;
  }

  async updateById(
    id: string,
    update: Partial<UserDocument>,
  ): Promise<WithId<UserDocument> | null> {
    await this.users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
    );

    return this.findById(id);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    );
  }

  async findRanking(limit: number): Promise<WithId<UserDocument>[]> {
    return this.users.find().sort({ experience: -1 }).limit(limit).toArray();
  }

  async findAll(): Promise<WithId<UserDocument>[]> {
    return this.users.find().toArray();
  }

  async addFollow(viewerId: string, targetId: string): Promise<void> {
    const now = new Date();

    await this.users.updateOne(
      { _id: new ObjectId(viewerId) },
      {
        $addToSet: { following: new ObjectId(targetId) },
        $set: { updatedAt: now },
      },
    );
    await this.users.updateOne(
      { _id: new ObjectId(targetId) },
      {
        $addToSet: { followers: new ObjectId(viewerId) },
        $set: { updatedAt: now },
      },
    );
  }

  async removeFollow(viewerId: string, targetId: string): Promise<void> {
    const now = new Date();

    await this.users.updateOne(
      { _id: new ObjectId(viewerId) },
      {
        $pull: { following: new ObjectId(targetId) },
        $set: { updatedAt: now },
      },
    );
    await this.users.updateOne(
      { _id: new ObjectId(targetId) },
      {
        $pull: { followers: new ObjectId(viewerId) },
        $set: { updatedAt: now },
      },
    );
  }

  /** Borra el usuario y lo saca de `followers` y `following` de los demás. */
  async deleteWithFollows(id: string, session: ClientSession): Promise<void> {
    const user = new ObjectId(id);

    // simplificación: sin índice en esos arrays, recorre users; vale hasta miles.
    await this.users.updateMany(
      { $or: [{ followers: user }, { following: user }] },
      {
        $pull: { followers: user, following: user },
        $set: { updatedAt: new Date() },
      },
      { session },
    );
    await this.users.deleteOne({ _id: user }, { session });
  }
}
