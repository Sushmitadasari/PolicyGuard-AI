const axios = require('axios');

async function test() {
  try {
    // Register user
    const regRes = await axios.post('http://localhost:3000/auth/register', {
      email: 'testuser999@test.com',
      password: 'Test123456!'
    }).catch(e => e.response);

    console.log('Register response:', regRes.status);

    // Login
    const loginRes = await axios.post('http://localhost:3000/auth/login', {
      email: 'testuser999@test.com',
      password: 'Test123456!'
    }).catch(e => e.response);

    console.log('Login response:', loginRes.status);
    const token = loginRes.data.token;
    console.log('Token obtained:', token.substring(0, 20) + '...\n');

    // Get history
    const histRes = await axios.get('http://localhost:3000/history', {
      headers: { Authorization: 'Bearer ' + token }
    });

    console.log('=== GET /history Response Structure ===');
    console.log('Status:', histRes.status);
    console.log('Count:', histRes.data.count);
    console.log('Items length:', histRes.data.items.length);

    if (histRes.data.items.length > 0) {
      console.log('\n=== First Item in History ===');
      console.log(JSON.stringify(histRes.data.items[0], null, 2));
    } else {
      console.log('\n(No items in history yet - this is expected for new user)');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
