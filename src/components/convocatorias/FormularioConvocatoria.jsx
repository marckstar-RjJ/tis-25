import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { apiService } from '../../services/api';

const FormularioConvocatoria = ({ convocatoriaId, onGuardado, onCancelar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio_inscripciones: '',
    fecha_fin_inscripciones: '',
    costo_por_area: '',
    maximo_areas: 2,
    activa: true,
    areas: []
  });
  
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargandoAreas, setCargandoAreas] = useState(false);
  
  // Estados para agregar nueva área
  const [nuevaArea, setNuevaArea] = useState('');
  const [nuevaAreaDescripcion, setNuevaAreaDescripcion] = useState('');
  const [agregandoArea, setAgregandoArea] = useState(false);
  
  const esNuevaConvocatoria = !convocatoriaId;
  
  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      setCargandoAreas(true); // Indicamos que estamos cargando áreas
      
      try {
        // Cargar áreas directamente del localStorage para evitar problemas con la API
        let areas = JSON.parse(localStorage.getItem('olimpiadas_areas') || '[]');
        
        // Si no hay áreas, inicializamos con algunas por defecto
        if (!areas || areas.length === 0) {
          areas = [
            { id: '1', nombre: 'Astronomía', descripcion: 'Olimpiada de Astronomía' },
            { id: '2', nombre: 'Biología', descripcion: 'Olimpiada de Biología' },
            { id: '3', nombre: 'Física', descripcion: 'Olimpiada de Física' },
            { id: '4', nombre: 'Matemáticas', descripcion: 'Olimpiada de Matemáticas' },
            { id: '5', nombre: 'Informática', descripcion: 'Olimpiada de Informática' },
            { id: '6', nombre: 'Robótica', descripcion: 'Olimpiada de Robótica' },
            { id: '7', nombre: 'Química', descripcion: 'Olimpiada de Química' }
          ];
          localStorage.setItem('olimpiadas_areas', JSON.stringify(areas));
        }
        
        setAreasDisponibles(areas);
        
        // Si es edición, cargar datos de la convocatoria
        if (convocatoriaId) {
          try {
            const convocatoria = await apiService.getConvocatoriaById(convocatoriaId);
            
            setFormData({
              nombre: convocatoria.nombre,
              fecha_inicio_inscripciones: convocatoria.fecha_inicio_inscripciones.substring(0, 10), // Formato YYYY-MM-DD
              fecha_fin_inscripciones: convocatoria.fecha_fin_inscripciones.substring(0, 10), // Formato YYYY-MM-DD
              costo_por_area: convocatoria.costo_por_area,
              maximo_areas: convocatoria.maximo_areas,
              activa: convocatoria.activa,
              areas: convocatoria.areas.map(area => area.id)
            });
          } catch (convErr) {
            console.error('Error al cargar convocatoria:', convErr);
            setError('Error al cargar la convocatoria. Por favor, inténtalo de nuevo.');
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        // Siempre establecer estos estados a false cuando termina la carga
        setLoading(false);
        setCargandoAreas(false); // Aseguramos que este estado siempre se resetee
      }
    };
    
    cargarDatos();
  }, [convocatoriaId]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Manejar cambios en el campo de nueva área
  const handleChangeNuevaArea = (e) => {
    setNuevaArea(e.target.value);
  };
  
  // Manejar cambios en la descripción de la nueva área
  const handleChangeNuevaAreaDescripcion = (e) => {
    setNuevaAreaDescripcion(e.target.value);
  };
  
  // Manejar cambios en áreas seleccionadas
  const handleAreaChange = (e) => {
    const { value, checked } = e.target;
    const areaId = parseInt(value, 10);
    
    setFormData(prevState => {
      if (checked) {
        return {
          ...prevState,
          areas: [...prevState.areas, areaId]
        };
      } else {
        return {
          ...prevState,
          areas: prevState.areas.filter(id => id !== areaId)
        };
      }
    });
  };
  
  // Agregar nueva área a la lista de áreas disponibles
  const handleAgregarArea = async (e) => {
    e.preventDefault();
    
    if (!nuevaArea.trim()) {
      alert('Por favor, ingrese un nombre de área válido');
      return;
    }
    
    setAgregandoArea(true);
    setError(null); // Limpiar errores previos
    
    try {
      const nuevaAreaDatos = {
        nombre: nuevaArea,
        descripcion: nuevaAreaDescripcion || `Olimpiada de ${nuevaArea}`
      };
      
      console.log('Creando nueva área:', nuevaAreaDatos);
      
      // Crear el área directamente en localStorage para evitar problemas con la API
      let areas = JSON.parse(localStorage.getItem('olimpiadas_areas') || '[]');
      
      // Generar un ID único
      let nuevoId = 1;
      if (areas.length > 0) {
        const ids = areas.map(a => parseInt(a.id, 10)).filter(id => !isNaN(id));
        if (ids.length > 0) {
          nuevoId = Math.max(...ids) + 1;
        }
      }
      
      // Crear nueva área
      const areaAgregada = {
        id: nuevoId.toString(),
        nombre: nuevaAreaDatos.nombre.trim(),
        descripcion: nuevaAreaDatos.descripcion
      };
      
      // Guardar en localStorage
      const areasActualizadas = [...areas, areaAgregada];
      localStorage.setItem('olimpiadas_areas', JSON.stringify(areasActualizadas));
      
      // Añadir a la lista de áreas disponibles
      setAreasDisponibles([...areasDisponibles, areaAgregada]);
      
      // Seleccionar automáticamente el área recién creada
      setFormData(prevState => ({
        ...prevState,
        areas: [...prevState.areas, areaAgregada.id]
      }));
      
      // Limpiar el formulario
      setNuevaArea('');
      setNuevaAreaDescripcion('');
      
      // Cerrar el collapse
      document.getElementById('collapseAreaForm').classList.remove('show');
      
      // Mostrar mensaje de éxito temporal
      const tempAlert = document.createElement('div');
      tempAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
      tempAlert.innerHTML = `Área <strong>${areaAgregada.nombre}</strong> creada y seleccionada con éxito!`;
      document.body.appendChild(tempAlert);
      
      // Eliminar la alerta después de 3 segundos
      setTimeout(() => {
        document.body.removeChild(tempAlert);
      }, 3000);
      
    } catch (err) {
      console.error('Error al agregar área:', err);
      setError(err.message || 'No se pudo agregar el área. Intente nuevamente.');
      
      // Mantener los datos ingresados para que el usuario pueda corregirlos
      // en lugar de tener que volver a escribir todo
    } finally {
      setAgregandoArea(false);
    }
  };
  
  // Guardar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    
    try {
      // Validaciones básicas
      if (formData.areas.length === 0) {
        throw new Error('Debes seleccionar al menos un área para la convocatoria');
      }
      
      if (new Date(formData.fecha_fin_inscripciones) < new Date(formData.fecha_inicio_inscripciones)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      if (!formData.nombre || formData.nombre.trim() === '') {
        throw new Error('El nombre de la convocatoria es requerido');
      }
      
      // Simular tiempo de proceso para dar retroalimentación visual al usuario
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Obtener convocatorias actuales de localStorage
      const convocatoriasKey = 'olimpiadas_convocatorias';
      let convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      
      let resultado;
      
      // Si estamos creando una nueva convocatoria
      if (esNuevaConvocatoria) {
        // Generar ID único para la nueva convocatoria
        const nuevoId = convocatorias.length > 0 ?
          (Math.max(...convocatorias.map(c => parseInt(c.id, 10))) + 1).toString() :
          '1';
        
        // Obtener áreas completas para la nueva convocatoria
        const areasCompletas = areasDisponibles.filter(area => 
          formData.areas.includes(area.id));
        
        // Crear objeto de nueva convocatoria
        const nuevaConvocatoria = {
          id: nuevoId,
          nombre: formData.nombre.trim(),
          fecha_inicio_inscripciones: new Date(formData.fecha_inicio_inscripciones).toISOString(),
          fecha_fin_inscripciones: new Date(formData.fecha_fin_inscripciones).toISOString(),
          costo_por_area: parseFloat(formData.costo_por_area) || 16.00,
          maximo_areas: parseInt(formData.maximo_areas, 10) || 2,
          activa: formData.activa,
          areas: areasCompletas
        };
        
        // Agregar a la lista y guardar
        convocatorias.push(nuevaConvocatoria);
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
        
        resultado = nuevaConvocatoria;
        console.log('Convocatoria creada:', nuevaConvocatoria);
      } 
      // Si estamos actualizando una convocatoria existente
      else {
        // Encontrar la convocatoria a actualizar
        const index = convocatorias.findIndex(c => c.id === convocatoriaId);
        
        if (index === -1) {
          throw new Error(`No se encontró la convocatoria con ID ${convocatoriaId}`);
        }
        
        // Obtener áreas completas para la convocatoria actualizada
        const areasCompletas = areasDisponibles.filter(area => 
          formData.areas.includes(area.id));
        
        // Actualizar convocatoria
        const convocatoriaActualizada = {
          ...convocatorias[index],
          nombre: formData.nombre.trim(),
          fecha_inicio_inscripciones: new Date(formData.fecha_inicio_inscripciones).toISOString(),
          fecha_fin_inscripciones: new Date(formData.fecha_fin_inscripciones).toISOString(),
          costo_por_area: parseFloat(formData.costo_por_area) || convocatorias[index].costo_por_area,
          maximo_areas: parseInt(formData.maximo_areas, 10) || convocatorias[index].maximo_areas,
          activa: formData.activa,
          areas: areasCompletas
        };
        
        // Actualizar lista y guardar
        convocatorias[index] = convocatoriaActualizada;
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
        
        resultado = convocatoriaActualizada;
        console.log('Convocatoria actualizada:', convocatoriaActualizada);
      }
      
      // Llamar al callback para informar de la operación exitosa
      onGuardado(resultado);
    } catch (err) {
      console.error('Error al guardar convocatoria:', err);
      setError(err.message || 'Error al guardar la convocatoria. Verifica los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando datos...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header as="h5">
        {esNuevaConvocatoria ? 'Nueva Convocatoria' : 'Editar Convocatoria'}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Convocatoria</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Olimpiadas Académicas 2025"
              required
            />
          </Form.Group>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de inicio de inscripciones</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio_inscripciones"
                  value={formData.fecha_inicio_inscripciones}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de fin de inscripciones</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin_inscripciones"
                  value={formData.fecha_fin_inscripciones}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Costo por área (Bs)</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_por_area"
                  value={formData.costo_por_area}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Máximo de áreas por estudiante</Form.Label>
                <Form.Control
                  type="number"
                  name="maximo_areas"
                  value={formData.maximo_areas}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="activa"
              checked={formData.activa}
              onChange={handleChange}
              label="Convocatoria activa"
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <Form.Label>Áreas habilitadas</Form.Label>
              <div>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => document.getElementById('collapseAreaForm').classList.toggle('show')}>
                  <i className="bi bi-plus-circle"></i> Agregar nueva área
                </Button>
              </div>
            </div>
            
            <div className="collapse mb-3" id="collapseAreaForm">
              <Card className="card-body border-primary border-2">
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del área</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaArea}
                    onChange={handleChangeNuevaArea}
                    placeholder="Ej: Astronomía"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaAreaDescripcion}
                    onChange={handleChangeNuevaAreaDescripcion}
                    placeholder="Ej: Olimpiada de Astronomía"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAgregarArea}
                    disabled={agregandoArea || !nuevaArea.trim()}
                  >
                    {agregandoArea ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Agregando...
                      </>
                    ) : (
                      'Agregar Área'
                    )}
                  </Button>
                </div>
              </Card>
            </div>
            
            {areasDisponibles.length === 0 ? (
              <div className="alert alert-info">
                No hay áreas disponibles. Utilice el botón "Agregar nueva área" para crear la primera.
              </div>
            ) : (
              <Row className="mt-2">
                {areasDisponibles.map(area => (
                  <Col md={4} key={area.id}>
                    <Form.Check
                      type="checkbox"
                      id={`area-${area.id}`}
                      label={area.nombre}
                      value={area.id}
                      checked={formData.areas.includes(area.id)}
                      onChange={handleAreaChange}
                      className="mb-2"
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={guardando}
            >
              {guardando && <Spinner animation="border" size="sm" className="me-2" />}
              {esNuevaConvocatoria ? 'Crear Convocatoria' : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioConvocatoria;
