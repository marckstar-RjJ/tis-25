/**
 * Ayudante para pruebas de autenticación
 * Este archivo contiene funciones para ayudar a simular diferentes roles de usuario
 * durante el desarrollo y pruebas del sistema
 */

/**
 * Simula un inicio de sesión como administrador
 */
export const loginAsAdmin = () => {
  const adminUser = {
    id: 'admin-1',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@olimpiadas.bo',
    tipoUsuario: 'administrador',
    token: 'admin-token-123'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(adminUser));
  localStorage.setItem('token', 'admin-token-123');
  
  return adminUser;
};

/**
 * Simula un inicio de sesión como tutor
 */
export const loginAsTutor = () => {
  const tutorUser = {
    id: 'tutor-1',
    nombre: 'Tutor',
    apellido: 'Prueba',
    email: 'tutor@colegio.edu.bo',
    tipoUsuario: 'tutor',
    colegio: {
      id: '1',
      nombre: 'Colegio La Salle'
    },
    token: 'tutor-token-123'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(tutorUser));
  localStorage.setItem('token', 'tutor-token-123');
  
  return tutorUser;
};

/**
 * Simula un inicio de sesión como estudiante
 */
export const loginAsEstudiante = () => {
  const estudianteUser = {
    id: 'estudiante-1',
    nombre: 'Estudiante',
    apellido: 'Prueba',
    email: 'estudiante@colegio.edu.bo',
    tipoUsuario: 'estudiante',
    curso: 11, // 5° de secundaria
    colegio: {
      id: '1',
      nombre: 'Colegio La Salle'
    },
    token: 'estudiante-token-123'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(estudianteUser));
  localStorage.setItem('token', 'estudiante-token-123');
  
  return estudianteUser;
};

/**
 * Cierra la sesión actual
 */
export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
};
