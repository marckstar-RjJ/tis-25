import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';

const GestionAreasConvocatoria = ({ convocatoriaId, onGuardado, onCancelar }) => {
  const [convocatoria, setConvocatoria] = useState(null);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar convocatoria desde localStorage
        const convocatorias = JSON.parse(localStorage.getItem('convocatorias') || '[]');
        const datosConvocatoria = convocatorias.find(c => c.id === convocatoriaId);
        
        if (!datosConvocatoria) {
          throw new Error('Convocatoria no encontrada');
        }
        
        setConvocatoria(datosConvocatoria);
        
        // Cargar áreas disponibles desde localStorage
        const areas = JSON.parse(localStorage.getItem('areas') || '[]');
        setAreasDisponibles(areas);
        
        // Inicializar áreas seleccionadas
        if (datosConvocatoria.areas && datosConvocatoria.areas.length > 0) {
          setAreasSeleccionadas(datosConvocatoria.areas.map(area => area.id));
        }
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de la convocatoria. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [convocatoriaId]);
  
  const handleChangeArea = (areaId) => {
    setAreasSeleccionadas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };
  
  const handleSeleccionarTodas = () => {
    setAreasSeleccionadas(areasDisponibles.map(area => area.id));
  };
  
  const handleDeseleccionarTodas = () => {
    setAreasSeleccionadas([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (areasSeleccionadas.length === 0) {
      setError('Debes seleccionar al menos un área para la convocatoria.');
      return;
    }
    
    setGuardando(true);
    setError(null);
    
    try {
      // Obtener convocatorias actuales
      const convocatorias = JSON.parse(localStorage.getItem('convocatorias') || '[]');
      
      // Encontrar la convocatoria a actualizar
      const convocatoriaIndex = convocatorias.findIndex(c => c.id === convocatoriaId);
      
      if (convocatoriaIndex === -1) {
        throw new Error('Convocatoria no encontrada');
      }
      
      // Obtener las áreas completas seleccionadas
      const areasCompletas = areasDisponibles.filter(area => 
        areasSeleccionadas.includes(area.id)
      );
      
      // Actualizar las áreas de la convocatoria
      convocatorias[convocatoriaIndex] = {
        ...convocatorias[convocatoriaIndex],
        areas: areasCompletas
      };
      
      // Guardar en localStorage
      localStorage.setItem('convocatorias', JSON.stringify(convocatorias));
      
      onGuardado();
    } catch (err) {
      console.error('Error al actualizar áreas:', err);
      setError('Error al actualizar las áreas. Por favor, inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando áreas de la convocatoria...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header as="h5">
        Áreas para: {convocatoria?.nombre}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="info" className="me-2">
                {areasSeleccionadas.length} áreas seleccionadas
              </Badge>
              de {areasDisponibles.length} disponibles
            </div>
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={handleSeleccionarTodas}
                className="me-2"
              >
                Seleccionar todas
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={handleDeseleccionarTodas}
              >
                Deseleccionar todas
              </Button>
            </div>
          </div>
          
          <Table responsive bordered hover>
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }}>Selección</th>
                <th>Nombre del Área</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {areasDisponibles.map(area => (
                <tr key={area.id}>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={areasSeleccionadas.includes(area.id)}
                      onChange={() => handleChangeArea(area.id)}
                    />
                  </td>
                  <td>{area.nombre}</td>
                  <td>{area.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={guardando}
            >
              {guardando && <Spinner animation="border" size="sm" className="me-2" />}
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GestionAreasConvocatoria;
