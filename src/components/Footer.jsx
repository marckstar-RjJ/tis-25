import React from 'react';
import { FaWhatsapp, FaEnvelope, FaReact, FaHtml5, FaCss3Alt, FaJs, FaPhp } from 'react-icons/fa';
import { SiPostgresql } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="tech-icons">
            <FaReact className="tech-icon react-icon" title="React" />
            <FaHtml5 className="tech-icon html-icon" title="HTML5" />
            <FaCss3Alt className="tech-icon css-icon" title="CSS3" />
            <FaJs className="tech-icon js-icon" title="JavaScript" />
            <FaPhp className="tech-icon php-icon" title="PHP" />
            <SiPostgresql className="tech-icon postgresql-icon" title="PostgreSQL" />
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Booleans Solutions. Todos los derechos reservados.</p>
        </div>
        
        <div className="footer-nav">
          <a 
            href="mailto:booleanssolutions@gmail.com" 
            title="Enviar correo"
            className="footer-link email-link"
          >
            <FaEnvelope size={22} /> booleanssolutions@gmail.com
          </a>
          <a 
            href="https://wa.me/59160344144" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="Abrir chat de WhatsApp"
            className="footer-link whatsapp-link"
            data-component-name="whatsappBooleans"
          >
            <FaWhatsapp size={22} /> whatsappBooleans
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
