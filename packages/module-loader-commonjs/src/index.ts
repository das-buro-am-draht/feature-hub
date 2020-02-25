import {ModuleLoader} from '@feature-hub/core';
import createHttpsProxyAgent from 'https-proxy-agent';
import fetch, {RequestInit} from 'node-fetch';

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function createCommonJsModuleLoader(
  externals: Externals = {}
): ModuleLoader {
  return async (url: string): Promise<unknown> => {
    const requestInit: RequestInit = {};

    if (process.env.HTTP_PROXY) {
      requestInit.agent = createHttpsProxyAgent(process.env.HTTP_PROXY);
    }

    const response = await fetch(url, requestInit);
    const source = await response.text();
    const mod = {exports: {}};

    // tslint:disable-next-line:function-constructor
    Function(
      'module',
      'exports',
      'require',
      `${source}
      //# sourceURL=${url}`
    )(mod, mod.exports, (dep: string) =>
      // tslint:disable-next-line:no-eval https://stackoverflow.com/a/41063795/10385541
      externals.hasOwnProperty(dep) ? externals[dep] : eval('require')(dep)
    );

    return mod.exports;
  };
}

export const loadCommonJsModule: ModuleLoader = createCommonJsModuleLoader();
