import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApi } from '../api.mjs';

test('interrupted Auth response returns an error without crashing the gateway', async () => {
  const server = createApi({ pool: {}, authUrl: 'http://auth.invalid', env: {}, fetchImpl: async () => ({
    status: 200, headers: new Headers({ 'Content-Type': 'application/json' }),
    arrayBuffer: async () => { throw new Error('Interrupted response'); },
  }) });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/auth/v1/settings`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Internal server error' });
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
