import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';
import emailjs from '@emailjs/browser';

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

  const PRECIO_POR_AREA = 16; // Precio en dólares por área

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

  // Obtener configuración de olimpiadas para el límite de áreas
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await apiService.getOlympiadConfig();
        setConfig(configData);
      } catch (err) {
        console.error('Error al cargar configuración:', err);
      }
    };
    
    fetchConfig();
  }, []);

  // Cargar datos del estudiante y áreas disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Obtener todas las áreas
        const areasData = await apiService.getAreas();
        setAllAreas(areasData);
        
        // Obtener datos del estudiante según el contexto
        let data;
        try {
          if (currentUser.tipoUsuario === 'estudiante') {
            // Si es un estudiante, obtener sus propios datos
            data = await apiService.getCurrentStudent();
            console.log("Datos del estudiante actual obtenidos:", data);
          } else if (studentId) {
            // Si es un tutor accediendo a un estudiante específico
            data = await apiService.getStudentById(studentId);
            console.log("Datos del estudiante por ID obtenidos:", data);
          } else {
            throw new Error('No se puede identificar al estudiante');
          }
        } catch (err) {
          console.error("Error al cargar datos del estudiante:", err);
          // Intentar cargar datos del usuario actual como respaldo
          if (currentUser) {
            console.log("Usando datos del usuario actual como respaldo");
            data = {
              ...currentUser,
              areasInscritas: currentUser.areasInscritas || []
            };
          } else {
            throw new Error('No se pudo obtener información del estudiante');
          }
        }
        
        setEstudiante(data);
        
        // Convertir el curso numérico a texto para comparar con las áreas disponibles
        const cursoTexto = getCursoTexto(data.curso);
        console.log("Curso del estudiante (texto):", cursoTexto);
        
        // Determinar áreas disponibles según el curso
        const areasDisponiblesNombres = Object.keys(areasCursos).filter(areaNombre => 
          areasCursos[areaNombre].includes(cursoTexto)
        );
        console.log("Áreas disponibles para este curso:", areasDisponiblesNombres);
        
        const areasDisponibles = areasData.filter(area => 
          areasDisponiblesNombres.includes(area.nombre)
        );
        console.log("Áreas disponibles (objetos completos):", areasDisponibles);
        
        setAvailableAreas(areasDisponibles);
        
        // Si el estudiante ya tiene áreas inscritas, seleccionarlas
        if (data.areasInscritas && data.areasInscritas.length > 0) {
          setAreasSeleccionadas(data.areasInscritas);
          setTotal(data.areasInscritas.length * PRECIO_POR_AREA);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError('Ocurrió un error al cargar la información. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, currentUser]);

  // Actualizar el total cuando cambien las áreas seleccionadas
  useEffect(() => {
    setTotal(areasSeleccionadas.length * PRECIO_POR_AREA);
  }, [areasSeleccionadas]);

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
      
      let result;
      
      if (currentUser.tipoUsuario === 'estudiante') {
        // Usar updateStudentAreas para estudiantes (no genera orden de pago inmediatamente)
        result = await apiService.updateStudentAreas(currentUser.id, areasSeleccionadas);
        console.log("Inscripción de estudiante actualizada:", result);
        
        setMensaje('Áreas seleccionadas correctamente. Ahora debes generar tu orden de pago.');
        
        // Esperar 2 segundos y redirigir
        setTimeout(() => {
          if (customNavigate) {
            customNavigate('/estudiante/areas');
          } else {
            navigate('/estudiante/areas');
          }
        }, 2000);
      } else {
        // Para tutores
        setError('Esta funcionalidad está disponible solo para estudiantes.');
      }
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
      <div className="inscripcion-form loading-container">
        <p>Cargando información del estudiante...</p>
      </div>
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
      <h2>Inscripción a Áreas Olímpicas</h2>
      
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
          <h3>Selección de Áreas (máximo 2)</h3>
          <p className="areas-price-info">Precio por área: ${PRECIO_POR_AREA}</p>
          
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
            <p>Número de áreas seleccionadas: <strong>{areasSeleccionadas.length}</strong></p>
            <p className="total-price">Total a pagar: <strong>${total}</strong></p>
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