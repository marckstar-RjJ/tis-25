import React from 'react';
import { Link } from 'react-router-dom';

function Etapas() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/etapas" className="active">Etapas</Link>
            <Link to="/reglamento">Reglamento</Link>
            <Link to="/contactanos">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/" className="btn btn-ingresar">
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="etapas-container">
        <h1>Etapas de las Olimpiadas</h1>
        
        <div className="etapa-card">
          <h2>Etapa Clasificatoria</h2>
          <div className="etapa-fecha">31 de Mayo</div>
          <div className="etapa-info">
            <p><strong>Modalidad:</strong> Pruebas presenciales</p>
            <p><strong>Lugar:</strong> Campus de la UMSS</p>
          </div>
        </div>

        <div className="etapa-card">
          <h2>Etapa Final</h2>
          <div className="etapa-fecha">11 de Julio</div>
          <div className="etapa-info">
            <p><strong>Modalidad:</strong> Pruebas presenciales</p>
            <p><strong>Lugar:</strong> Campus de la UMSS</p>
          </div>
        </div>

        <div className="etapa-card">
          <h2>Premiación</h2>
          <div className="etapa-fecha">11 de Julio</div>
          <div className="etapa-info">
            <p><strong>Lugar:</strong> Campus de la UMSS</p>
            <p><strong>Hora:</strong> 15:00 pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Etapas;
