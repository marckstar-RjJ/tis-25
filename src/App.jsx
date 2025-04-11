import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './Dashboard';
import InscripcionIndividual from './InscripcionIndividual';
import InscripcionPorLista from './InscripcionPorLista';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@umss.edu.bo' && password === '123456') {
      navigate('/dashboard');
    } else {
      alert('Credenciales incorrectas');
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
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit">Ingresar</button>
            <a href="#">¿Olvidaste tu contraseña?</a>
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
    </Routes>
  );
}

export default App;
