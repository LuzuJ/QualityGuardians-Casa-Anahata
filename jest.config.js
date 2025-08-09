module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/jest.setup.js'], 
  collectCoverageFrom: ['src/**/*.ts'], 
};