import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import { UserModel } from '@/modules/auth/account/models/user.model';
import { GqlContext } from '@/shared/types/gql-context.types';
import { LoginInput } from './inputs/login.input';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { Authorization } from '@/shared/decorators/auth.decorator';
import { SessionModel } from '@/modules/auth/account/models/session.model';
import { ConflictException, Req } from '@nestjs/common';
import { ForbiddenError } from '@nestjs/apollo';
import { NotFoundError } from 'rxjs/internal/util/NotFoundError';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';
import { MailService } from '@/modules/libs/mail/mail.service';

@Resolver('Session')
export class SessionResolver {
  constructor(
    private readonly sessionService: SessionService,
    private readonly mailService: MailService
  ) {}

  @Mutation(() => UserModel)
  loginUser(
    @Args('data') input: LoginInput,
    @UserAgent() userAgent: string, 
    @Context() { req }: GqlContext
  ) {
    return this.sessionService.login(req, input, userAgent)
  }

  @Mutation(() => Boolean, { name: 'logoutUser' })
  public async logoutUser(
    @Context() context: GqlContext
  ): Promise<boolean> {
    await this.sessionService.logout(context.req)
    return true
  }

  @Authorization()
  @Mutation(() => Boolean)
  public async removeSession(
    @Args('id') id: string,
    @Context() req: GqlContext
  ): Promise<boolean> {
    try {
      return await this.sessionService.remove(req, id);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ForbiddenError('Cannot delete current session');
      }
      throw new NotFoundError('Session not found');
    }
  }

  @Authorization()
  @Query(() => [SessionModel])
  public async findSessionsByUser(
    @Context() req: GqlContext
  ) {
    try {
      return await this.sessionService.findByUser(req);
    } catch (error) {
      throw new NotFoundError('No sessions found');
    }
  }

  @Authorization()
  @Query(() => SessionModel)
  public async findCurrentSession(
    @Context() req: GqlContext
  ) {
    try {
      return await this.sessionService.findCurrent(req);
    } catch {
      throw new NotFoundError('Current session not found');
    }
  }

  @Authorization()
  @Mutation(() => Boolean)
  public async clearSessionCookie(
    @Context() req: GqlContext
  ): Promise<boolean> {
    await this.sessionService.clearSession(req)
    return true
  }

// mailing
@Mutation(() => Boolean)
async sendTestEmail(@Args('email') email: string) {
  await this.sessionService.sendWelcomeEmail(email, 'TestUser')
  return true;
}


// just for test email templates
@Mutation(() => Boolean)
async sendTestVerificationEmail(@Args('email') email: string, @Context() { req }: GqlContext) {
  const token = 'test-verification-token';
  const userAgent = req.headers['user-agent'] as string;
  const metadata = getSessionMetadata(req, userAgent);
  await this.mailService.sendVerificationToken(email, token);
  return true;
}

@Mutation(() => Boolean)
async sendTestPasswordRecoveryEmail(@Args('email') email: string, @Context() { req }: GqlContext) {
  const token = 'test-reset-token';
  const userAgent = req.headers['user-agent'] as string;
  const metadata = getSessionMetadata(req, userAgent);
  await this.mailService.sendPasswordResetToken(email, token, metadata);
  return true;
}

@Mutation(() => Boolean)
async sendTestDeactivateEmail(@Args('email') email: string, @Context() { req }: GqlContext) {
  const token = 'test-deactivation-token';
  const userAgent = req.headers['user-agent'] as string;
  const metadata = getSessionMetadata(req, userAgent);
  await this.mailService.sendDeactivateToken(email, token, metadata);
  return true;
}

@Mutation(() => Boolean)
async sendTestAccountDeletionEmail(@Args('email') email: string) {
  await this.mailService.sendAcccountDeletion(email);
  return true;
}

@Mutation(() => Boolean)
async sendTestEnableTwoFactorEmail(@Args('email') email: string) {
  await this.mailService.sendEnableTwoFactor(email);
  return true;
}

@Mutation(() => Boolean)
async sendTestVerifyChannelEmail(@Args('email') email: string) {
  await this.mailService.sendVerifyChannel(email);
  return true;
}




}
