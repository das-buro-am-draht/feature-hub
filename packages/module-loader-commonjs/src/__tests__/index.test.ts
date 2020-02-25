/**
 * @jest-environment node
 */

import {RequestInfo, RequestInit} from 'node-fetch';
import ProxyAgent from 'proxy-agent';
import {createCommonJsModuleLoader, loadCommonJsModule} from '..';

let mockResponse: string;
let requestUrl: RequestInfo;
let requestInitOptions: RequestInit;

// tslint:disable promise-function-async
jest.mock('node-fetch', () => (url: RequestInfo, options: RequestInit) => {
  requestInitOptions = options;
  requestUrl = url;

  return Promise.resolve({
    text: () => Promise.resolve(Buffer.from(mockResponse))
  });
});
// tslint:enable promise-function-async

describe('loadCommonJsModule (on Node.js)', () => {
  it('when a module is fetched successfully', async () => {
    const url = 'http://example.com/test.js';

    mockResponse = `
			var semver = require('semver');
			module.exports = {
				default: {test: semver.coerce('1').version}
			};
		`;

    const loadedModule = await loadCommonJsModule(url);
    const expectedModule = {default: {test: '1.0.0'}};

    expect(loadedModule).toEqual(expectedModule);
  });
});

describe('createCommonJsModuleLoader', () => {
  it('creates a CommonJS module loader with custom-defined externals', async () => {
    const url = 'http://example.com/test.js';

    mockResponse = `
			var foo = require('foo');
			module.exports = {
				default: {test: foo()}
			};
		`;

    const loadCommonJsModuleWithExternals = createCommonJsModuleLoader({
      foo: () => 42
    });

    const loadedModule = await loadCommonJsModuleWithExternals(url);
    const expectedModule = {default: {test: 42}};

    expect(loadedModule).toEqual(expectedModule);
  });

  it('sets agent if process.env.HTTP_PROXY is defined', async () => {
    const currentHttpProxy = process.env.HTTP_PROXY;
    const url = 'http://example.com/test.js';

    process.env.HTTP_PROXY = 'http://';
    mockResponse = `
			var foo = require('foo');
			module.exports = {
				default: {test: foo()}
			};
		`;

    const loadCommonJsModuleWithExternals = createCommonJsModuleLoader({
      foo: () => 42
    });

    const loadedModule = await loadCommonJsModuleWithExternals(url);
    const expectedModule = {default: {test: 42}};

    expect(loadedModule).toEqual(expectedModule);
    expect(requestUrl).toEqual(url);
    expect(requestInitOptions).toEqual({agent: new ProxyAgent('http://')});

    process.env.HTTP_PROXY = currentHttpProxy;
  });
});
