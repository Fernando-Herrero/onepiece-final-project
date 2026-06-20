import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../../integrations/env/server.js';
import {
  type ApiContext,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { serializeUser, User, type UserDoc } from '../users/user.model.js';
import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';

const os = implement(contract.auth).$context<ApiContext>();

function signToken(user: UserDoc) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '2h' },
  );
}

const register = os.register.handler(async ({ input, context }) => {
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

    setSessionCookie(context.res, signToken(newUser));

    return {
      user: serializeUser(newUser),
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new ORPCError('DUPLICATE_ACCOUNT');
    }
    throw error;
  }
});

const login = os.login.handler(async ({ input, context }) => {
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

  setSessionCookie(context.res, signToken(user));

  return {
    user: serializeUser(user),
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

const logout = os.logout.use(requireAuth).handler(async ({ context }) => {
  clearSessionCookie(context.res);
  return { message: 'Logout successful' };
});

export const authRouter = os.router({
  register,
  login,
  me,
  changePassword,
  logout,
});
