import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import InscripcionIndividual from '../InscripcionIndividual';

const MisAreas = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [areasInscritas, setAreasInscritas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInscripcion, setShowInscripcion] = useState(false);
  const [inscripcionExitosa, setInscripcionExitosa] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Obteniendo datos de áreas...");
      // Obtener todas las áreas disponibles
      const areasData = await apiService.getAreas();
      setAllAreas(areasData);
      
      // Obtener información actualizada del estudiante
      const estudianteData = await apiService.getCurrentStudent();
      
      console.log("Datos del estudiante:", estudianteData);
      console.log("Áreas inscritas:", estudianteData.areasInscritas);
      console.log("Todas las áreas:", areasData);
      
      // Si el estudiante tiene áreas inscritas
      if (estudianteData.areasInscritas && estudianteData.areasInscritas.length > 0) {
        // Encontrar los objetos de área completos para las áreas inscritas
        const areasCompletas = areasData.filter(area => 
          estudianteData.areasInscritas.includes(area.id)
        );
        console.log("Áreas completas encontradas:", areasCompletas);
        setAreasInscritas(areasCompletas);
      } else {
        setAreasInscritas([]);
      }
    } catch (err) {
      console.error('Error al cargar áreas inscritas:', err);
      setError('No se pudieron cargar las áreas inscritas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleInscripcion = () => {
    console.log("Iniciando proceso de inscripción...");
    setShowInscripcion(true);
  };

  const handleBackFromInscripcion = () => {
    console.log("Volviendo desde inscripción...");
    setShowInscripcion(false);
    // Recargar los datos después de la inscripción
    fetchData();
    // Mostrar mensaje de éxito si hubo inscripción
    setInscripcionExitosa(true);
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => setInscripcionExitosa(false), 5000);
  };

  // Función para ir a la generación de orden de pago
  const handleGenerarOrdenPago = () => {
    console.log("Redirigiendo a orden de pago...");
    navigate('/estudiante/orden-pago');
  };

  if (loading) {
    return <p>Cargando áreas inscritas...</p>;
  }

  if (showInscripcion) {
    // Renderizamos directamente el componente de inscripción
    return (
      <div className="inscripcion-individual-wrapper">
        <h2>Inscripción a Áreas Académicas</h2>
        <button 
          onClick={handleBackFromInscripcion} 
          className="back-button" 
          style={{ marginBottom: '20px' }}
        >
          ← Volver a Mis Áreas
        </button>
        <InscripcionIndividual 
          navigate={(path) => {
            console.log("Navegación interceptada a:", path);
            handleBackFromInscripcion();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="mis-areas">
      <h2>Mis Áreas Académicas</h2>
      
      {error && <p className="error-message">{error}</p>}
      {inscripcionExitosa && <p className="success-message">¡Inscripción realizada correctamente!</p>}
      
      {areasInscritas.length === 0 ? (
        <div className="no-areas">
          <p>No estás inscrito en ninguna área académica todavía.</p>
          <button onClick={handleInscripcion} className="inscripcion-button">
            Inscribirme en Áreas
          </button>
        </div>
      ) : (
        <div className="areas-container">
          <div className="areas-list">
            {areasInscritas.map(area => (
              <div key={area.id} className="area-card-estudiante">
                <h3>{area.nombre}</h3>
                <p>{area.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="areas-actions">
            <button onClick={handleInscripcion} className="inscripcion-button">
              Modificar Inscripción
            </button>
            
            {/* Botón para generar orden de pago */}
            <button 
              onClick={handleGenerarOrdenPago} 
              className="orden-pago-button"
              disabled={areasInscritas.length === 0}
            >
              Generar Orden de Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisAreas; 