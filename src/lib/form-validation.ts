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

export function validateRequired(value: string, label: string) {
  if (!value.trim()) return `${label} es obligatorio.`;
  return "";
}

export function validatePhone(phone: string) {
  if (!phone.trim()) return "El telefono es obligatorio.";
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) return "Ingresa un telefono valido.";
  return "";
}
