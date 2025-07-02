export const validarContraseña = (contraseña: string): void => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(contraseña);
  const hasLowerCase = /[a-z]/.test(contraseña);
  const hasNumbers = /\d/.test(contraseña);
  const hasSpecialChar = /[!@#_$%^&*(),.?":{}|<>]/.test(contraseña);

  if (contraseña.length < minLength) throw new Error(`La contraseña debe tener al menos ${minLength} caracteres.`);
  if (!hasUpperCase) throw new Error("La contraseña debe contener al menos una letra mayúscula.");
  if (!hasLowerCase) throw new Error("La contraseña debe contener al menos una letra minúscula.");
  if (!hasNumbers) throw new Error("La contraseña debe contener al menos un número.");
  if (!hasSpecialChar) throw new Error("La contraseña debe contener al menos un carácter especial.");
};