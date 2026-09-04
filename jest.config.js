module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.js',
    '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.js',
  },
};
