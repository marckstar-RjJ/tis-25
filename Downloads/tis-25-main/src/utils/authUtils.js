/**
 * Determina la ruta de redirección basada en el tipo de usuario.
 * @param {object | null} user - El objeto de usuario (puede ser null).
 * @returns {string} La ruta a la que redirigir.
 */
export const redirectByUserType = (user) => {
  // Si no hay usuario o no tiene tipo, redirigir a la página principal
  if (!user || !user.tipo_usuario) return '/'; 
  
  console.log('Redirigiendo usuario con tipo:', user.tipo_usuario);

  switch (user.tipo_usuario) { // Usamos user.tipo_usuario que viene del backend
    case 'administrador':
      return '/admin';
    case 'tutor':
      return '/tutor';
    case 'estudiante':
      return '/estudiante';
    default:
      console.warn('Tipo de usuario no reconocido:', user.tipo_usuario, 'Redirigiendo a /');
      return '/'; // Ruta por defecto si el tipo no coincide
  }
}; 