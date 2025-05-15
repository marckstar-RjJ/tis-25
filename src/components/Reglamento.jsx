import React from 'react';
import { Link } from 'react-router-dom';

function Reglamento() {
  // Datos de áreas y sus pre-requisitos (cursos)
  const areasRequisitos = [
    { 
      area: 'Astronomía', 
      requisitos: '4° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Biología', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Física', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    },
    { 
      area: 'Matemáticas', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Informática', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    },
    { 
      area: 'Robótica', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Química', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    }
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/etapas">Etapas</Link>
            <Link to="/reglamento" className="active">Reglamento</Link>
            <Link to="/contactanos">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/" className="btn btn-ingresar">
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="reglamento-container">
        <h1>Reglamento de las Olimpiadas</h1>
        
        <div className="reglamento-section">
          <h2>Áreas Disponibles y Requisitos</h2>
          <p>Cada estudiante puede inscribirse en hasta 2 áreas de las 7 disponibles. A continuación se detallan los cursos requeridos para cada área:</p>
          
          <div className="tabla-container">
            <table className="tabla-reglamento">
              <thead>
                <tr>
                  <th>Área</th>
                  <th>Cursos Permitidos</th>
                </tr>
              </thead>
              <tbody>
                {areasRequisitos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.area}</td>
                    <td>{item.requisitos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="reglamento-info">
            <h3>Información Adicional:</h3>
            <ul>
              <li>Cada área tiene un costo de inscripción de $16 (dieciséis dólares americanos).</li>
              <li>La inscripción en dos áreas tiene un costo total de $32 (treinta y dos dólares americanos).</li>
              <li>El pago debe realizarse dentro de las 48 horas siguientes a la generación de la orden de pago.</li>
              <li>Si el pago no se realiza en el tiempo establecido, la inscripción será cancelada automáticamente.</li>
              <li>Los estudiantes deben presentarse a las pruebas con su carnet de identidad.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reglamento;
