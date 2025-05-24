import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import { UserModel } from '@/modules/auth/account/models/user.model';
import { GqlContext } from '@/shared/types/gql-context.types';
import { CreateUserInput } from '@/modules/auth/account/inputs/create-user.input';
import { LoginInput } from './inputs/login.input';

@Resolver('Session')
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => UserModel, { name: 'loginUser' })
  public async loginUser(
    @Context() context: GqlContext,
    @Args('data') input: LoginInput): Promise<UserModel> {
    return this.sessionService.login(context.req, input);
  }

  @Mutation(() => Boolean, { name: 'logoutUser' })
  public async logoutUser(
    @Context() context: GqlContext
  ): Promise<boolean> {
    await this.sessionService.logout(context.req)
    return true
  }
}
