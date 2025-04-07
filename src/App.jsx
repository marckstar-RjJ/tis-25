import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
        <nav>
          <a href="#">Eventos</a>
          <a href="#">Reglamento</a>
          <a href="#">Contactanos</a>
          <button className="btn btn-ingresar">Ingresar</button>
          <button className="btn btn-registrar">Registrarse</button>
        </nav>
      </header>

      <div className="container">
        <div className="left-section">
          <h1>Olimpiadas Escolares 2025<br />Oh Sansi</h1>
          <p>
            La Universidad Mayor de San Simón (UMSS) invita a los estudiantes de educación básica y secundaria de todo el país a participar en la Olimpiada de Ciencia y Tecnología - Oh Sansi 2025, un evento diseñado para identificar y estimular el talento en las áreas de Matemáticas, Física, Astronomía y Astrofísica, Biología, Química, Informática y Robótica.
            <br /><br />
            Un espacio para el desarrollo científico. La Olimpiada tiene como objetivo principal desarrollar actividades competitivas en ciencias que permitan identificar a estudiantes con habilidades y aptitudes excepcionales en estas áreas del conocimiento.
          </p>
        </div>

        <div className="right-section">
          <form className="form-login">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Ingrese su email" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="Ingrese su contraseña" />
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

export default App;
