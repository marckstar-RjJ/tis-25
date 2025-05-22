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
  
  // Ya no necesitamos estos estilos ya que aplicamos el fondo directamente al body

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
      {/* El fondo ahora se aplica directamente al body desde index.css */}
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/convocatorias" style={{ color: '#2C3E50', fontWeight: 'bold', padding: '8px 12px', borderRadius: '4px', backgroundColor: '#F2F2F2', margin: '0 5px' }}>Convocatorias</Link>
            <Link to="/etapas" style={{ color: '#556B2F', fontWeight: 'bold', padding: '8px 12px', borderRadius: '4px', backgroundColor: '#F2F2F2', margin: '0 5px' }}>Etapas</Link>
            <Link to="/reglamento" style={{ color: '#D4A017', fontWeight: 'bold', padding: '8px 12px', borderRadius: '4px', backgroundColor: '#F2F2F2', margin: '0 5px' }}>Reglamento</Link>
            <Link to="/contactanos" style={{ color: '#7D7D7D', fontWeight: 'bold', padding: '8px 12px', borderRadius: '4px', backgroundColor: '#F2F2F2', margin: '0 5px' }}>Contáctanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <button onClick={toggleLoginForm} className="btn btn-ingresar" style={{ border: 'none', padding: '10px 15px', backgroundColor: '#2C3E50', color: '#F2F2F2', fontWeight: 'bold', borderRadius: '6px', margin: '0 5px' }}>
            Iniciar Sesión
          </button>
          <Link to="/registro" className="btn btn-registrar" style={{ textDecoration: 'none', padding: '10px 15px', backgroundColor: '#F2F2F2', border: '2px solid #D4A017', color: '#D4A017', fontWeight: 'bold', borderRadius: '6px', margin: '0 5px', display: 'inline-block' }}>
            Crear Cuenta
          </Link>
        </div>
      </header>

      <div className="container home-container">
        <div className="left-section">
          <div className="welcome-card">
            <h1>Olimpiadas Escolares UMSS</h1>
            <p className="subtitle">Sistema de gestión de convocatorias e inscripciones</p>
            <p>
              La Universidad Mayor de San Simón (UMSS) invita a los estudiantes de educación básica y secundaria
              a participar en las Olimpiadas Escolares. Nuestras convocatorias promueven la excelencia
              académica y el espíritu competitivo en diversas áreas del conocimiento.
            </p>
            {/* Se han eliminado los botones de acción */}
          </div>
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

      {/* Se elimina este contenedor ya que ahora utilizamos estilos en línea */}
      
      <div className="quick-actions">
        <div className="quick-action-card">
          <h2>Convocatorias Actuales</h2>
          <p>Explora nuestras convocatorias vigentes y conoce los requisitos para inscribirte.</p>
          <Link to="/convocatorias" className="btn-quick-action">Explorar</Link>
        </div>
        <div className="quick-action-card">
          <h2>Inscripciones</h2>
          <p>Regístrate y participa en nuestras olimpiadas académicas en diferentes áreas.</p>
          <Link to="/registro" className="btn-quick-action">Registrarse</Link>
        </div>
        <div className="quick-action-card">
          <h2>Información</h2>
          <p>Conoce las etapas, reglamentos y fechas importantes de nuestras olimpiadas.</p>
          <Link to="/etapas" className="btn-quick-action">Ver más</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;