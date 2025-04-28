import React from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer" style={{
      background: '#f8f9fa',
      padding: '1.5rem 0',
      textAlign: 'center',
      borderTop: '1px solid #e0e0e0',
      marginTop: 'auto',
      width: '100%',
      position: 'sticky',
      bottom: 0,
      left: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <a 
          href="mailto:booleanssolutions@gmail.com" 
          title="Enviar correo"
          style={{ 
            color: '#ea4335', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FaEnvelope size={22} /> booleanssolutions@gmail.com
        </a>
        <a 
          href="https://wa.me/59160344144" 
          target="_blank" 
          rel="noopener noreferrer" 
          title="Abrir chat de WhatsApp"
          style={{ 
            color: '#25d366', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FaWhatsapp size={22} /> 60344144
        </a>
      </div>
      <div style={{ marginTop: '0.75rem', color: '#888', fontSize: '0.95rem' }}>
        &copy; {new Date().getFullYear()} Booleans Solutions. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
