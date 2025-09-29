// Simple API connectivity test
export const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    console.log('API Connection Test:', data);
    return data;
  } catch (error) {
    console.error('API Connection Failed:', error);
    console.log('Make sure backend is running on port 3001');
    console.log('Backend should be configured for frontend on port 8080 (Vite default)');
    return null;
  }
};

// Test function to verify backend is running
export const checkBackendHealth = () => {
  testApiConnection().then(result => {
    if (result) {
      console.log('✅ Backend is running and accessible');
    } else {
      console.log('❌ Backend is not accessible. Please start the backend server.');
      console.log('Run: cd backend && npm run dev');
    }
  });
};