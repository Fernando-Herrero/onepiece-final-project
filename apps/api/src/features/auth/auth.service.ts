import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import bcrypt from 'bcrypt';
import type { Response } from 'express';

import { serializeUser, type UserDocument } from '../users/user.mappers.js';
import { UsersPersistence } from '../users/users.persistence.js';
import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';
import { AuthSessionService } from './auth-session.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authSession: AuthSessionService,
    private readonly usersPersistence: UsersPersistence,
  ) {}

  async register(
    input: {
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      avatar: string;
      displayName?: string;
      bio?: string;
      coverImage?: string;
      phoneNumber?: string;
      address?: string;
      privacy?: UserDocument['privacy'];
    },
    res: Response,
  ) {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await this.usersPersistence.insert({
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
      avatar: input.avatar,
      displayName: input.displayName,
      bio: input.bio,
      coverImage: input.coverImage,
      phoneNumber: input.phoneNumber,
      address: input.address,
      privacy: input.privacy ?? {
        showPosts: true,
        showLikes: true,
        showBookmarked: true,
        showComments: true,
      },
      role: 'user',
      verified: false,
      isActive: true,
      experience: 0,
      serieProgress: { saga: 0, arc: 0, episode: 0 },
      unlockedCards: {
        characters: [],
        items: [],
        fruits: [],
        swords: [],
        boats: [],
      },
      completedEpisodes: [],
      followers: [],
      following: [],
    });

    setSessionCookie(res, this.authSession.signToken(newUser._id.toString()));

    return { user: serializeUser(newUser) };
  }

  async login(input: { email: string; password: string }, res: Response) {
    const user = await this.usersPersistence.findByEmail(input.email, true);
    const valid = user
      ? await bcrypt.compare(input.password, user.password)
      : false;

    if (!user || !valid) {
      throw new ORPCError('INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new ORPCError('ACCOUNT_INACTIVE');
    }

    setSessionCookie(res, this.authSession.signToken(user._id.toString()));

    return { user: serializeUser(user) };
  }

  async getMe(userId: string) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeUser(user);
  }

  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const isCurrentValid = await bcrypt.compare(
      input.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw new ORPCError('INVALID_CURRENT_PASSWORD');
    }

    await this.usersPersistence.updatePassword(
      userId,
      await bcrypt.hash(input.newPassword, 10),
    );

    return { message: 'Password changed successfully' };
  }

  logout(res: Response) {
    clearSessionCookie(res);
    return { message: 'Logout successful' };
  }
}
