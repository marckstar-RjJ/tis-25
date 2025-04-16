import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './dashboard';
import InscripcionIndividual from './InscripcionIndividual';
import InscripcionPorLista from './InscripcionPorLista';
import Registro from './Registro';
import { apiService } from './services/api';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Intenta el caso especial para el administrador predefinido
      if (email === 'admin@umss.edu.bo' && password === '123456') {
        navigate('/dashboard');
        return;
      }
      
      // Intenta iniciar sesión con el servicio API
      const user = await apiService.login(email, password);
      console.log('Usuario autenticado:', user);
      
      // Redirige según el tipo de usuario
      if (user.tipoUsuario === 'administrador') {
        navigate('/dashboard');
      } else if (user.tipoUsuario === 'tutor') {
        navigate('/dashboard'); // Se podría crear una ruta específica para tutores
      } else {
        navigate('/dashboard'); // Se podría crear una ruta específica para estudiantes
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
        <nav>
          <a href="#">Eventos</a>
          <a href="#">Reglamento</a>
          <a href="#">Contactanos</a>
        </nav>
      </header>

      <div className="container">
        <div className="left-section">
          <h1>Olimpiadas Escolares 2025<br />Oh Sansi</h1>
          <p>
            La Universidad Mayor de San Simón (UMSS) invita a los estudiantes de educación básica y secundaria...
          </p>
        </div>

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
            <a href="#">¿Olvidaste tu contraseña?</a>
            <div className="register-link">
              <p>¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link></p>
            </div>
          </form>
        </div>
      </div>

      <img src="/logo_umss.png" className="background-logo" alt="Logo de fondo" />
      <div className="convocatoria">
        <h2>Convocatoria</h2>
        <button>Descargar</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inscripcion" element={<InscripcionIndividual />} />
      <Route path="/inscripcion-lista" element={<InscripcionPorLista />} />
      <Route path="/registro" element={<Registro />} />
    </Routes>
  );
}

export default App;
