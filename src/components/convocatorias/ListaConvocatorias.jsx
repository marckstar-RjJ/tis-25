import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { apiService } from '../../services/api';
import { formatearFecha } from '../utils/formatoFechas';

const ListaConvocatorias = ({ onEditar, onCrearNueva }) => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarConvocatorias();
  }, []);

  const cargarConvocatorias = () => {
    setLoading(true);
    try {
      // Cargar convocatorias directamente desde localStorage
      const convocatoriasKey = 'convocatorias';
      const data = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      
      // Verificar si ya existe la convocatoria "Olimpiadas Oh Sansi!"
      let hasOhSansi = data.some(conv => conv.nombre === 'Olimpiadas Oh Sansi!');
      
      // Si no existe, agregarla como primera convocatoria
      if (!hasOhSansi) {
        // Obtener todas las áreas disponibles
        const todasLasAreas = JSON.parse(localStorage.getItem('areas') || '[]');
        
        // Filtrar solo las áreas estandar para Oh Sansi! (excluir áreas de Skillparty)
        const areasOhSansi = todasLasAreas.filter(area => 
          !['Farmeo I', 'Support II'].includes(area.nombre)
        );
        
        const ohSansiConvocatoria = {
          id: Date.now(),
          nombre: 'Olimpiadas Oh Sansi!',
          fecha_inicio: new Date(2025, 1, 15).toISOString(), // 15 de Febrero 2025
          fecha_fin: new Date(2025, 2, 31).toISOString(), // 31 de Marzo 2025
          costo_por_area: 16.00,
          maximo_areas: 2,
          activa: true,
          areas: areasOhSansi
        };
        
        const updatedData = [ohSansiConvocatoria, ...data];
        localStorage.setItem(convocatoriasKey, JSON.stringify(updatedData));
        setConvocatorias(updatedData);
      } else {
        // Asegurarnos de que la convocatoria Oh Sansi! no tenga las áreas de Skillparty
        const todasLasAreas = JSON.parse(localStorage.getItem('areas') || '[]');
        const updatedData = data.map(convocatoria => {
          if (convocatoria.nombre === 'Olimpiadas Oh Sansi!') {
            // Filtrar áreas para Oh Sansi!
            const areasOhSansi = todasLasAreas.filter(area => 
              !['Farmeo I', 'Support II'].includes(area.nombre)
            );
            return { ...convocatoria, areas: areasOhSansi };
          }
          return convocatoria;
        });
        
        localStorage.setItem(convocatoriasKey, JSON.stringify(updatedData));
        setConvocatorias(updatedData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar convocatorias:', err);
      setError('No se pudieron cargar las convocatorias. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta convocatoria? Esta acción no se puede deshacer.')) {
      try {
        // Eliminar convocatoria directamente de localStorage
        const convocatoriasKey = 'convocatorias';
        const convocatoriasActuales = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        const convocatoriasActualizadas = convocatoriasActuales.filter(conv => conv.id !== id);
        
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatoriasActualizadas));
        setConvocatorias(convocatoriasActualizadas);
        setError(null);
      } catch (err) {
        console.error('Error al eliminar convocatoria:', err);
        setError('Error al eliminar la convocatoria. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const getEstadoConvocatoria = (convocatoria) => {
    const hoy = new Date();
    const fechaInicio = new Date(convocatoria.fecha_inicio);
    const fechaFin = new Date(convocatoria.fecha_fin);

    if (!convocatoria.activa) {
      return { estado: 'Inactiva', variant: 'secondary' };
    } else if (hoy < fechaInicio) {
      return { estado: 'Programada', variant: 'info' };
    } else if (hoy >= fechaInicio && hoy <= fechaFin) {
      return { estado: 'Abierta', variant: 'success' };
    } else {
      return { estado: 'Cerrada', variant: 'danger' };
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando convocatorias...</p>
      </div>
    );
  }

  return (
    <div className="convocatorias-lista">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Convocatorias de Olimpiadas</h2>
        <Button variant="primary" onClick={onCrearNueva}>
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Convocatoria
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {convocatorias.length === 0 ? (
        <div className="alert alert-info">
          No hay convocatorias registradas. ¡Crea la primera!
        </div>
      ) : (
        <Table responsive bordered hover>
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Período de Inscripción</th>
              <th>Costo por Área</th>
              <th>Máx. Áreas</th>
              <th>Estado</th>
              <th>Áreas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {convocatorias.map((convocatoria) => {
              const estadoInfo = getEstadoConvocatoria(convocatoria);
              return (
                <tr key={convocatoria.id}>
                  <td>{convocatoria.nombre}</td>
                  <td>
                    {formatearFecha(convocatoria.fecha_inicio)} - {formatearFecha(convocatoria.fecha_fin)}
                  </td>
                  <td>{convocatoria.costo_por_area} Bs</td>
                  <td className="text-center">{convocatoria.maximo_areas}</td>
                  <td>
                    <Badge bg={estadoInfo.variant}>{estadoInfo.estado}</Badge>
                  </td>
                  <td className="text-center">
                    {convocatoria.areas?.length || 0}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onEditar(convocatoria.id, 'areas')}
                      title="Ver/Editar áreas"
                    >
                      <i className="bi bi-grid"></i>
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEditar(convocatoria.id)}
                        title="Editar convocatoria"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminar(convocatoria.id)}
                        title="Eliminar convocatoria"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ListaConvocatorias;
