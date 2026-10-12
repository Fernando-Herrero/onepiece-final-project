import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import type { Response } from 'express';

import { contract } from '../../integrations/orpc/orpc.contract.js';
import { requireUser } from '../../integrations/orpc/orpc-context.js';
import { AuthService } from './auth.service.js';
import { Public } from './public.decorator.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private response(res: Response | undefined): Response {
    if (!res) {
      throw new Error('Express response is not available on this request');
    }
    return res;
  }

  @Public()
  @Implement(contract.auth.register)
  register() {
    return implement(contract.auth.register).handler(
      ({ input, context, errors }) => {
        if (context.request.user) {
          throw errors.ALREADY_AUTHENTICATED();
        }

        return this.authService.register(
          input,
          this.response(context.request.res),
        );
      },
    );
  }

  @Public()
  @Implement(contract.auth.login)
  login() {
    return implement(contract.auth.login).handler(
      ({ input, context, errors }) => {
        if (context.request.user) {
          throw errors.ALREADY_AUTHENTICATED();
        }

        return this.authService.login(
          input,
          this.response(context.request.res),
        );
      },
    );
  }

  @Implement(contract.auth.me)
  me() {
    return implement(contract.auth.me).handler(({ context }) =>
      this.authService.getMe(requireUser(context.request).id),
    );
  }

  @Implement(contract.auth.changePassword)
  changePassword() {
    return implement(contract.auth.changePassword).handler(
      ({ input, context }) =>
        this.authService.changePassword(requireUser(context.request).id, input),
    );
  }

  @Implement(contract.auth.logout)
  logout() {
    return implement(contract.auth.logout).handler(({ context }) =>
      this.authService.logout(this.response(context.request.res)),
    );
  }
}
