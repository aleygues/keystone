import type { IncomingMessage, ServerResponse, Server } from 'http';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import type { Config } from 'apollo-server-express';
import type { CreateContext, GraphQLConfig, SessionStrategy } from '../../types';
import { createSessionContext } from '../../session';

export const createApolloServerMicro = ({
  graphQLSchema,
  createContext,
  httpServer,
  sessionStrategy,
  graphqlConfig,
  connectionPromise,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  httpServer: Server;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
  connectionPromise: Promise<any>;
}) => {
  const context = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
    await connectionPromise;
    return createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
  };
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig, httpServer });
  return new ApolloServerMicro({ ...serverConfig, context });
};

export const createApolloServerExpress = ({
  graphQLSchema,
  createContext,
  httpServer,
  sessionStrategy,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  httpServer: Server;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
}) => {
  const context = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
    createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig, httpServer });
  return new ApolloServerExpress({ ...serverConfig, context });
};

const _createApolloServerConfig = ({
  graphQLSchema,
  graphqlConfig,
  httpServer,
}: {
  graphQLSchema: GraphQLSchema;
  graphqlConfig?: GraphQLConfig;
  httpServer: Server;
}) => {
  //const apolloConfig = graphqlConfig?.apolloConfig;
  const apolloConfig = _getApolloConfig(graphqlConfig, graphQLSchema, httpServer);

  return {
    schema: graphQLSchema,
    debug: graphqlConfig?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
    ...apolloConfig,
    formatError: formatError(graphqlConfig, graphQLSchema, httpServer),
  };
};

const formatError = (
  graphqlConfig: GraphQLConfig | undefined,
  graphQLSchema: GraphQLSchema,
  httpServer: Server
) => {
  return (err: GraphQLError) => {
    let debug = graphqlConfig?.debug;
    if (debug === undefined) {
      debug = process.env.NODE_ENV !== 'production';
    }

    if (!debug && err.extensions) {
      // Strip out any `debug` extensions
      delete err.extensions.debug;
      delete err.extensions.exception;
    }

    const apolloConfig = _getApolloConfig(graphqlConfig, graphQLSchema, httpServer);
    if (apolloConfig?.formatError) {
      return apolloConfig.formatError(err);
    } else {
      return err;
    }
  };
};

const _getApolloConfig = (
  graphqlConfig: GraphQLConfig | undefined,
  graphQLSchema: GraphQLSchema,
  httpServer: Server
): Config | undefined => {
  if (graphqlConfig?.apolloConfig) {
    return typeof graphqlConfig.apolloConfig === 'function'
      ? graphqlConfig.apolloConfig(graphQLSchema, httpServer)
      : graphqlConfig.apolloConfig;
  } else {
    return undefined;
  }
};
