import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const goToInscripcion = () => {
    navigate('/inscripcion');
  };

  const goToInscripcionLista = () => {
    navigate('/inscripcion-lista');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <h2>Oh! SanSi</h2>
        </div>
        <nav>
          <ul>
            <li><button onClick={goToInscripcion}>Inscripción Individual</button></li>
            <li><button onClick={goToInscripcionLista}>Inscripción por Lista</button></li>
            <li><button>Subir Comprobante</button></li>
            <li><button>Reportes</button></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>Panel de Administración</h1>
          <button className="logout" onClick={handleLogout}>Cerrar sesión</button>
        </header>
        <section className="content-grid">
          <div className="card" onClick={goToInscripcion} style={{ cursor: 'pointer' }}>
            <h3>Inscripción Individual</h3>
            <p>Registrar estudiantes de forma manual.</p>
          </div>
          <div className="card" onClick={goToInscripcionLista} style={{ cursor: 'pointer' }}>
            <h3>Inscripción por Lista</h3>
            <p>Sube un archivo Excel con la lista de estudiantes.</p>
          </div>
          <div className="card">
            <h3>Subir Comprobante</h3>
            <p>Sube el comprobante de pago correspondiente.</p>
          </div>
          <div className="card">
            <h3>Reportes</h3>
            <p>Ver el estado de inscripción y generar reportes.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
