/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '../../index';
import {HttpTestingController, provideHttpClientTesting} from '../index';
import {provideHttpClient, withJsonpSupport} from '../../src/provider';
import {TestBed} from '@angular/core/testing';

describe('HttpClientTestingBackend with JSONP support', () => {
  let client: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withJsonpSupport()), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
  });

  it('should capture JSONP requests instead of sending them through the real JSONP backend', () => {
    let resp: unknown;
    client.jsonp('https://example.com/api', 'callback').subscribe((body) => {
      resp = body;
    });

    const req = backend.expectOne((r) => r.method === 'JSONP');
    expect(req.request.url).toBe('https://example.com/api');
    req.flush({id: 1});

    expect(resp).toEqual({id: 1});
  });

  it('should match JSONP requests by URL including the callback placeholder', () => {
    let resp: unknown;
    client.jsonp('https://example.com/api', 'callback').subscribe((body) => {
      resp = body;
    });

    backend
      .expectOne({method: 'JSONP', url: 'https://example.com/api?callback=JSONP_CALLBACK'})
      .flush({id: 1});

    expect(resp).toEqual({id: 1});
  });
});
