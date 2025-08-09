import { supabase } from '../../src/config/supabaseClient';
import { loginInstructor, loginPaciente } from '../../src/services/authService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock de las dependencias externas
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Mock del cliente de Supabase
const queryBuilderMock = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => queryBuilderMock),
  },
}));

describe('Pruebas para authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para loginInstructor
  describe('loginInstructor', () => {
    it('debería devolver un token si las credenciales son correctas', async () => {
      const mockInstructor = { id: 'inst-123', contraseña: 'hash_password' };
      const mockToken = 'jwt-token-valido';

      (queryBuilderMock.single ).mockResolvedValue({ data: mockInstructor, error: null });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await loginInstructor('test@example.com', 'password123');

      expect(result).toEqual({ token: mockToken, rol: 'instructor' });
      expect(supabase.from).toHaveBeenCalledWith('Instructor');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hash_password');
    });

    it('debería lanzar un error si el instructor no existe', async () => {
      (queryBuilderMock.single ).mockResolvedValue({ data: null, error: { message: 'No encontrado' } });

      await expect(loginInstructor('no-existe@example.com', 'password123')).rejects.toThrow('Credenciales incorrectas.');
    });

    it('debería lanzar un error si la contraseña es incorrecta', async () => {
      const mockInstructor = { id: 'inst-123', contraseña: 'hash_password' };
      (queryBuilderMock.single ).mockResolvedValue({ data: mockInstructor, error: null });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // La contraseña no coincide

      await expect(loginInstructor('test@example.com', 'wrong-password')).rejects.toThrow('Credenciales incorrectas.');
    });
  });

  // Pruebas para loginPaciente
  describe('loginPaciente', () => {
    it('debería devolver un token si el paciente está activo y las credenciales son correctas', async () => {
      const mockPaciente = { cedula: 'pac-456', contraseña: 'hash_password_pac', estado: 'activo' };
      const mockToken = 'jwt-token-paciente';

      (queryBuilderMock.single ).mockResolvedValue({ data: mockPaciente, error: null });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await loginPaciente('paciente@example.com', 'password456');

      expect(result).toEqual({ token: mockToken, rol: 'paciente' });
      expect(supabase.from).toHaveBeenCalledWith('Paciente');
    });

    it('debería lanzar un error si la cuenta del paciente no está activa', async () => {
      const mockPaciente = { cedula: 'pac-456', contraseña: 'hash_password_pac', estado: 'pendiente' };
      (queryBuilderMock.single ).mockResolvedValue({ data: mockPaciente, error: null });

      await expect(loginPaciente('paciente@example.com', 'password456')).rejects.toThrow('Credenciales incorrectas o cuenta no activada.');
    });
  });
});