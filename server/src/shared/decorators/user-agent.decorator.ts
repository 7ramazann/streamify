import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { Request } from 'express'

/**
 * Custom decorator to extract the "User-Agent" string from incoming HTTP or GraphQL requests.
 * 
 * This decorator is useful when you want to analyze client device information (browser, OS, etc.)
 * during actions like login, session tracking, or analytics.
 */
export const UserAgent = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		// Check what type of request this is: HTTP (REST) or GraphQL
		if (ctx.getType() === 'http') {
			// For traditional HTTP requests
			const request = ctx.switchToHttp().getRequest<Request>()

			// Return the User-Agent header from the incoming request
			return request.headers['user-agent']
		}

		// For GraphQL requests, we extract the request object differently
		const context = GqlExecutionContext.create(ctx)

		// GraphQL context also has `req`, which gives us access to headers
		return context.getContext().req.headers['user-agent']
	}
)