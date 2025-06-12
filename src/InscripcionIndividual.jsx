import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';
import emailjs from '@emailjs/browser';
import { Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';

// Inicializar EmailJS con tu User ID
emailjs.init({
  publicKey: "UG8Ii-NDlFP7m-iXP",
  blockHeadless: true,
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

// Función para enviar correo
const sendEmail = async (toEmail, subject, message, templateParams = {}) => {
  try {
    // Verificar que el correo del destinatario no esté vacío
    if (!toEmail || !toEmail.includes('@')) {
      console.error('Correo del destinatario inválido:', toEmail);
      return false;
    }

    console.log('Intentando enviar correo con EmailJS...');
    console.log('Parámetros:', {
      email: toEmail,
      subject: subject,
      message: message,
      ...templateParams
    });

    // Asegurarse de que el correo se pase como email (no to_email)
    const emailParams = {
      email: toEmail,
      subject: subject,
      message: message,
      ...templateParams
    };

    console.log('Parámetros finales para EmailJS:', emailParams);

    const response = await emailjs.send(
      "service_pj9u56o",
      "template_30m993y",
      emailParams,
      {
        publicKey: "UG8Ii-NDlFP7m-iXP"
      }
    );

    console.log("Respuesta de EmailJS:", response);
    
    if (response.status === 200) {
      console.log("Correo enviado exitosamente!");
      return true;
    } else {
      console.error("Error en la respuesta de EmailJS:", response);
      return false;
    }
  } catch (error) {
    console.error("Error detallado al enviar el correo:", {
      message: error.message,
      status: error.status,
      text: error.text,
      stack: error.stack
    });
    return false;
  }
};

// Función para enviar correo de registro
export const sendRegistrationEmail = async (email, username, password) => {
  const subject = "Bienvenido a TIS - Tus credenciales de acceso";
  const message = `¡Bienvenido a TIS! 
  
Tus credenciales de acceso son:
Usuario: ${username}
Contraseña: ${password}

Por favor, guarda esta información en un lugar seguro.`;

  return sendEmail(email, subject, message);
};

// Función para enviar correo de inscripción
export const sendInscriptionEmail = async (email, areas, total) => {
  const subject = "Confirmación de Inscripción - TIS";
  const message = `¡Tu inscripción ha sido registrada exitosamente!

Áreas inscritas:
${areas.map(area => `- ${area.nombre}`).join('\n')}

Total a pagar: $${total}

Por favor, procede a generar tu orden de pago.`;

  return sendEmail(email, subject, message);
};

// Función para enviar correo de orden de pago
export const sendPaymentOrderEmail = async (email, areas, total, paymentDetails) => {
  const subject = "Orden de Pago Generada - TIS";
  const message = `Tu orden de pago ha sido generada exitosamente.

Detalles de la inscripción:
${areas.map(area => `- ${area.nombre}`).join('\n')}

Total a pagar: $${total}

Detalles del pago:
${paymentDetails}

Por favor, realiza el pago según las instrucciones proporcionadas.`;

  return sendEmail(email, subject, message);
};

function InscripcionIndividual({ navigate: customNavigate }) {
  const { studentId } = useParams();
  const { currentUser } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [config, setConfig] = useState(null);

  // Usar el navigate personalizado si se proporciona, o el hook useNavigate por defecto
  const defaultNavigate = useNavigate();
  const navigate = customNavigate || defaultNavigate;

  // Definición de áreas disponibles por curso
  const areasCursos = {
    'Astronomía': [
      '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Biología': [
      '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Física': [
      '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Informática': [
      '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Matemática': [
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Química': [
      '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Robótica': [
      '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ]
  };

  // Función para convertir el valor numérico del curso a texto
  const getCursoTexto = (cursoNumero) => {
    // Validar que sea un número
    const curso = Number(cursoNumero);
    if (isNaN(curso)) return '';
    
    if (curso <= 6) {
      return `${curso}° Primaria`;
    } else {
      return `${curso - 6}° Secundaria`;
    }
  };

    const fetchConfig = async () => {
      try {
      // Obtener la convocatoria seleccionada del sessionStorage
      const convocatoriaSeleccionadaStr = sessionStorage.getItem('convocatoriaSeleccionada');
      if (!convocatoriaSeleccionadaStr) {
        throw new Error('No has seleccionado una convocatoria. Debes seleccionar una convocatoria primero.');
      }

      const convocatoriaSeleccionada = JSON.parse(convocatoriaSeleccionadaStr);
      console.log("FetchConfig: Convocatoria seleccionada:", convocatoriaSeleccionada);
      
      if (!convocatoriaSeleccionada) {
        throw new Error('La convocatoria seleccionada no existe o ha sido eliminada.');
      }

      // Verificar fechas de inscripción
      const fechaActual = new Date();
      const fechaInicio = new Date(convocatoriaSeleccionada.fecha_inicio_inscripciones);
      const fechaFin = new Date(convocatoriaSeleccionada.fecha_fin_inscripciones);

      if (fechaActual < fechaInicio) {
        throw new Error('Las inscripciones para esta convocatoria aún no han comenzado.');
      }

      if (fechaActual > fechaFin) {
        throw new Error('Las inscripciones para esta convocatoria ya han finalizado.');
      }

      setConfig(convocatoriaSeleccionada);
      
      // Usar las áreas de la convocatoria seleccionada
      if (Array.isArray(convocatoriaSeleccionada.areas) && convocatoriaSeleccionada.areas.length > 0) {
        setAvailableAreas(convocatoriaSeleccionada.areas);
        setAllAreas(convocatoriaSeleccionada.areas);
        console.log("FetchConfig: Áreas de la convocatoria cargadas:", convocatoriaSeleccionada.areas);
      } else {
        throw new Error('No hay áreas disponibles para esta convocatoria.');
      }

      } catch (err) {
        console.error('Error al cargar configuración:', err);
      setError(err.message || 'Error al cargar la configuración de la convocatoria.');
      setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
      }
    };
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Obtener datos del estudiante
        let studentData;
        try {
          studentData = await apiService.getCurrentStudent();
          if (!studentData || !studentData.id) {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        } catch (studentError) {
          console.error('Error al obtener datos del estudiante:', studentError);
          if (currentUser) {
            studentData = currentUser;
          } else {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        }

        setEstudiante(studentData);
        await fetchConfig();

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  // Actualizar el total cuando cambien las áreas seleccionadas
  useEffect(() => {
    setTotal(areasSeleccionadas.length * (config?.costo_por_area || 16));
  }, [areasSeleccionadas, config]);

  const handleAreaChange = (areaId) => {
    setAreasSeleccionadas(prev => {
      // Si ya está seleccionada, quitarla
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } 
      // Si no está seleccionada, verificar si ya alcanzó el máximo
      else {
        if (config && prev.length >= config.maxAreasEstudiante) {
          setMensaje(`No puede seleccionar más de ${config.maxAreasEstudiante} áreas.`);
          setTimeout(() => setMensaje(''), 3000);
          return prev;
        }
        return [...prev, areaId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (areasSeleccionadas.length === 0) {
      setError('Debe seleccionar al menos un área académica.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMensaje('');
    
    try {
      console.log('Enviando datos de inscripción:');
      console.log('Student ID:', estudiante.id);
      console.log('Áreas seleccionadas:', areasSeleccionadas);
      
      // Guardar la inscripción en localStorage
      const inscripcion = {
        id: Date.now(),
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          ci: estudiante.ci,
          curso: estudiante.curso,
          colegio: estudiante.colegio
        },
        convocatoria: config,
        areas: areasSeleccionadas.map(areaId => {
          const area = availableAreas.find(a => a.id === areaId);
          return {
            id: area.id,
            nombre: area.nombre,
            descripcion: area.descripcion
          };
        }),
        fechaInscripcion: new Date().toISOString(),
        estado: 'pendiente',
        costoTotal: areasSeleccionadas.length * (config?.costo_por_area || 16)
      };

      // Guardar en localStorage
      const inscripcionesKey = 'olimpiadas_inscripciones';
      const inscripciones = JSON.parse(localStorage.getItem(inscripcionesKey) || '[]');
      inscripciones.push(inscripcion);
      localStorage.setItem(inscripcionesKey, JSON.stringify(inscripciones));

      // Guardar la inscripción actual en sessionStorage para la orden de pago
      sessionStorage.setItem('inscripcionActual', JSON.stringify(inscripcion));
      
      setMensaje('Áreas seleccionadas correctamente. Redirigiendo a la orden de pago...');
      
      // Redirigir a la página de orden de pago después de 2 segundos
        setTimeout(() => {
        navigate('/estudiante/orden-pago');
        }, 2000);

    } catch (err) {
      console.error('Error al inscribir áreas:', err);
      setError(err.message || 'Ocurrió un error al procesar la inscripción. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Redirección basada en el tipo de usuario
    if (currentUser.tipoUsuario === 'estudiante') {
      navigate('/estudiante/areas');
    } else {
      navigate('/tutor/estudiantes');
    }
  };

  // Obtener el nombre del área por su ID
  const getAreaName = (areaId) => {
    const area = allAreas.find(a => a.id === areaId);
    return area ? area.nombre : areaId;
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">
              Inscripción a {config?.nombre || 'Áreas Olímpicas'}
            </h2>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando información...</p>
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>Información del Estudiante</h5>
                    <p><strong>Nombre:</strong> {estudiante?.nombre} {estudiante?.apellido}</p>
                    <p><strong>CI:</strong> {estudiante?.ci}</p>
                    <p><strong>Curso:</strong> {estudiante?.curso <= 6 ? `${estudiante?.curso}° Primaria` : `${estudiante?.curso - 6}° Secundaria`}</p>
                    <p><strong>Colegio:</strong> {estudiante?.colegio?.nombre || 'No asignado'}</p>
                  </Col>
                  <Col md={6}>
                    <h5>Información de la Convocatoria</h5>
                    <p><strong>Período de Inscripción:</strong></p>
                    <p>{new Date(config?.fecha_inicio_inscripciones).toLocaleDateString()} al {new Date(config?.fecha_fin_inscripciones).toLocaleDateString()}</p>
                    <p><strong>Costo por área:</strong> Bs. {config?.costo_por_area || 16}</p>
                    <p><strong>Máximo de áreas:</strong> {config?.maximo_areas || 2} por estudiante</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <form onSubmit={handleSubmit}>
              <div className="areas-selection">
                <h3>Selección de Áreas (máximo {config?.maximo_areas || 2})</h3>
                <p className="areas-price-info">Precio por área: Bs. {config?.costo_por_area || 16}</p>
                
                <div className="checkbox-group areas-list">
                  {availableAreas.map(area => {
                    const isSelected = areasSeleccionadas.includes(area.id);
                    return (
                      <div 
                        key={area.id} 
                        className={`area-option`}
                      >
                        <input
                          type="checkbox"
                          id={`area-${area.id}`}
                          name="area"
                          value={area.id}
                          checked={isSelected}
                          onChange={() => handleAreaChange(area.id)}
                          disabled={areasSeleccionadas.length >= 2 && !isSelected}
                        />
                        <label 
                          htmlFor={`area-${area.id}`}
                        >
                          {area.nombre}
                          <p className="area-description">{area.descripcion}</p>
                        </label>
                      </div>
                    );
                  })}
                </div>
                
                {availableAreas.length > 0 && (
                  <div className="areas-info">
                    <p>Áreas disponibles para {estudiante.curso}:</p>
                    <ul>
                      {availableAreas.map(area => (
                        <li key={area.id}>{area.nombre}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {availableAreas.length === 0 && (
                  <div className="areas-info">
                    <p>No hay áreas disponibles para tu curso actualmente.</p>
                  </div>
                )}
                
                <div className="price-summary">
                  <p><strong>Áreas seleccionadas:</strong> {areasSeleccionadas.length}</p>
                  <p><strong>Costo total:</strong> Bs. {areasSeleccionadas.length * (config?.costo_por_area || 16)}</p>
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="button" onClick={handleBack} className="back-button">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isSubmitting || areasSeleccionadas.length === 0}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Selección'}
                </button>
      </div>
            </form>
          </>
        )}
      </Container>
    );
  }

  if (error) {
    return (
      <div className="inscripcion-form error-container">
        <p className="error-message">{error}</p>
        <button onClick={handleBack} className="back-button">Volver</button>
      </div>
    );
  }

  return (
    <div className="inscripcion-form">
      <h2>Inscripción a {config?.nombre || 'Áreas Olímpicas'}</h2>
      
      {mensaje && <div className="success-message">{mensaje}</div>}
      
      <div className="student-info">
        <h3>Información del Estudiante</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Nombre:</span>
            <span className="info-value">{estudiante.nombre} {estudiante.apellidos || estudiante.apellido}</span>
          </div>
          <div className="info-item">
            <span className="info-label">CI:</span>
            <span className="info-value">{estudiante.ci}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Curso:</span>
            <span className="info-value">{estudiante.curso}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Colegio:</span>
            <span className="info-value">{estudiante.colegio?.nombre || estudiante.colegio}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="areas-selection">
          <h3>Selección de Áreas (máximo {config?.maximo_areas || 2})</h3>
          <p className="areas-price-info">Precio por área: Bs. {config?.costo_por_area || 16}</p>
          
          <div className="checkbox-group areas-list">
            {availableAreas.map(area => {
              const isSelected = areasSeleccionadas.includes(area.id);
              return (
                <div 
                  key={area.id} 
                  className={`area-option`}
                >
                  <input
                    type="checkbox"
                    id={`area-${area.id}`}
                    name="area"
                    value={area.id}
                    checked={isSelected}
                    onChange={() => handleAreaChange(area.id)}
                    disabled={areasSeleccionadas.length >= 2 && !isSelected}
                  />
                  <label 
                    htmlFor={`area-${area.id}`}
                  >
                    {area.nombre}
                    <p className="area-description">{area.descripcion}</p>
                  </label>
                </div>
              );
            })}
          </div>
          
          {availableAreas.length > 0 && (
            <div className="areas-info">
              <p>Áreas disponibles para {estudiante.curso}:</p>
              <ul>
                {availableAreas.map(area => (
                  <li key={area.id}>{area.nombre}</li>
                ))}
              </ul>
            </div>
          )}
          
          {availableAreas.length === 0 && (
            <div className="areas-info">
              <p>No hay áreas disponibles para tu curso actualmente.</p>
            </div>
          )}
          
          <div className="price-summary">
            <p><strong>Áreas seleccionadas:</strong> {areasSeleccionadas.length}</p>
            <p><strong>Costo total:</strong> Bs. {areasSeleccionadas.length * (config?.costo_por_area || 16)}</p>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="button" onClick={handleBack} className="back-button">
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting || areasSeleccionadas.length === 0}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Selección'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InscripcionIndividual;