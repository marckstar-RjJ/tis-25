import React, { useState, useEffect } from 'react';

const FormularioConvocatoria = ({ convocatoriaId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activa',
    costo_por_area: 16,
    maximo_areas: 3,
    areas: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener convocatorias del localStorage
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      
      if (convocatoriaId) {
        // Si estamos editando, buscar la convocatoria en el localStorage
        const convocatoria = convocatorias.find(c => String(c.id) === String(convocatoriaId));
        if (convocatoria) {
          setFormData({
            nombre: convocatoria.nombre || '',
            descripcion: convocatoria.descripcion || '',
            fecha_inicio: convocatoria.fecha_inicio || '',
            fecha_fin: convocatoria.fecha_fin || '',
            estado: convocatoria.estado || 'activa',
            costo_por_area: convocatoria.costo_por_area || 16,
            maximo_areas: convocatoria.maximo_areas || 3,
            areas: convocatoria.areas || []
          });
        } else {
          setError('No se encontró la convocatoria');
        }
      }
      
      // Obtener áreas del localStorage
      const areasKey = 'olimpiadas_areas';
      const loadedAreas = JSON.parse(localStorage.getItem(areasKey) || '[]');
      setAreas(loadedAreas);
      
    } catch (err) {
      console.error('Error al cargar convocatoria:', err);
      setError('Error al cargar los datos de la convocatoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [convocatoriaId]);

  // Aquí iría el resto del JSX para el formulario
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{convocatoriaId ? 'Editar Convocatoria' : 'Crear Nueva Convocatoria'}</h2>
      <form>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
          />
        </div>
        <div>
          <label>Fecha Fin:</label>
          <input
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
          />
        </div>
        <div>
          <label>Estado:</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
          >
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
        <div>
          <label>Costo por Área:</label>
          <input
            type="number"
            name="costo_por_area"
            value={formData.costo_por_area}
            onChange={(e) => setFormData({ ...formData, costo_por_area: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Máximo de Áreas:</label>
          <input
            type="number"
            name="maximo_areas"
            value={formData.maximo_areas}
            onChange={(e) => setFormData({ ...formData, maximo_areas: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <h3>Áreas:</h3>
          {areas.map((area) => (
            <div key={area.id}>
              <input
                type="checkbox"
                id={`area-${area.id}`}
                checked={formData.areas.includes(area.id)}
                onChange={(e) => {
                  const newAreas = e.target.checked
                    ? [...formData.areas, area.id]
                    : formData.areas.filter((id) => id !== area.id);
                  setFormData({ ...formData, areas: newAreas });
                }}
              />
              <label htmlFor={`area-${area.id}`}>{area.nombre}</label>
            </div>
          ))}
        </div>
        <button type="submit">Guardar Convocatoria</button>
      </form>
    </div>
  );
};

export default FormularioConvocatoria; 