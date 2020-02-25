import {ModuleLoader} from '@feature-hub/core';
import {Agent} from 'http';
import fetch, {RequestInit} from 'node-fetch';
import ProxyAgent from 'proxy-agent';

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function createCommonJsModuleLoader(
  externals: Externals = {}
): ModuleLoader {
  return async (url: string): Promise<unknown> => {
    const requestInit: RequestInit = {};

    if (process.env.HTTP_PROXY) {
      requestInit.agent = new ProxyAgent(process.env.HTTP_PROXY) as unknown as Agent;
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
