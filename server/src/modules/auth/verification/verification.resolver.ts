import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { VerificationService } from './verification.service';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { GqlContext } from '@/shared/types/gql-context.types';
import { VerificationInput } from './inputs/verification.input';
import { AuthModel } from '../account/models/auth.model';

@Resolver('Verification')
export class VerificationResolver {
  constructor(private readonly verificationService: VerificationService) {}

  @Mutation(() => AuthModel, { name: 'verifyAccount' })
  public async verify(
    @Context() { req }: GqlContext,
    @Args('data') input: VerificationInput,
    @UserAgent() userAgent: string
  ) {
    console.log('input', input)
    return this.verificationService.verify(req, input, userAgent)
  }

  // @Mutation(() => Boolean, { name: 'createUser' })
  // public async create(@Args('data') input: CreateUserInput): Promise<boolean> {
  //   return this.accountService.create(input);
  // }
}

