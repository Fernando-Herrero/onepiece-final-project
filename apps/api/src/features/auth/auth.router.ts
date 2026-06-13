import type { IncomingHttpHeaders } from 'node:http';

import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { User, type UserDoc } from '../users/user.model.js';

export type AuthPayload = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

export type ApiContext = {
  headers: IncomingHttpHeaders;
  user?: AuthPayload;
};

const os = implement(contract.auth).$context<ApiContext>();

function serializeUser(user: UserDoc) {
  const doc = user.toObject({ virtuals: true });

  return {
    _id: user._id.toString(),
    username: doc.username,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    displayName: doc.displayName,
    bio: doc.bio,
    phoneNumber: doc.phoneNumber,
    avatar: doc.avatar,
    coverImage: doc.coverImage,
    address: doc.address,
    role: doc.role,
    verified: doc.verified,
    isActive: doc.isActive,
    experience: doc.experience,
    serieProgress: doc.serieProgress,
    unlockedCards: doc.unlockedCards,
    privacy: doc.privacy,
    followers: doc.followers.map(String),
    following: doc.following.map(String),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    fullName: doc.fullName,
  };
}

function signToken(user: UserDoc) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '1h' },
  );
}

const requireAuth = os.middleware(async ({ context, next }) => {
  const token = context.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ORPCError('UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    return next({ context: { ...context, user: decoded } });
  } catch {
    throw new ORPCError('UNAUTHORIZED');
  }
});

const register = os.register.handler(async ({ input }) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  try {
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

    return {
      user: serializeUser(newUser),
      token: signToken(newUser),
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Email or username already exists',
      });
    }
    throw error;
  }
});

const login = os.login.handler(async ({ input }) => {
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

  return {
    user: serializeUser(user),
    token: signToken(user),
  };
});

const me = os.me.use(requireAuth).handler(async ({ context }) => {
  const user = await User.findById(context.user!.id);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  return serializeUser(user);
});

const changePassword = os.changePassword
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const user = await User.findById(context.user!.id).select('+password');

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
  });

const logout = os.logout.use(requireAuth).handler(async () => {
  return { message: 'Logout successful' };
});

export const authRouter = os.router({
  register,
  login,
  me,
  changePassword,
  logout,
});

export const apiRouter = { auth: authRouter };
