import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { apiService } from '../../services/api';
import { updateConvocatoria, syncConvocatorias } from '../../services/dataSync';

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
  
  // Manejar cambios en el campo de descripción de nueva área
  const handleChangeNuevaAreaDescripcion = (e) => {
    setNuevaAreaDescripcion(e.target.value);
  };
  
  // Agregar una nueva área
  const handleAgregarArea = async () => {
    if (!nuevaArea.trim()) {
      return;
    }
    
    setAgregandoArea(true);
    setError(null);
    
    try {
      // Obtener todas las áreas existentes
      const areas = JSON.parse(localStorage.getItem('olimpiadas_areas') || '[]');
      
      // Verificar si el área ya existe
      const areaExistente = areas.find(a => 
        a.nombre.toLowerCase() === nuevaArea.trim().toLowerCase()
      );
      
      if (areaExistente) {
        throw new Error(`El área "${nuevaArea}" ya existe.`);
      }
      
      // Generar ID único para la nueva área
      const nuevoId = (Math.max(...areas.map(a => parseInt(a.id, 10)), 0) + 1).toString();
      
      // Crear nueva área
      const nuevaAreaObj = {
        id: nuevoId,
        nombre: nuevaArea.trim(),
        descripcion: nuevaAreaDescripcion.trim() || `Olimpiada de ${nuevaArea.trim()}`
      };
      
      // Agregar a la lista de áreas disponibles
      const areasActualizadas = [...areas, nuevaAreaObj];
      
      // Guardar en localStorage
      localStorage.setItem('olimpiadas_areas', JSON.stringify(areasActualizadas));
      
      // Actualizar estado local
      setAreasDisponibles(areasActualizadas);
      
      // Limpiar campos del formulario
      setNuevaArea('');
      setNuevaAreaDescripcion('');
      
      // Seleccionar automáticamente la nueva área
      setFormData(prevState => ({
        ...prevState,
        areas: [...prevState.areas, nuevoId]
      }));
      
      console.log('Área agregada:', nuevaAreaObj);
    } catch (err) {
      console.error('Error al agregar área:', err);
      setError(`Error al agregar área: ${err.message}`);
      
      // Mantener los datos ingresados para que el usuario pueda corregirlos
      // en lugar de tener que volver a escribir todo
    } finally {
      setAgregandoArea(false);
    }
  };
  
  // Guardar la convocatoria
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    
    try {
      // Validar datos antes de guardar
      if (!formData.nombre || !formData.fecha_inicio_inscripciones || !formData.fecha_fin_inscripciones) {
        setError('Por favor, completa todos los campos obligatorios');
        setGuardando(false);
        return;
      }
      
      // Verificar que las fechas sean válidas
      const fechaInicio = new Date(formData.fecha_inicio_inscripciones);
      const fechaFin = new Date(formData.fecha_fin_inscripciones);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación correcta
      
      if (fechaFin < fechaInicio) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio');
        setGuardando(false);
        return;
      }
      
      // Advertir si la convocatoria no va a ser visible para estudiantes debido a las fechas
      if (formData.activa && (fechaInicio > hoy || fechaFin < hoy)) {
        const confirmacion = window.confirm(
          `ADVERTENCIA: Esta convocatoria está marcada como activa, pero las fechas de inscripción no incluyen la fecha actual (${hoy.toLocaleDateString()}).

Fecha inicio: ${fechaInicio.toLocaleDateString()}
Fecha fin: ${fechaFin.toLocaleDateString()}

Los estudiantes NO VERÁN esta convocatoria hasta que las fechas incluyan la fecha actual.

¿Desea continuar de todos modos?`
        );
        
        if (!confirmacion) {
          setGuardando(false);
          return;
        }
      }
      
      // Convertir valores numéricos
      const formDataFormatted = {
        ...formData,
        costo_por_area: parseInt(formData.costo_por_area, 10),
        maximo_areas: parseInt(formData.maximo_areas, 10),
      };
      
      // Determinar si es creación o actualización
      let convocatoria;
      
      console.log('Guardando convocatoria con estos datos:', formDataFormatted);
      
      // Intentar guardar en el backend primero
      try {
        if (esNuevaConvocatoria) {
          // Crear nueva convocatoria en el backend
          const response = await fetch(`http://localhost:8080/api/convocatorias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(formDataFormatted)
          });
          
          if (!response.ok) {
            throw new Error(`Error al crear convocatoria: ${response.status} ${response.statusText}`);
          }
          
          convocatoria = await response.json();
          console.log('Convocatoria creada exitosamente en el backend:', convocatoria);
        } else {
          // Actualizar convocatoria existente en el backend
          const response = await fetch(`http://localhost:8080/api/convocatorias/${convocatoriaId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(formDataFormatted)
          });
          
          if (!response.ok) {
            throw new Error(`Error al actualizar convocatoria: ${response.status} ${response.statusText}`);
          }
          
          convocatoria = await response.json();
          console.log('Convocatoria actualizada exitosamente en el backend:', convocatoria);
        }
      } catch (apiError) {
        console.error('Error al comunicarse con el backend:', apiError);
        console.log('Fallback: Guardando en localStorage solamente');
        
        // Si falla la API, guardar en localStorage como respaldo
        if (esNuevaConvocatoria) {
          // Guardar nueva convocatoria en localStorage
          const convocatoriasKey = 'olimpiadas_convocatorias';
          const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
          
          // Generar ID único simple
          const newId = `conv_${Date.now()}`;
          
          // Crear nueva convocatoria con ID único
          convocatoria = {
            ...formDataFormatted,
            id: newId,
            fecha_creacion: new Date().toISOString(),
            areas: [] // Inicialmente sin áreas asignadas
          };
          
          // Agregar a lista y guardar en localStorage
          convocatorias.push(convocatoria);
          localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
        } else {
          // Actualizar convocatoria existente
          const convocatoriasKey = 'olimpiadas_convocatorias';
          const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
          
          const index = convocatorias.findIndex(c => c.id === convocatoriaId);
          
          if (index >= 0) {
            // Mantener el ID y fecha de creación originales
            convocatoria = {
              ...convocatorias[index],
              ...formDataFormatted,
              fecha_actualizacion: new Date().toISOString()
            };
            
            // Actualizar en el array
            convocatorias[index] = convocatoria;
            localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
          } else {
            throw new Error('No se encontró la convocatoria para actualizar');
          }
        }
      }
      
      // Usar el servicio dataSync para sincronizar los cambios entre sesiones
      if (convocatoria) {
        // Actualizar la convocatoria usando nuestro nuevo servicio
        updateConvocatoria(convocatoria.id || convocatoriaId, convocatoria);
        console.log('Convocatoria sincronizada correctamente usando dataSync');
      } else {
        // Si no tenemos el objeto convocatoria completo (por ejemplo, si hubo un error con la API),
        // sincronizar usando los datos del formulario
        updateConvocatoria(convocatoriaId, {
          ...formDataFormatted,
          id: convocatoriaId || `conv_${Date.now()}`,
          fecha_actualizacion: new Date().toISOString()
        });
        console.log('Convocatoria sincronizada con datos del formulario usando dataSync');
      }
      
      // Informar al componente padre que se guardó correctamente
      onGuardado(convocatoria);
      
    } catch (err) {
      console.error('Error al guardar convocatoria:', err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">{esNuevaConvocatoria ? 'Crear Nueva Convocatoria' : 'Editar Convocatoria'}</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Convocatoria *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Olimpiadas Científicas 2023"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio Inscripciones *</Form.Label>
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
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Fin Inscripciones *</Form.Label>
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
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Costo por Área (Bs.) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="costo_por_area"
                    value={formData.costo_por_area}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Máximo de Áreas por Estudiante *</Form.Label>
                  <Form.Control
                    type="number"
                    name="maximo_areas"
                    value={formData.maximo_areas}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Convocatoria Activa"
                name="activa"
                checked={formData.activa}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Si está activa <strong>Y</strong> la fecha actual está dentro del período de inscripciones,
                los estudiantes podrán ver e inscribirse en esta convocatoria.
              </Form.Text>
              <Alert variant="info" className="mt-2 mb-0">
                <strong>Importante:</strong> Para que una convocatoria aparezca como disponible para los estudiantes, debe cumplir TODAS estas condiciones:
                <ol className="mb-0 mt-1">
                  <li>Estar marcada como "Activa"</li>
                  <li>La fecha actual debe ser mayor o igual que la fecha de inicio de inscripciones</li>
                  <li>La fecha actual debe ser menor o igual que la fecha de fin de inscripciones</li>
                </ol>
              </Alert>
            </Form.Group>
            
            {/* Selección de áreas existentes */}
            <div className="mt-4 mb-3">
              <h5>Seleccionar Áreas Existentes</h5>
              <div className="mb-3">
                <Row xs={1} md={2} lg={3} className="g-3">
                  {areasDisponibles.map(area => (
                    <Col key={area.id}>
                      <Card className={formData.areas.includes(area.id) ? 'bg-light border-primary' : ''}>
                        <Card.Body>
                          <Form.Check
                            type="checkbox"
                            id={`area-${area.id}`}
                            label={<><strong>{area.nombre}</strong><br /><small>{area.descripcion}</small></>}
                            checked={formData.areas.includes(area.id)}
                            onChange={() => {
                              const isSelected = formData.areas.includes(area.id);
                              setFormData(prev => ({
                                ...prev,
                                areas: isSelected
                                  ? prev.areas.filter(id => id !== area.id)
                                  : [...prev.areas, area.id]
                              }));
                            }}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
            
            <div className="mt-4 mb-3">
              <h5>Agregar Nueva Área</h5>
              <div className="d-flex align-items-end">
                <Form.Group className="flex-grow-1 me-2 mb-0">
                  <Form.Label>Nombre del Área</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaArea}
                    onChange={handleChangeNuevaArea}
                    placeholder="Ej: Informática"
                  />
                </Form.Group>
                <Form.Group className="flex-grow-1 me-2 mb-0">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaAreaDescripcion}
                    onChange={handleChangeNuevaAreaDescripcion}
                    placeholder="Descripción breve"
                  />
                </Form.Group>
                <Button 
                  variant="outline-primary" 
                  onClick={handleAgregarArea}
                  disabled={!nuevaArea || agregandoArea}
                >
                  {agregandoArea ? <Spinner size="sm" animation="border" /> : '+'} Agregar
                </Button>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={onCancelar} className="me-2" disabled={guardando}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={guardando}>
                {guardando ? <><Spinner size="sm" animation="border" /> Guardando...</> : 'Guardar Convocatoria'}
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default FormularioConvocatoria;
