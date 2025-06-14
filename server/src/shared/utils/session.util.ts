// Define saveSession(req, user) to save userId and createdAt to req.session
import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import type { Request } from 'express-session'
import { SessionMetadata } from '../types/session-metadata.types';


export function saveSession(req: Request, user: User, metadata: SessionMetadata) {
  return new Promise((resolve, reject) => {
    console.log('Attempting to save session for user:', user.id); // Debug log
    
    req.session.userId = user.id;
    req.session.createdAt = new Date();
    req.session.metadata = metadata;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error details:', {
          error: err,
          sessionId: req.sessionID,
          redisStatus: req.sessionStore?.client?.status // Check Redis connection state
        });
        return reject(new InternalServerErrorException('Session save failed'));
      }
      console.log('Session saved successfully:', req.sessionID); // Success log
      resolve(user);
    });
  });
}


// Define destroySession(req, configService) to destroy session and clear cookie
export function destroySession(req: Request, configService: ConfigService) {
	return new Promise((resolve, reject) => {
		req.session.destroy(err => {
			if (err) {
				return reject(
					new InternalServerErrorException(
						'Не удалось завершить сессию'
					)
				)
			}

			req.res?.clearCookie(
				configService.getOrThrow<string>('SESSION_NAME')
			)

			resolve(true)
		})
	})
}