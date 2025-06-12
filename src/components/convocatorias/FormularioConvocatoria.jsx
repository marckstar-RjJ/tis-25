import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

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
  
  // Estados para agregar nueva área
  const [nuevaArea, setNuevaArea] = useState({ nombre: '', descripcion: '' });
  const [requisitosArea, setRequisitosArea] = useState({});
  const [mostrarFormularioArea, setMostrarFormularioArea] = useState(false);
  
  const esNuevaConvocatoria = !convocatoriaId;
  
  // Lista de cursos disponibles con nombres descriptivos
  const cursosDisponibles = [
    { id: 1, nombre: '1° Primaria' },
    { id: 2, nombre: '2° Primaria' },
    { id: 3, nombre: '3° Primaria' },
    { id: 4, nombre: '4° Primaria' },
    { id: 5, nombre: '5° Primaria' },
    { id: 6, nombre: '6° Primaria' },
    { id: 7, nombre: '1° Secundaria' },
    { id: 8, nombre: '2° Secundaria' },
    { id: 9, nombre: '3° Secundaria' },
    { id: 10, nombre: '4° Secundaria' },
    { id: 11, nombre: '5° Secundaria' },
    { id: 12, nombre: '6° Secundaria' }
  ];
  
  // Cargar áreas disponibles al iniciar
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        // Obtener áreas del localStorage
        const areasKey = 'olimpiadas_areas';
        const areasGuardadas = JSON.parse(localStorage.getItem(areasKey) || '[]');
        
        // Si no hay áreas guardadas, usar las áreas por defecto
        if (areasGuardadas.length === 0) {
          const areasPorDefecto = [
            { id: Date.now(), nombre: 'Matemática', descripcion: 'Área de matemática' },
            { id: Date.now() + 1, nombre: 'Física', descripcion: 'Área de física' },
            { id: Date.now() + 2, nombre: 'Química', descripcion: 'Área de química' },
            { id: Date.now() + 3, nombre: 'Biología', descripcion: 'Área de biología' },
            { id: Date.now() + 4, nombre: 'Informática', descripcion: 'Área de informática' }
          ];
          localStorage.setItem(areasKey, JSON.stringify(areasPorDefecto));
          setAreasDisponibles(areasPorDefecto);
        } else {
          setAreasDisponibles(areasGuardadas);
        }
      } catch (err) {
        console.error('Error al cargar áreas:', err);
        setError('Error al cargar las áreas disponibles');
      }
    };
    
    cargarAreas();
  }, []);
  
  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Cargando datos para convocatoria:', convocatoriaId);
        
        // Si es edición, cargar datos de la convocatoria del localStorage
        if (convocatoriaId) {
          const convocatorias = JSON.parse(localStorage.getItem('convocatorias') || '[]');
          console.log('Convocatorias encontradas:', convocatorias);
          
          const convocatoria = convocatorias.find(c => c.id === convocatoriaId);
          console.log('Convocatoria a editar:', convocatoria);
          
          if (convocatoria) {
            const formDataActualizado = {
              nombre: convocatoria.nombre || '',
              fecha_inicio_inscripciones: convocatoria.fecha_inicio?.substring(0, 10) || '',
              fecha_fin_inscripciones: convocatoria.fecha_fin?.substring(0, 10) || '',
              costo_por_area: convocatoria.costo_por_area || '',
              maximo_areas: convocatoria.maximo_areas || 2,
              activa: convocatoria.activa ?? true,
              areas: convocatoria.areas?.map(area => area.id) || []
            };
            console.log('FormData actualizado:', formDataActualizado);
            setFormData(formDataActualizado);
          } else {
            console.error('No se encontró la convocatoria con ID:', convocatoriaId);
            setError('No se encontró la convocatoria');
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
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
    setNuevaArea({ ...nuevaArea, nombre: e.target.value });
  };
  
  // Manejar cambios en el campo de descripción de nueva área
  const handleChangeNuevaAreaDescripcion = (e) => {
    setNuevaArea({ ...nuevaArea, descripcion: e.target.value });
  };
  
  // Agregar una nueva área
  const handleAgregarArea = (e) => {
    e.preventDefault();
    try {
      // Validar que los campos no estén vacíos
      if (!nuevaArea.nombre.trim()) {
        throw new Error('El nombre del área es obligatorio');
      }
      
      // Obtener áreas actuales del localStorage
      const areasKey = 'olimpiadas_areas';
      const areasActuales = JSON.parse(localStorage.getItem(areasKey) || '[]');
      
      // Verificar si el área ya existe (ignorando mayúsculas/minúsculas)
      const areaExistente = areasActuales.find(
        area => area.nombre.toLowerCase() === nuevaArea.nombre.toLowerCase()
      );
      
      if (areaExistente) {
        throw new Error(`El área "${nuevaArea.nombre}" ya existe`);
      }
      
      // Crear nueva área con ID único
      const nuevaAreaConId = {
        ...nuevaArea,
        id: Date.now(), // Usar timestamp como ID único
        nombre: nuevaArea.nombre.trim()
      };
      
      // Actualizar el estado local
      setAreasDisponibles(prev => [...prev, nuevaAreaConId]);
      
      // Actualizar el localStorage
      const areasActualizadas = [...areasActuales, nuevaAreaConId];
      localStorage.setItem(areasKey, JSON.stringify(areasActualizadas));
      
      // Limpiar el formulario
      setNuevaArea({ nombre: '', descripcion: '' });
      setMostrarFormularioArea(false);
      
    } catch (err) {
      console.error('Error al agregar área:', err);
      setError(err.message);
    }
  };
  
  const handleAreaChange = (areaId) => {
    setFormData(prev => {
      const areas = prev.areas.includes(areaId)
        ? prev.areas.filter(id => id !== areaId)
        : [...prev.areas, areaId];
      
      // Si se está agregando un área, inicializar sus requisitos
      if (!prev.areas.includes(areaId)) {
        setRequisitosArea(prev => ({
          ...prev,
          [areaId]: { min: 1, max: 12, paraTodos: false }
        }));
      } else {
        // Si se está eliminando un área, eliminar sus requisitos
        setRequisitosArea(prev => {
          const newRequisitos = { ...prev };
          delete newRequisitos[areaId];
          return newRequisitos;
        });
      }
      
      return { ...prev, areas };
    });
  };

  const handleRequisitosChange = (areaId, field, value) => {
    setRequisitosArea(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        [field]: value,
        // Si se marca "para todos", establecer el rango completo
        ...(field === 'paraTodos' && value ? { min: 1, max: 12 } : {})
      }
    }));
  };
  
  const handleEliminarArea = (areaId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta área? Esta acción no se puede deshacer.')) {
      try {
        const areasKey = 'olimpiadas_areas';
        
        // Actualizar el estado local
        setAreasDisponibles(prev => prev.filter(area => area.id !== areaId));
        
        // Si el área estaba seleccionada, quitarla de las áreas seleccionadas
        setFormData(prev => ({
          ...prev,
          areas: prev.areas.filter(id => id !== areaId)
        }));
        
        // Eliminar los requisitos del área
        setRequisitosArea(prev => {
          const newRequisitos = { ...prev };
          delete newRequisitos[areaId];
          return newRequisitos;
        });

        // Actualizar el localStorage de áreas
        const areasActuales = JSON.parse(localStorage.getItem(areasKey) || '[]');
        const areasActualizadas = areasActuales.filter(area => area.id !== areaId);
        localStorage.setItem(areasKey, JSON.stringify(areasActualizadas));

        // Actualizar las convocatorias que puedan tener esta área
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        const convocatoriasActualizadas = convocatorias.map(convocatoria => ({
          ...convocatoria,
          areas: convocatoria.areas.filter(area => area.id !== areaId)
        }));
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatoriasActualizadas));

        // Actualizar las inscripciones que puedan tener esta área
        const inscripcionesKey = 'olimpiadas_inscripciones';
        const inscripciones = JSON.parse(localStorage.getItem(inscripcionesKey) || '[]');
        const inscripcionesActualizadas = inscripciones.map(inscripcion => ({
          ...inscripcion,
          areas: inscripcion.areas.filter(area => area.id !== areaId)
        }));
        localStorage.setItem(inscripcionesKey, JSON.stringify(inscripcionesActualizadas));

        // Forzar una recarga de las áreas disponibles
        const areasActualizadasFinal = JSON.parse(localStorage.getItem(areasKey) || '[]');
        setAreasDisponibles(areasActualizadasFinal);
      } catch (err) {
        console.error('Error al eliminar área:', err);
        alert('Error al eliminar el área. Por favor, inténtalo de nuevo.');
      }
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
      hoy.setHours(0, 0, 0, 0);
      
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
        fecha_inicio: formData.fecha_inicio_inscripciones,
        fecha_fin: formData.fecha_fin_inscripciones
      };
      
      // Obtener convocatorias actuales del localStorage
      const convocatorias = JSON.parse(localStorage.getItem('convocatorias') || '[]');
      
      let convocatoria;
      
      if (esNuevaConvocatoria) {
        // Crear nueva convocatoria
        const nuevoId = Date.now();
        convocatoria = {
          id: nuevoId,
          ...formDataFormatted,
          areas: areasDisponibles
            .filter(area => formData.areas.includes(area.id))
            .map(area => ({
              id: area.id,
              nombre: area.nombre,
              descripcion: area.descripcion,
              requisitos: requisitosArea[area.id]?.paraTodos 
                ? ['1-12'] 
                : [`${requisitosArea[area.id]?.min}-${requisitosArea[area.id]?.max}`]
            }))
        };
        convocatorias.push(convocatoria);
      } else {
        // Actualizar convocatoria existente
        const index = convocatorias.findIndex(c => c.id === convocatoriaId);
        if (index !== -1) {
          convocatoria = {
            ...convocatorias[index],
            ...formDataFormatted,
            areas: areasDisponibles
              .filter(area => formData.areas.includes(area.id))
              .map(area => ({
                id: area.id,
                nombre: area.nombre,
                descripcion: area.descripcion,
                requisitos: requisitosArea[area.id]?.paraTodos 
                  ? ['1-12'] 
                  : [`${requisitosArea[area.id]?.min}-${requisitosArea[area.id]?.max}`]
              }))
          };
          convocatorias[index] = convocatoria;
        } else {
          throw new Error('No se encontró la convocatoria a actualizar');
        }
      }
      
      // Guardar en localStorage
      localStorage.setItem('convocatorias', JSON.stringify(convocatorias));
      
      console.log('Convocatoria guardada:', convocatoria);
      onGuardado();
      
    } catch (err) {
      console.error('Error al guardar convocatoria:', err);
      setError(err.message || 'Error al guardar la convocatoria. Por favor, inténtalo de nuevo.');
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
            
            <div className="mt-4 mb-3">
              <h5>Áreas Disponibles</h5>
              <div className="areas-list">
                {areasDisponibles.map(area => (
                  <div key={area.id} className="area-item mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`area-${area.id}`}
                          checked={formData.areas.includes(area.id)}
                          onChange={() => handleAreaChange(area.id)}
                        />
                        <label className="form-check-label" htmlFor={`area-${area.id}`}>
                          {area.nombre}
                        </label>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminarArea(area.id)}
                        title="Eliminar área permanentemente"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                    
                    {formData.areas.includes(area.id) && (
                      <div className="ms-4 mt-2">
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`para-todos-${area.id}`}
                            checked={requisitosArea[area.id]?.paraTodos || false}
                            onChange={(e) => handleRequisitosChange(area.id, 'paraTodos', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={`para-todos-${area.id}`}>
                            Permitir para todos los cursos
                          </label>
                        </div>
                        
                        {!requisitosArea[area.id]?.paraTodos && (
                          <div className="row g-2">
                            <div className="col">
                              <label className="form-label">Curso mínimo</label>
                              <select
                                className="form-select"
                                value={requisitosArea[area.id]?.min || 1}
                                onChange={(e) => handleRequisitosChange(area.id, 'min', parseInt(e.target.value))}
                              >
                                {cursosDisponibles.map(curso => (
                                  <option key={curso.id} value={curso.id}>
                                    {curso.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col">
                              <label className="form-label">Curso máximo</label>
                              <select
                                className="form-select"
                                value={requisitosArea[area.id]?.max || 12}
                                onChange={(e) => handleRequisitosChange(area.id, 'max', parseInt(e.target.value))}
                              >
                                {cursosDisponibles
                                  .filter(curso => curso.id >= (requisitosArea[area.id]?.min || 1))
                                  .map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                      {curso.nombre}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 mb-3">
              <h5>Agregar Nueva Área</h5>
              <div className="d-flex align-items-end">
                <Form.Group className="flex-grow-1 me-2 mb-0">
                  <Form.Label>Nombre del Área</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaArea.nombre}
                    onChange={handleChangeNuevaArea}
                    placeholder="Ej: Informática"
                  />
                </Form.Group>
                <Form.Group className="flex-grow-1 me-2 mb-0">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaArea.descripcion}
                    onChange={handleChangeNuevaAreaDescripcion}
                    placeholder="Descripción breve"
                  />
                </Form.Group>
                <Button 
                  variant="outline-primary" 
                  onClick={handleAgregarArea}
                  disabled={!nuevaArea.nombre || guardando}
                >
                  {guardando ? <Spinner size="sm" animation="border" /> : '+'} Agregar
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
