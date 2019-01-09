import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {ServerRendererConfig, validateConfig} from './config';
import {
  ServerRenderer,
  ServerRendererV1,
  ServerRequest
} from './server-renderer-v1';

export interface SharedServerRenderer extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<ServerRendererV1>;
}

export function defineServerRenderer(
  serverRequest: ServerRequest | undefined
): FeatureServiceProviderDefinition {
  return {
    id: 's2:server-renderer',

    create: (env): SharedServerRenderer => {
      const {timeout} =
        validateConfig(env.config) || ({} as ServerRendererConfig);

      const serverRenderer = new ServerRenderer(serverRequest, timeout);

      return {
        '1.0': () => ({featureService: serverRenderer})
      };
    }
  };
}