import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { contract } from '../../integrations/orpc/orpc.contract.js';
import { requireViewer } from '../../integrations/orpc/orpc-context.js';
import { Public } from '../auth/public.decorator.js';
import { UsersService } from './users.service.js';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Rutas estáticas antes de `/{id}` — si no, `/ranking` matchea como id. */
  @Implement(contract.users.list)
  list() {
    return implement(contract.users.list).handler(({ context }) =>
      this.usersService.list(requireViewer(context.request)),
    );
  }

  @Implement(contract.users.ranking)
  ranking() {
    return implement(contract.users.ranking).handler(() =>
      this.usersService.ranking(),
    );
  }

  @Public()
  @Implement(contract.users.getStats)
  getStats() {
    return implement(contract.users.getStats).handler(({ input }) =>
      this.usersService.getStats(input.params.id),
    );
  }

  @Public()
  @Implement(contract.users.getFollowers)
  getFollowers() {
    return implement(contract.users.getFollowers).handler(({ input }) =>
      this.usersService.getFollowers(input.params.id),
    );
  }

  @Public()
  @Implement(contract.users.getFollowing)
  getFollowing() {
    return implement(contract.users.getFollowing).handler(({ input }) =>
      this.usersService.getFollowing(input.params.id),
    );
  }

  @Public()
  @Implement(contract.users.getPosts)
  getPosts() {
    return implement(contract.users.getPosts).handler(({ input, context }) =>
      this.usersService.getPosts(input.params.id, context.request.viewer),
    );
  }

  @Public()
  @Implement(contract.users.getLikedPosts)
  getLikedPosts() {
    return implement(contract.users.getLikedPosts).handler(
      ({ input, context }) =>
        this.usersService.getLikedPosts(
          input.params.id,
          context.request.viewer,
        ),
    );
  }

  @Public()
  @Implement(contract.users.getBookmarkedPosts)
  getBookmarkedPosts() {
    return implement(contract.users.getBookmarkedPosts).handler(
      ({ input, context }) =>
        this.usersService.getBookmarkedPosts(
          input.params.id,
          context.request.viewer,
        ),
    );
  }

  @Public()
  @Implement(contract.users.getCommentedPosts)
  getCommentedPosts() {
    return implement(contract.users.getCommentedPosts).handler(
      ({ input, context }) =>
        this.usersService.getCommentedPosts(
          input.params.id,
          context.request.viewer,
        ),
    );
  }

  @Public()
  @Implement(contract.users.getById)
  getById() {
    return implement(contract.users.getById).handler(({ input, context }) =>
      this.usersService.getById(input.params.id, context.request.viewer),
    );
  }

  @Implement(contract.users.follow)
  follow() {
    return implement(contract.users.follow).handler(({ input, context }) =>
      this.usersService.follow(
        requireViewer(context.request).id,
        input.params.id,
      ),
    );
  }

  @Implement(contract.users.unfollow)
  unfollow() {
    return implement(contract.users.unfollow).handler(({ input, context }) =>
      this.usersService.unfollow(
        requireViewer(context.request).id,
        input.params.id,
      ),
    );
  }

  @Implement(contract.users.update)
  update() {
    return implement(contract.users.update).handler(({ input, context }) =>
      this.usersService.update(
        input.params.id,
        requireViewer(context.request),
        input.body,
      ),
    );
  }

  @Implement(contract.users.delete)
  deleteUser() {
    return implement(contract.users.delete).handler(({ input, context }) =>
      this.usersService.delete(input.params.id, requireViewer(context.request)),
    );
  }

  @Implement(contract.users.updatePreferences)
  updatePreferences() {
    return implement(contract.users.updatePreferences).handler(
      ({ input, context }) =>
        this.usersService.updatePreferences(
          input.params.id,
          requireViewer(context.request),
          input.body,
        ),
    );
  }

  @Implement(contract.users.verify)
  verify() {
    return implement(contract.users.verify).handler(({ input, context }) =>
      this.usersService.verify(input.params.id, requireViewer(context.request)),
    );
  }

  @Implement(contract.users.unverify)
  unverify() {
    return implement(contract.users.unverify).handler(({ input, context }) =>
      this.usersService.unverify(
        input.params.id,
        requireViewer(context.request),
      ),
    );
  }
}
