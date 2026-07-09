import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import type { Response } from 'express';

import { contract } from '../../integrations/orpc/orpc.contract.js';
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
          return await this.authService.register(
            input,
            this.response(context.request.res),
          );
        } catch (error) {
          if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000
          ) {
            throw errors.DUPLICATE_ACCOUNT();
          }
          throw error;
        }
      },
    );
  }

  @Implement(contract.auth.login)
  login() {
    return implement(contract.auth.login).handler(async ({ input, context }) =>
      this.authService.login(input, this.response(context.request.res)),
    );
  }

  @Implement(contract.auth.me)
  me() {
    return implement(contract.auth.me).handler(async ({ context }) =>
      this.authService.getMe(this.authSession.requireUser(context.request).id),
    );
  }

  @Implement(contract.auth.changePassword)
  changePassword() {
    return implement(contract.auth.changePassword).handler(
      async ({ input, context }) =>
        this.authService.changePassword(
          this.authSession.requireUser(context.request).id,
          input,
        ),
    );
  }

  @Implement(contract.auth.logout)
  logout() {
    return implement(contract.auth.logout).handler(async ({ context }) => {
      this.authSession.requireUser(context.request);
      return this.authService.logout(this.response(context.request.res));
    });
  }
}
