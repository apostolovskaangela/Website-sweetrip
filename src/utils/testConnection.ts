import axiosClient from '@/src/services/axiosClient';

/**
 * Test if the backend server is reachable
 * This can be called to verify connectivity before making actual API calls
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    // Try to reach a simple endpoint (login endpoint without auth)
    const response = await axiosClient.get('/login', {
      validateStatus: (status) => status < 500, // Accept 4xx as "server is reachable"
      timeout: 5000,
    });
    // If we get any response (even 404/405), server is reachable
    return true;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('❌ Cannot reach backend server');
      return false;
    }
    // Other errors (like 404) mean server IS reachable
    return true;
  }
};

