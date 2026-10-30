import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFilters, HttpError } from '../api.mjs';

test('demographic values remain SQL parameters, including hostile input', () => {
  const values = ['question'];
  const sql = buildFilters(new URLSearchParams({ state: "CA'); DROP TABLE questions; --", citizenship: 'citizen' }), values);
  assert.equal(sql, ' AND d.state = ANY($2::text[]) AND d.citizenship_status = ANY($3::text[])');
  assert.deepEqual(values[1], ["CA'); DROP TABLE questions; --"]);
});
test('age filters accept the ranges and individual ages used by the app', () => {
  const values = ['question'];
  const params = new URLSearchParams('age=18-25&age=75%2B&age=%3C18&age=32');
  assert.equal(buildFilters(params, values), ' AND (d.age BETWEEN $2 AND $3 OR d.age BETWEEN $4 AND $5 OR d.age BETWEEN $6 AND $7 OR d.age BETWEEN $8 AND $9)');
  assert.deepEqual(values.slice(1), [18, 25, 75, 115, 1, 17, 32, 32]);
});
test('reject invalid ranges and unknown columns', () => {
  for (const query of ['age=100-5', 'age=116', 'age=-1', 'age=1%20OR%201=1', 'password=secret']) {
    assert.throws(() => buildFilters(new URLSearchParams(query), []), HttpError);
  }
});
