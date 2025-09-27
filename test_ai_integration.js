// Test script to verify AI chat integration
const axios = require('axios');

async function testAIChat() {
  try {
    console.log('Testing AI Chat Integration...');
    
    const testMessage = "Hello, I'm feeling anxious today. Can you help me?";
    const language = "tam_Taml";
    
    console.log(`Sending message: "${testMessage}" with language: ${language}`);
    
    const response = await axios.post('http://localhost:3001/chat', {
      message: testMessage,
      language: language
    });
    
    console.log('Response received:');
    console.log(response.data.response);
    console.log('\n✅ AI Chat Integration Test Successful!');
    
  } catch (error) {
    console.error('❌ AI Chat Integration Test Failed:');
    console.error(error.response?.data || error.message);
  }
}

testAIChat();
