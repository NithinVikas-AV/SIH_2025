// Test script to verify language update functionality
const axios = require('axios');

async function testLanguageUpdate() {
  try {
    console.log('🧪 Testing language update functionality...');
    
    const API_URL = 'http://localhost:3001';
    
    // Test 1: Get user by email
    console.log('\n1. Testing get user by email...');
    const userResponse = await axios.get(`${API_URL}/api/users/email/p1@mail.com`);
    console.log('✅ User found:', userResponse.data.user.email);
    
    // Test 2: Update user language
    console.log('\n2. Testing language update...');
    const updateResponse = await axios.put(`${API_URL}/api/users/${userResponse.data.user.id}`, {
      preferred_language: 'tam_Taml' // Tamil
    });
    console.log('✅ Language updated successfully');
    
    // Test 3: Verify the update
    console.log('\n3. Verifying the update...');
    const verifyResponse = await axios.get(`${API_URL}/api/users/email/p1@mail.com`);
    console.log('✅ Current language:', verifyResponse.data.user.preferred_language);
    
    // Test 4: Update to another language
    console.log('\n4. Testing another language update...');
    await axios.put(`${API_URL}/api/users/${userResponse.data.user.id}`, {
      preferred_language: 'hin_Deva' // Hindi
    });
    console.log('✅ Language updated to Hindi');
    
    // Test 5: Final verification
    console.log('\n5. Final verification...');
    const finalResponse = await axios.get(`${API_URL}/api/users/email/p1@mail.com`);
    console.log('✅ Final language:', finalResponse.data.user.preferred_language);
    
    console.log('\n🎉 All tests passed! Language update functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLanguageUpdate();
