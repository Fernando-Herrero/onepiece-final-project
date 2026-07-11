import { postPublicSchema } from '@logpose/contracts/common/post.schemas';
import {
  userPublicSchema,
  userSummarySchema,
} from '@logpose/contracts/common/user.schemas';
import {
  deleteUserOutputSchema,
  followOutputSchema,
  userRankingEntrySchema,
  userStatsSchema,
} from '@logpose/contracts/features/users/schemas';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import * as z from 'zod/v4';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { requireUser } from '../../integrations/orpc/orpc-context.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';
import { Public } from '../auth/public.decorator.js';
import { handleUsersError } from './users.errors.js';
import { UsersService } from './users.service.js';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Rutas estáticas antes de `/{id}` — si no, `/ranking` matchea como id. */
  @Implement(contract.users.list)
  list() {
    return implement(contract.users.list).handler(
      async ({ context, errors }) => {
        try {
          const viewer = requireUser(context.request);
          const users = await this.usersService.list(viewer.id);

          return parseOrThrow(
            z.array(userSummarySchema),
            users,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Implement(contract.users.ranking)
  ranking() {
    return implement(contract.users.ranking).handler(async ({ errors }) => {
      try {
        const users = await this.usersService.ranking();

        return parseOrThrow(
          z.array(userRankingEntrySchema),
          users,
          throwContractOutputInvalid,
        );
      } catch (error) {
        handleUsersError(error, errors);
      }
    });
  }

  @Public()
  @Implement(contract.users.getStats)
  getStats() {
    return implement(contract.users.getStats).handler(
      async ({ input, errors }) => {
        try {
          const stats = await this.usersService.getStats(input.params.id);

          return parseOrThrow(
            userStatsSchema,
            stats,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getFollowers)
  getFollowers() {
    return implement(contract.users.getFollowers).handler(
      async ({ input, errors }) => {
        try {
          const followers = await this.usersService.getFollowers(
            input.params.id,
          );

          return parseOrThrow(
            z.array(userSummarySchema),
            followers,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getFollowing)
  getFollowing() {
    return implement(contract.users.getFollowing).handler(
      async ({ input, errors }) => {
        try {
          const following = await this.usersService.getFollowing(
            input.params.id,
          );

          return parseOrThrow(
            z.array(userSummarySchema),
            following,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getPosts)
  getPosts() {
    return implement(contract.users.getPosts).handler(
      async ({ input, context, errors }) => {
        try {
          const posts = await this.usersService.getPosts(
            input.params.id,
            context.request.user?.id,
          );

          return parseOrThrow(
            z.array(postPublicSchema),
            posts,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getLikedPosts)
  getLikedPosts() {
    return implement(contract.users.getLikedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          const posts = await this.usersService.getLikedPosts(
            input.params.id,
            context.request.user?.id,
          );

          return parseOrThrow(
            z.array(postPublicSchema),
            posts,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getBookmarkedPosts)
  getBookmarkedPosts() {
    return implement(contract.users.getBookmarkedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          const posts = await this.usersService.getBookmarkedPosts(
            input.params.id,
            context.request.user?.id,
          );

          return parseOrThrow(
            z.array(postPublicSchema),
            posts,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getCommentedPosts)
  getCommentedPosts() {
    return implement(contract.users.getCommentedPosts).handler(
      async ({ input, context, errors }) => {
        try {
          const posts = await this.usersService.getCommentedPosts(
            input.params.id,
            context.request.user?.id,
          );

          return parseOrThrow(
            z.array(postPublicSchema),
            posts,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }

  @Public()
  @Implement(contract.users.getById)
  getById() {
    return implement(contract.users.getById).handler(
      async ({ input, errors }) => {
        try {
          const user = await this.usersService.getById(input.params.id);

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

  @Implement(contract.users.follow)
  follow() {
    return implement(contract.users.follow).handler(
      async ({ input, context, errors }) => {
        try {
          const viewer = requireUser(context.request);
          const result = await this.usersService.follow(
            viewer.id,
            input.params.id,
          );

          return parseOrThrow(
            followOutputSchema,
            result,
            throwContractOutputInvalid,
          );
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
          const viewer = requireUser(context.request);
          const result = await this.usersService.unfollow(
            viewer.id,
            input.params.id,
          );

          return parseOrThrow(
            followOutputSchema,
            result,
            throwContractOutputInvalid,
          );
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
          const viewer = requireUser(context.request);
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
          const viewer = requireUser(context.request);
          const result = await this.usersService.delete(
            input.params.id,
            viewer.id,
          );

          return parseOrThrow(
            deleteUserOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleUsersError(error, errors);
        }
      },
    );
  }
}
