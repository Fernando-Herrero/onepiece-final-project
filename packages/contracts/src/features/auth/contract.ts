import { oc } from '@orpc/contract';
import { createUserSchema, userPublicSchema } from '../../common/user.schemas.js';
import {
  authMessageSchema,
  authSessionSchema,
  changePasswordSchema,
  loginSchema,
} from './schemas.js';

export const authErrors = {
  INVALID_CREDENTIALS: {
    status: 401,
    message: 'Invalid email or password',
  },
  UNAUTHORIZED: {
    status: 401,
    message: 'No authorized, no user found',
  },
  ACCOUNT_INACTIVE: {
    status: 403,
    message: 'Account is not active',
  },
  USER_NOT_FOUND: {
    status: 404,
    message: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    status: 401,
    message: 'Invalid current password',
  },
} as const;

export const authContract = oc
  .tag('Auth')
  .prefix('/auth')
  .router({
    register: oc
      .route({
        method: 'POST',
        path: '/register',
        description: 'Register a new user',
      })
      .input(createUserSchema)
      .output(authSessionSchema),

    login: oc
      .route({
        method: 'POST',
        path: '/login',
        description: 'Login with email and password',
      })
      .input(loginSchema)
      .errors(authErrors)
      .output(authSessionSchema),

    me: oc
      .route({
        method: 'GET',
        path: '/me',
        description: 'Get current authenticated user',
      })
      .errors(authErrors)
      .output(userPublicSchema),

    changePassword: oc
      .route({
        method: 'PATCH',
        path: '/change-password',
        description: 'Change password for authenticated user',
      })
      .input(changePasswordSchema)
      .errors(authErrors)
      .output(authMessageSchema),

    logout: oc
      .route({
        method: 'POST',
        path: '/logout',
        description: 'Logout current session',
      })
      .errors(authErrors)
      .output(authMessageSchema),
  });
