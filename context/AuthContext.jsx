import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

// Crear contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario en localStorage al iniciar
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar si estamos en la ruta de inicio o registro
        const isPublicRoute = window.location.pathname === '/' || 
                              window.location.pathname === '/registro';
                              
        // Si estamos en una ruta pública, no intentamos recuperar el usuario
        if (isPublicRoute) {
          setLoading(false);
          return;
        }
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error al verificar usuario:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const user = await apiService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    console.log("Cerrando sesión...");
    // Limpiar los datos del usuario en el estado
    setCurrentUser(null);
    // Eliminar los datos del usuario del almacenamiento local
    localStorage.removeItem('currentUser');
    // Forzar una recarga de la página para asegurar que todos los estados se reinicien
    console.log("Sesión cerrada correctamente");
    // Redirigir a la página de inicio
    window.location.href = '/';
  };

  // Obtener estudiantes asociados (para tutores)
  const getStudentsByTutor = async (tutorId) => {
    if (!currentUser || currentUser.tipoUsuario !== 'tutor') {
      throw new Error('Solo los tutores pueden acceder a esta función');
    }
    
    try {
      return await apiService.getStudentsByTutor(tutorId || currentUser.id);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    getStudentsByTutor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 