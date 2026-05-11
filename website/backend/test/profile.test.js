import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

let authToken = '';
let userId = '';

test('Profile Feature Tests', async (t) => {
  await t.test('1. Register a test user', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Profile User',
        email: `testprofile-${Date.now()}@example.com`,
        password: 'TestPassword123',
      }),
    });

    assert.strictEqual(res.status, 201, 'Should register successfully');
    const data = await res.json();
    assert.ok(data.token, 'Should return auth token');
    assert.ok(data.user.id, 'Should return user ID');
    authToken = data.token;
    userId = data.user.id;
  });

  await t.test('2. Get current user profile', async () => {
    assert.ok(authToken, 'Auth token should exist from previous test');
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    assert.strictEqual(res.status, 200, 'Should fetch profile');
    const data = await res.json();
    assert.ok(data.user, 'Should return user object');
    assert.ok(data.user.name, 'Should have name');
    assert.ok(data.user.email, 'Should have email');
    assert.ok(data.user.role, 'Should have role');
    assert.ok(data.user.accountStatus, 'Should have accountStatus');
    assert.ok(data.user.joinedAt, 'Should have joinedAt date');
  });

  await t.test('3. Update profile', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Profile Name',
        phone: '+1-555-0123',
        organization: 'Test Organization',
      }),
    });

    assert.strictEqual(res.status, 200, 'Should update profile successfully');
    const data = await res.json();
    assert.ok(data.user, 'Should return updated user object');
    assert.strictEqual(data.user.name, 'Updated Profile Name', 'Name should be updated');
    assert.strictEqual(data.user.phone, '+1-555-0123', 'Phone should be updated');
    assert.strictEqual(data.user.organization, 'Test Organization', 'Organization should be updated');
  });

  await t.test('4. Change password - missing fields', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword123',
      }),
    });

    assert.strictEqual(res.status, 400, 'Should fail without all fields');
  });

  await t.test('5. Change password - mismatched passwords', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      }),
    });

    assert.strictEqual(res.status, 400, 'Should fail if passwords do not match');
  });

  await t.test('6. Change password - short password', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword123',
        newPassword: 'Short1',
        confirmPassword: 'Short1',
      }),
    });

    assert.strictEqual(res.status, 400, 'Should fail for short password');
  });

  await t.test('7. Change password - wrong current password', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'WrongPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    });

    assert.strictEqual(res.status, 401, 'Should fail with wrong current password');
  });

  await t.test('8. Change password - success', async () => {
    assert.ok(authToken, 'Auth token should exist');
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    });

    assert.strictEqual(res.status, 200, 'Should change password successfully');
    const data = await res.json();
    assert.ok(data.success, 'Should return success flag');
  });

  await t.test('9. Verify old password no longer works', async () => {
    const email = `testprofile-${Date.now()}@example.com`;
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Test User',
        email: `another-${Date.now()}@example.com`,
        password: 'TestPassword123',
      }),
    });

    const registerData = await registerRes.json();
    const userEmail = registerData.user.email;

    // Try to login with new password (should fail)
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'OldPassword',
      }),
    });

    assert.strictEqual(loginRes.status, 401, 'Old password should not work');
  });

  await t.test('10. Unauthorized access without token', async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    assert.strictEqual(res.status, 401, 'Should deny access without token');
  });
});
