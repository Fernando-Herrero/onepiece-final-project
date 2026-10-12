import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { contract } from '../../integrations/orpc/orpc.contract.js';
import { requireUser } from '../../integrations/orpc/orpc-context.js';
import { Public } from '../auth/public.decorator.js';
import { PostsService } from './posts.service.js';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Implement(contract.posts.list)
  list() {
    return implement(contract.posts.list).handler(({ input, context }) =>
      this.postsService.list(input, context.request.user?.id),
    );
  }

  @Implement(contract.posts.toggleLike)
  toggleLike() {
    return implement(contract.posts.toggleLike).handler(({ input, context }) =>
      this.postsService.toggleLike(
        input.params.id,
        requireUser(context.request).id,
      ),
    );
  }

  @Implement(contract.posts.toggleBookmark)
  toggleBookmark() {
    return implement(contract.posts.toggleBookmark).handler(
      ({ input, context }) =>
        this.postsService.toggleBookmark(
          input.params.id,
          requireUser(context.request).id,
        ),
    );
  }

  @Implement(contract.posts.toggleRetweet)
  toggleRetweet() {
    return implement(contract.posts.toggleRetweet).handler(
      ({ input, context }) =>
        this.postsService.toggleRetweet(
          input.params.id,
          requireUser(context.request).id,
        ),
    );
  }

  @Implement(contract.posts.create)
  create() {
    return implement(contract.posts.create).handler(({ input, context }) =>
      this.postsService.create(requireUser(context.request).id, input),
    );
  }

  @Implement(contract.posts.delete)
  delete() {
    return implement(contract.posts.delete).handler(({ input, context }) =>
      this.postsService.delete(
        input.params.id,
        requireUser(context.request).id,
      ),
    );
  }
}
