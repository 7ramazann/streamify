import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { PrismaService } from '@/core/prisma/prisma.service';
import { equal } from 'assert';
import { equals } from 'class-validator';
import { NotFoundError } from 'rxjs';
import { verify } from 'argon2';
import { destroySession, saveSession } from '@/shared/utils/session.util';
import type { Request } from 'express-session'
import { ConfigService } from '@nestjs/config';
import { getSessionMetadata } from '@/shared/utils/session-metadata.util';
import { RedisService } from '@/core/redis/redis.service';
import { GqlContext } from '@/shared/types/gql-context.types';


@Injectable()
export class SessionService {

    constructor(private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ) {}

    public async login(req: Request, input: LoginInput, userAgent: string) {
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
        const metadata = getSessionMetadata(req, userAgent)

        return saveSession(req, user, metadata);
    }


    public async logout(req: Request) {
        return destroySession(req, this.configService);
    }

    public async findByUser({ req }: GqlContext) {
        const userId = req.session.userId
        console.log('userid', userId)
        if (!userId) throw new NotFoundException('User not found')
    
        const keys = await this.redisService.keys('*')
    
        const userSessions: any = []
    
        for (const key of keys) {
            const sessionData = await this.redisService.get(key)
            if (sessionData) {
                const session = JSON.parse(sessionData)
                if (session.userId === userId) {
                    userSessions.push({
                        ...session,
                        id: key.split(':')[1]
                    })
                }
            }
        }
    
        userSessions.sort((a, b) => b.createdAt - a.createdAt)
        console.log('keys', keys)
        console.log('userSessions', userSessions)
        console.log('req.sessionID', req.sessionID)

        return userSessions
        .filter(session => session.id === req.sessionID)
        .map(session => ({
            ...session,
            createdAt: new Date(session.createdAt)
        }));

    }

    public async findCurrent({ req }: GqlContext) {
        const sessionId = req.sessionID
        const data: any = await this.redisService.get(`${this.configService.getOrThrow('SESSION_FOLDER')}${sessionId}`)
        const parsed = JSON.parse(data)

        return {
            ...JSON.parse(data),
            id: sessionId,
            createdAt: new Date(parsed.createdAt)
        }
    }

    public async clearSession(req: Request) {
        req.res.clearCookie(this.configService.getOrThrow('SESSION_NAME'))
        return true
    }

    public async remove({ req }: GqlContext, id: string) {
        if (req.sessionID === id) {
            throw new ConflictException('Cannot delete current session')
        }
    
        await this.redisService.del(
            `${this.configService.getOrThrow('SESSION_FOLDER')}${id}`
        )
    
        return true
    }
}
