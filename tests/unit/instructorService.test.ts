import { registrarInstructor } from '../../src/services/instructorService';
import { validarContraseña } from '../../src/utils/validacion';

// Mocks
jest.mock('../../src/utils/validacion');
jest.mock('bcrypt');

const queryBuilderMock = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => queryBuilderMock),
  },
}));

describe('Pruebas para instructorService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (validarContraseña as jest.Mock).mockImplementation(() => {});
  });

  it('debería llamar a validarContraseña con la contraseña proporcionada', async () => {
    const contraseña = 'PasswordValida123!';
    // Simular que el correo no existe y la inserción es exitosa
    (queryBuilderMock.single )
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: { id: '1', nombre: 'Test', correo: 'test@test.com' } });

    await registrarInstructor('Test', 'test@test.com', contraseña);
    
    // Verificamos que la función de validación fue llamada
    expect(validarContraseña).toHaveBeenCalledWith(contraseña);
  });

  it('debería lanzar un error si la validación de contraseña falla', async () => {
    const contraseñaInvalida = '123';
    // Simular que la función de validación lanza un error
    (validarContraseña as jest.Mock).mockImplementation(() => {
      throw new Error('La contraseña debe tener al menos 8 caracteres.');
    });

    await expect(registrarInstructor('Test', 'test@test.com', contraseñaInvalida))
      .rejects.toThrow('La contraseña debe tener al menos 8 caracteres.');
  });

  it('debería lanzar un error si la inserción en Supabase falla', async () => {
    // Simular que el correo no existe
    (queryBuilderMock.single ).mockResolvedValueOnce({ data: null });
    // Simular un error durante la inserción
    (queryBuilderMock.single ).mockResolvedValueOnce({ data: null, error: new Error('Error de DB') });

    await expect(registrarInstructor('Test', 'fail@test.com', 'Password123!'))
      .rejects.toThrow('Error al registrar al instructor.');
  });
});