import { postPublicSchema } from '@logpose/contracts/common/post.schemas';
import {
  listPostsOutputSchema,
  toggleBookmarkOutputSchema,
  toggleLikeOutputSchema,
  toggleRetweetOutputSchema,
} from '@logpose/contracts/features/posts/schemas';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { requireUser } from '../../integrations/orpc/orpc-context.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';
import { Public } from '../auth/public.decorator.js';
import { handlePostsError } from './posts.errors.js';
import { PostsService } from './posts.service.js';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Implement(contract.posts.list)
  list() {
    return implement(contract.posts.list).handler(
      async ({ input, context, errors }) => {
        try {
          const result = await this.postsService.list(
            input,
            context.request.user?.id,
          );

          return parseOrThrow(
            listPostsOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }

  @Implement(contract.posts.toggleLike)
  toggleLike() {
    return implement(contract.posts.toggleLike).handler(
      async ({ input, context, errors }) => {
        try {
          const user = requireUser(context.request);
          const result = await this.postsService.toggleLike(
            input.params.id,
            user.id,
          );

          return parseOrThrow(
            toggleLikeOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }

  @Implement(contract.posts.toggleBookmark)
  toggleBookmark() {
    return implement(contract.posts.toggleBookmark).handler(
      async ({ input, context, errors }) => {
        try {
          const user = requireUser(context.request);
          const result = await this.postsService.toggleBookmark(
            input.params.id,
            user.id,
          );

          return parseOrThrow(
            toggleBookmarkOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }

  @Implement(contract.posts.toggleRetweet)
  toggleRetweet() {
    return implement(contract.posts.toggleRetweet).handler(
      async ({ input, context, errors }) => {
        try {
          const user = requireUser(context.request);
          const result = await this.postsService.toggleRetweet(
            input.params.id,
            user.id,
          );

          return parseOrThrow(
            toggleRetweetOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }

  @Implement(contract.posts.create)
  create() {
    return implement(contract.posts.create).handler(
      async ({ input, context, errors }) => {
        try {
          const user = requireUser(context.request);
          const post = await this.postsService.create(user.id, input);

          return parseOrThrow(
            postPublicSchema,
            post,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }

  @Implement(contract.posts.delete)
  delete() {
    return implement(contract.posts.delete).handler(
      async ({ input, context, errors }) => {
        try {
          const user = requireUser(context.request);
          const post = await this.postsService.delete(input.params.id, user.id);

          return parseOrThrow(
            postPublicSchema,
            post,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handlePostsError(error, errors);
        }
      },
    );
  }
}
