import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { isDev } from '../../shared/utils/is-dev.util';

export function getGraphQLConfig(
  configService: ConfigService,
): ApolloDriverConfig {
  return {
    // Enables GraphQL Playground in dev mode
    playground: isDev(configService),

    // Sets the GraphQL route (e.g., /graphql)
    path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),

    // Auto-generates the schema file
    autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),

    // Organizes schema alphabetically
    sortSchema: true,

    // Passes HTTP request/response to resolvers
    context: ({ req, res }) => ({ req, res }),

    installSubscriptionHandlers: true,
    introspection: true,
  };
}
