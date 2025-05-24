import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { PrismaService } from '@/core/prisma/prisma.service';
import { equal } from 'assert';
import { equals } from 'class-validator';
import { NotFoundError } from 'rxjs';
import { verify } from 'argon2';
import { destroySession, saveSession } from '@/shared/utils/session.util';
import type { Request } from 'express-session'
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SessionService {

    constructor(private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {}

    public async login(req: Request, input: LoginInput) {
        const {login, password} = input;

        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {username: {equals: login}},
                    {email: {equals: login}}
                ]
            }
        })

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isValidPassword = await verify(user.password, password)

        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid email or password')
        }

        const sessionResult: any = await saveSession(req, user);
        return sessionResult.user;
    }


    public async logout(req: Request) {
        return destroySession(req, this.configService);
    }
}
