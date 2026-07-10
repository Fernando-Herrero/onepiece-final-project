import { userPublicSchema } from '@logpose/contracts/common/user.schemas';
import {
  authMessageSchema,
  authSessionSchema,
} from '@logpose/contracts/features/auth/schemas';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import type { Response } from 'express';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';
import { handleAuthError } from './auth.errors.js';
import { AuthService } from './auth.service.js';
import { AuthSessionService } from './auth-session.service.js';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSession: AuthSessionService,
  ) {}

  private response(res: Response | undefined): Response {
    if (!res) {
      throw new Error('Express response is not available on this request');
    }
    return res;
  }

  @Implement(contract.auth.register)
  register() {
    return implement(contract.auth.register).handler(
      async ({ input, context, errors }) => {
        try {
          const result = await this.authService.register(
            input,
            this.response(context.request.res),
          );

          return parseOrThrow(
            authSessionSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleAuthError(error, errors);
        }
      },
    );
  }

  @Implement(contract.auth.login)
  login() {
    return implement(contract.auth.login).handler(
      async ({ input, context, errors }) => {
        try {
          const result = await this.authService.login(
            input,
            this.response(context.request.res),
          );

          return parseOrThrow(
            authSessionSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleAuthError(error, errors);
        }
      },
    );
  }

  @Implement(contract.auth.me)
  me() {
    return implement(contract.auth.me).handler(async ({ context, errors }) => {
      try {
        const user = await this.authService.getMe(
          this.authSession.requireUser(context.request).id,
        );

        return parseOrThrow(userPublicSchema, user, throwContractOutputInvalid);
      } catch (error) {
        handleAuthError(error, errors);
      }
    });
  }

  @Implement(contract.auth.changePassword)
  changePassword() {
    return implement(contract.auth.changePassword).handler(
      async ({ input, context, errors }) => {
        try {
          const result = await this.authService.changePassword(
            this.authSession.requireUser(context.request).id,
            input,
          );

          return parseOrThrow(
            authMessageSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleAuthError(error, errors);
        }
      },
    );
  }

  @Implement(contract.auth.logout)
  logout() {
    return implement(contract.auth.logout).handler(
      async ({ context, errors }) => {
        try {
          this.authSession.requireUser(context.request);
          const result = await this.authService.logout(
            this.response(context.request.res),
          );

          return parseOrThrow(
            authMessageSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleAuthError(error, errors);
        }
      },
    );
  }
}
