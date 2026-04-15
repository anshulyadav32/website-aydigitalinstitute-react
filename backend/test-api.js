// Using built-in fetch from Node 20
const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testUsername = `user_${Date.now()}`;
  const testPassword = 'password123';
  const newPassword = 'newpassword456';
  let authToken = '';

  try {
    // 1. Check Username Availability
    console.log(`1. Checking if username '${testUsername}' is available...`);
    const checkRes = await fetch(`${API_URL}/auth/check-username/${testUsername}`);
    const checkData = await checkRes.json();
    console.log('   Response Status:', checkRes.status);
    console.log('   Response Data:', JSON.stringify(checkData));
    
    if (checkData.available) {
      console.log('✅ Username available.\n');
    } else {
      throw new Error(`❌ Username NOT available: ${checkData.message}`);
    }

    // 2. Register User
    console.log('2. Registering a new user...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        username: testUsername,
        password: testPassword,
        phone: '1234567890'
      })
    });
    const registerData = await registerRes.json();
    if (registerData.success) {
      console.log('✅ Registration successful.');
      authToken = registerData.data.token;
      console.log(`   Registered Email: ${testEmail}`);
      console.log(`   Registered Username: ${testUsername}\n`);
    } else {
      throw new Error(`❌ Registration failed: ${JSON.stringify(registerData)}`);
    }

    // 3. Login with Email
    console.log('3. Logging in with Email...');
    const loginEmailRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: testEmail, password: testPassword })
    });
    const loginEmailData = await loginEmailRes.json();
    if (loginEmailData.success) {
      console.log('✅ Login with email successful.\n');
    } else {
      throw new Error('❌ Login with email failed.');
    }

    // 4. Login with Username
    console.log('4. Logging in with Username...');
    const loginUserRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: testUsername, password: testPassword })
    });
    const loginUserData = await loginUserRes.json();
    if (loginUserData.success) {
      console.log('✅ Login with username successful.\n');
    } else {
      throw new Error('❌ Login with username failed.');
    }

    // 5. Get Profile
    console.log('5. Fetching user profile...');
    const profileRes = await fetch(`${API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileRes.json();
    if (profileData.success && profileData.data.username === testUsername) {
      console.log('✅ Profile fetch successful.\n');
    } else {
      throw new Error('❌ Profile fetch failed.');
    }

    // 6. Update Profile
    const updatedName = 'Updated Test User';
    console.log('6. Updating user profile...');
    const updateRes = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name: updatedName, phone: '0987654321' })
    });
    const updateData = await updateRes.json();
    if (updateData.success && updateData.data.name === updatedName) {
      console.log('✅ Profile update successful.\n');
    } else {
      throw new Error('❌ Profile update failed.');
    }

    // 7. Change Password
    console.log('7. Changing password...');
    const changePwdRes = await fetch(`${API_URL}/user/change-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ currentPassword: testPassword, newPassword: newPassword })
    });
    const changePwdData = await changePwdRes.json();
    if (changePwdData.success) {
      console.log('✅ Password change successful.\n');
    } else {
      throw new Error('❌ Password change failed.');
    }

    // 8. Verify Old Password Login Fails
    console.log('8. Verifying old password fails...');
    const oldLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: testEmail, password: testPassword })
    });
    const oldLoginData = await oldLoginRes.json();
    if (!oldLoginData.success) {
      console.log('✅ Old password login failed (Correct behavior).\n');
    } else {
      throw new Error('❌ Old password login still works! (Security Risk)');
    }

    // 9. Verify New Password Login Works
    console.log('9. Verifying new password works...');
    const newLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: testEmail, password: newPassword })
    });
    const newLoginData = await newLoginRes.json();
    if (newLoginData.success) {
      console.log('✅ New password login successful.\n');
    } else {
      throw new Error('❌ New password login failed.');
    }

    console.log('✨ ALL TESTS PASSED SUCCESSFULLY! ✨');

  } catch (error) {
    console.error(`\n🚨 Test Suite Failed: ${error.message}`);
    process.exit(1);
  }
};

runTests();
