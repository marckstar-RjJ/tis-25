import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Intenta iniciar sesión con el servicio API a través del contexto de autenticación
      const user = await login(email, password);
      
      console.log("Usuario autenticado:", user);
      console.log("Tipo de usuario:", user.tipoUsuario);
      
      // Redirige según el tipo de usuario
      if (user.tipoUsuario === 'administrador') {
        navigate('/admin');
      } else if (user.tipoUsuario === 'tutor') {
        navigate('/tutor');
      } else if (user.tipoUsuario === 'estudiante') {
        navigate('/estudiante');
      } else {
        // Por defecto, si no se reconoce el tipo
        console.error("Tipo de usuario no reconocido:", user.tipoUsuario);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/etapas">Etapas</Link>
            <Link to="/reglamento">Reglamento</Link>
            <Link to="/contactanos">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <button onClick={toggleLoginForm} className="btn btn-ingresar">
            Iniciar Sesión
          </button>
          <Link to="/registro" className="btn btn-registrar">
            Crear Cuenta
          </Link>
        </div>
      </header>

      <div className="container">
        <div className="left-section">
          <h1>Olimpiadas Escolares 2025<br />Oh Sansi</h1>
          <p>
            La Universidad Mayor de San Simón (UMSS) invita a los estudiantes de educación básica y secundaria
            a participar en las Olimpiadas Escolares "Oh Sansi" 2025. Este evento promueve la excelencia
            académica y el espíritu competitivo en diversas áreas del conocimiento.
          </p>
        </div>

        {showLoginForm && (
          <div className="right-section">
            <form className="form-login" onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              {error && <div className="error-message login-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
              </button>
              <Link to="#">¿Olvidaste tu contraseña?</Link>
              <div className="register-link">
                <p>¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link></p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Se deshabilitan los eventos del logo de fondo para que no intercepte clics */}
      <Link to="/" style={{ pointerEvents: 'none' }}>
        <img src="/logo_umss.png" className="background-logo" alt="Logo de fondo" />
      </Link>
      <div className="convocatoria">
        <h2>Convocatoria</h2>
        <a href="/IMG_7383.jpg" download="Convocatoria_Olimpiadas_2025.jpg" className="btn-descargar">
          Descargar
        </a>
      </div>
    </div>
  );
}

export default Home;