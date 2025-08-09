import { validarContraseña } from '../../src/utils/validacion';

describe('validarContraseña', () => {
  // Caso de éxito que no debe lanzar error
  it('no debería lanzar un error para una contraseña válida', () => {
    expect(() => validarContraseña('Password123!')).not.toThrow();
  });


  const casosDeError = [
    { pass: 'Pass1!',            mensaje: 'La contraseña debe tener al menos 8 caracteres.' },
    { pass: 'password123!',      mensaje: 'La contraseña debe contener al menos una letra mayúscula.' },
    { pass: 'PASSWORD123!',      mensaje: 'La contraseña debe contener al menos una letra minúscula.' },
    { pass: 'Password!',         mensaje: 'La contraseña debe contener al menos un número.' },
    { pass: 'Password123',       mensaje: 'La contraseña debe contener al menos un carácter especial.' }
  ];

  test.each(casosDeError)('debería lanzar error "$mensaje" para la contraseña "$pass"', ({ pass, mensaje }) => {
    expect(() => validarContraseña(pass)).toThrow(mensaje);
  });
});