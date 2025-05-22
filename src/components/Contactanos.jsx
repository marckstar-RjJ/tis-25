import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

function Contactanos() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/convocatorias">Convocatorias</Link>
            <Link to="/etapas">Etapas</Link>
            <Link to="/reglamento">Reglamento</Link>
            <Link to="/contactanos" className="active">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/" className="btn btn-ingresar">
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="contactanos-container">
        <h1>Contáctanos</h1>
        
        <div className="contacto-info">
          <p>Para cualquier consulta sobre las olimpiadas, puedes comunicarte con nosotros a través de los siguientes medios:</p>
          
          <div className="contacto-card">
            <div className="contacto-item">
              <a 
                href="mailto:booleanssolutions@gmail.com" 
                className="contacto-link"
              >
                <FaEnvelope size={24} />
                <span>booleanssolutions@gmail.com</span>
              </a>
              <p className="contacto-descripcion">Envíanos un correo para consultas generales y soporte.</p>
            </div>
            
            <div className="contacto-item">
              <a 
                href="https://wa.me/59160344144" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contacto-link whatsapp"
              >
                <FaWhatsapp size={24} />
                <span data-component-name="whatsappBooleans">whatsappBooleans</span>
              </a>
              <p className="contacto-descripcion">Chatea directamente con nuestro equipo de soporte.</p>
            </div>
          </div>
          
          <div className="contacto-horario">
            <h3>Horario de atención:</h3>
            <p>Lunes a Viernes: 8:00 AM - 4:00 PM</p>
            <p>Sábados: 9:00 AM - 12:00 PM</p>
          </div>
          
          <div className="contacto-ubicacion">
            <h3>Ubicación:</h3>
            <p>Universidad Mayor de San Simón, Campus Central</p>
            <p>Cochabamba, Bolivia</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contactanos;
