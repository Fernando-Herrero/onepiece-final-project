import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ORPCError } from '@orpc/server';
import bcrypt from 'bcrypt';
import type { Response } from 'express';
import mongoose from 'mongoose';

import type { ServerEnv } from '../../integrations/env/server.js';
import { serializeUser, User, type UserDoc } from '../users/user.model.js';
import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';
import { AuthSessionService } from './auth-session.service.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService<ServerEnv, true>,
    private readonly authSession: AuthSessionService,
  ) {}

  async onModuleInit() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(this.config.get('MONGODB_URI', { infer: true }));
    }
  }

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
      privacy?: UserDoc['privacy'];
    },
    res: Response,
  ) {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await User.create({
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
      privacy: input.privacy,
    });

    setSessionCookie(res, this.authSession.signToken(newUser._id.toString()));

    return { user: serializeUser(newUser) };
  }

  async login(input: { email: string; password: string }, res: Response) {
    const user = await User.findOne({ email: input.email }).select('+password');
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
    const user = await User.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeUser(user);
  }

  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string },
  ) {
    const user = await User.findById(userId).select('+password');

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

    user.password = await bcrypt.hash(input.newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  logout(res: Response) {
    clearSessionCookie(res);
    return { message: 'Logout successful' };
  }
}
