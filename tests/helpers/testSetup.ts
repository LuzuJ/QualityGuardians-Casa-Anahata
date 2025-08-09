import express from 'express';

// Mock para JWT
export const verifyMock = jest.fn();
export const signMock = jest.fn(); 
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: verifyMock,
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
}));

// Mock para bcrypt
export const compareMock = jest.fn();
export const hashMock = jest.fn();
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: compareMock,
  hash: hashMock,
}));

// Mock centralizado y robusto para Supabase
export const mockDbFunctions = {
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
};

jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockDbFunctions.insert.mockReturnThis(),
      select: mockDbFunctions.select.mockReturnThis(),
      update: mockDbFunctions.update.mockReturnThis(),
      eq: mockDbFunctions.eq.mockReturnThis(), // CORRECCIÓN: Asegura que .eq() sea encadenable
      single: mockDbFunctions.single,
    })),
  },
}));

// Fábrica de la App
export const createApp = (routes: { path: string; router: express.Router }[]) => {
  const app = express();
  app.use(express.json());
  routes.forEach(route => {
    app.use(route.path, route.router);
  });
  return app;
};