// Manual Jest mock for `@/src/services/axiosClient`.
// Prevents Jest from importing the real axios client (which pulls in Expo ESM modules like `expo-sqlite`).

const axiosClient: any = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
  defaults: {
    baseURL: 'local://api',
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default axiosClient;

