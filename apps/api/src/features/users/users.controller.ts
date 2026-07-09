import { userPublicSchema } from '@logpose/contracts/common/user.schemas';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';
import { AuthSessionService } from '../auth/auth-session.service.js';
import { handleUsersError } from './users.errors.js';
import { UsersService } from './users.service.js';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSession: AuthSessionService,
  ) {}

  /** Rutas estáticas antes de `/{id}` — si no, `/ranking` matchea como id. */
  @Implement(contract.users.list)
  list() {
    return implement(contract.users.list).handler(
      async ({ context, errors }) => {
        try {
          const viewer = this.authSession.requireUser(context.request);
          return await this.usersService.list(viewer.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.ranking)
  ranking() {
    return implement(contract.users.ranking).handler(
      async ({ context, errors }) => {
        try {
          this.authSession.requireUser(context.request);
          return await this.usersService.ranking();
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getStats)
  getStats() {
    return implement(contract.users.getStats).handler(
      async ({ input, errors }) => {
        try {
          return await this.usersService.getStats(input.params.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getFollowers)
  getFollowers() {
    return implement(contract.users.getFollowers).handler(
      async ({ input, errors }) => {
        try {
          return await this.usersService.getFollowers(input.params.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getFollowing)
  getFollowing() {
    return implement(contract.users.getFollowing).handler(
      async ({ input, errors }) => {
        try {
          return await this.usersService.getFollowing(input.params.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getPosts)
  getPosts() {
    return implement(contract.users.getPosts).handler(
      async ({ input, context, errors }) => {
        try {
          return await this.usersService.getPosts(
            input.params.id,
            context.request.user?.id,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getLikedPosts)
  getLikedPosts() {
    return implement(contract.users.getLikedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          return await this.usersService.getLikedPosts(
            input.params.id,
            context.request.user?.id,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getBookmarkedPosts)
  getBookmarkedPosts() {
    return implement(contract.users.getBookmarkedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          return await this.usersService.getBookmarkedPosts(
            input.params.id,
            context.request.user?.id,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getCommentedPosts)
  getCommentedPosts() {
    return implement(contract.users.getCommentedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          return await this.usersService.getCommentedPosts(
            input.params.id,
            context.request.user?.id,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.getById)
  getById() {
    return implement(contract.users.getById).handler(async ({ input }) => {
      const user = await this.usersService.getById(input.params.id);

      return parseOrThrow(userPublicSchema, user, throwContractOutputInvalid);
    });
  }

  @Implement(contract.users.follow)
  follow() {
    return implement(contract.users.follow).handler(
      async ({ input, context, errors }) => {
        try {
          const viewer = this.authSession.requireUser(context.request);
          return await this.usersService.follow(viewer.id, input.params.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.unfollow)
  unfollow() {
    return implement(contract.users.unfollow).handler(
      async ({ input, context, errors }) => {
        try {
          const viewer = this.authSession.requireUser(context.request);
          return await this.usersService.unfollow(viewer.id, input.params.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.update)
  update() {
    return implement(contract.users.update).handler(
      async ({ input, context, errors }) => {
        try {
          const viewer = this.authSession.requireUser(context.request);
          const user = await this.usersService.update(
            input.params.id,
            viewer.id,
            input.body,
          );

          return parseOrThrow(
            userPublicSchema,
            user,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.delete)
  deleteUser() {
    return implement(contract.users.delete).handler(
      async ({ input, context, errors }) => {
        try {
          const viewer = this.authSession.requireUser(context.request);
          return await this.usersService.delete(input.params.id, viewer.id);
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }
}
