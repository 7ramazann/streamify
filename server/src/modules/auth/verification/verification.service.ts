import { PrismaService } from '@/core/prisma/prisma.service';
import { MailService } from '@/modules/libs/mail/mail.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationInput } from './inputs/verification.input';
import { TokenType, User } from '@prisma/client';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';
import { saveSession } from '@/shared/utils/session.util';
import type { Request } from 'express'
import { generateToken } from '@/shared/utils/generate-token.util';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailSerivce: MailService
  ) {}

  async verify(req: Request, input: VerificationInput, userAgent: string) {
    const { token } = input
    const existingToken = await this.prismaService.token.findUnique({ where: { token, type: TokenType.EMAIL_VERIFY } })
    if (!existingToken) throw new NotFoundException('Токен не найден')
    if (new Date(existingToken.expiresIn) < new Date()) throw new BadRequestException('Токен истёк')

    const user = await this.prismaService.user.update({
      where: { id: existingToken.userId! },
      data: { isEmailVerified: true }
    })

    await this.prismaService.token.delete({ where: { id: existingToken.id } })

    const metadata = getSessionMetadata(req, userAgent)
    return saveSession(req, user, metadata)
  }

  async sendVerificationToken(user: User) {
    const verificationToken = await generateToken(this.prismaService, user, TokenType.EMAIL_VERIFY)
    await this.mailSerivce.sendVerificationToken(user.email, verificationToken.token)
    return true
  }
}

