import { useState, useEffect } from 'react';
import axios from 'axios';

function Inscripcion() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estudiantesRes, areasRes] = await Promise.all([
          axios.get('/api/estudiantes'),
          axios.get('/api/areas')
        ]);
        setEstudiantes(estudiantesRes.data);
        setAreas(areasRes.data);
      } catch (error) {
        setError('Error al cargar los datos');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAreaChange = (areaId) => {
    setSelectedAreas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      }
      return [...prev, areaId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEstudiante || selectedAreas.length === 0) {
      setError('Por favor seleccione un estudiante y al menos un área');
      return;
    }

    try {
      await axios.post('/api/inscripciones', {
        estudiante_id: selectedEstudiante,
        areas: selectedAreas
      });
      setError('');
      setSelectedEstudiante('');
      setSelectedAreas([]);
      alert('Inscripción realizada con éxito');
    } catch (error) {
      setError('Error al realizar la inscripción');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="inscripcion-form">
      <h2>Inscripción de Áreas</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="estudiante">Seleccione un Estudiante</label>
          <select
            id="estudiante"
            value={selectedEstudiante}
            onChange={(e) => setSelectedEstudiante(e.target.value)}
            required
          >
            <option value="">Seleccione un estudiante</option>
            {estudiantes.map(estudiante => (
              <option key={estudiante.id} value={estudiante.id}>
                {estudiante.nombre} {estudiante.apellido}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Seleccione las Áreas</label>
          <div className="areas-grid">
            {areas.map(area => (
              <div key={area.id} className="area-card">
                <input
                  type="checkbox"
                  id={`area-${area.id}`}
                  checked={selectedAreas.includes(area.id)}
                  onChange={() => handleAreaChange(area.id)}
                />
                <label htmlFor={`area-${area.id}`}>
                  <h4>{area.nombre}</h4>
                  <p>{area.descripcion}</p>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="back-button" onClick={() => window.history.back()}>
            Volver
          </button>
          <button type="submit" className="submit-button">
            Inscribir
          </button>
        </div>
      </form>
    </div>
  );
}

export default Inscripcion; 