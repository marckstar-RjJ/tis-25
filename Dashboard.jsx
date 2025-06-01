import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEstudiantes: 0,
    totalTutores: 0,
    totalAreas: 0,
    inscripcionesPendientes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

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
        <div className="content-grid">
          <div className="card">
            <h3>Total Estudiantes</h3>
            <p>{stats.totalEstudiantes}</p>
          </div>
          <div className="card">
            <h3>Total Tutores</h3>
            <p>{stats.totalTutores}</p>
          </div>
          <div className="card">
            <h3>Áreas Disponibles</h3>
            <p>{stats.totalAreas}</p>
          </div>
          <div className="card">
            <h3>Inscripciones Pendientes</h3>
            <p>{stats.inscripcionesPendientes}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
