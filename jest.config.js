module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.(ts|tsx|js)',
    '<rootDir>/src/**/*.(spec|test).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/src/__mocks__/react-native-NativeModules.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!@react-native|react-native|@react-native-async-storage)'
  ],
  // Keep `npm test` fast and non-blocking.
  // Use `npm run test:coverage` when you explicitly want coverage.
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.tsx'
  ],
  coverageDirectory: 'coverage',
};
