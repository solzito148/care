export function validateEmail(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return "El email es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return "Ingresa un email valido.";
  return "";
}

export function validatePassword(password: string) {
  if (!password) return "La contrasena es obligatoria.";
  if (password.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
  return "";
}

/**
 * Politica reforzada para crear o actualizar contrasenas (SEC-12): al menos
 * 10 caracteres con mayuscula, minuscula y numero. El login sigue usando
 * `validatePassword` para no bloquear cuentas existentes.
 */
export function validateStrongPassword(password: string) {
  if (!password) return "La contrasena es obligatoria.";
  if (password.length < 10) return "La contrasena debe tener al menos 10 caracteres.";
  if (!/[a-z]/.test(password)) return "Incluye al menos una letra minuscula.";
  if (!/[A-Z]/.test(password)) return "Incluye al menos una letra mayuscula.";
  if (!/[0-9]/.test(password)) return "Incluye al menos un numero.";
  return "";
}

export function validateRequired(value: string, label: string) {
  if (!value.trim()) return `${label} es obligatorio.`;
  return "";
}

export function validatePhone(phone: string) {
  if (!phone.trim()) return "El telefono es obligatorio.";
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) return "Ingresa un telefono valido.";
  return "";
}
