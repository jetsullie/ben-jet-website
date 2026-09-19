import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorizedAdmin } from '../functions/_shared/admin-identity.js';

test('both named administrators are authorized, ignoring email case', () => {
  for (const email of ['jetsullivan1@gmail.com', 'benstapleton06@gmail.com', 'BenStapleton06@Gmail.com']) {
    assert.equal(isAuthorizedAdmin(email), true);
  }
});

test('other identities, lookalikes, and missing or malformed claims are denied', () => {
  for (const email of [undefined, null, {}, [], 42, '', 'anyone@gmail.com',
    'benstapleton06@gmail.com.evil.test', 'benstapleton06+other@gmail.com',
    'benstapleton06@gmail.com ', 'jetsullivan@gmail.com']) {
    assert.equal(isAuthorizedAdmin(email), false);
  }
});
