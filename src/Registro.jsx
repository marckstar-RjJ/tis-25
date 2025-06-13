import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';
import './Notification.css';
import { apiService } from './services/api';
import { sendRegistrationEmail } from './utils/emailService';

function Registro() {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    departamento: 'LP', // Valor predeterminado
    fechaNacimiento: '',
    curso: '', // Eliminamos el valor predeterminado
    email: '',
    emailTutor: '',
    celular: '',
    celularTutor: '',
    nombreTutor: '',
    apellidosTutor: '',
    colegio: '',
    password: '',
    confirmarPassword: '',
    verificationCode: ''
  });
  const [errores, setErrores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [colegios, setColegios] = useState([]);
  const [cargandoColegios, setCargandoColegios] = useState(true);
  const [tutorColegio] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Lista de departamentos de Bolivia
  const departamentos = [
    { codigo: 'LP', nombre: 'La Paz' },
    { codigo: 'CB', nombre: 'Cochabamba' },
    { codigo: 'SC', nombre: 'Santa Cruz' },
    { codigo: 'PT', nombre: 'Potosí' },
    { codigo: 'OR', nombre: 'Oruro' },
    { codigo: 'CH', nombre: 'Chuquisaca' },
    { codigo: 'TJ', nombre: 'Tarija' },
    { codigo: 'BN', nombre: 'Beni' },
    { codigo: 'PD', nombre: 'Pando' }
  ];

  // Cargar colegios al montar el componente
  useEffect(() => {
    const cargarColegios = async () => {
      try {
        console.log('Intentando cargar colegios...');
        
        // Usar el servicio API centralizado que ya tiene la URL correcta
        const data = await apiService.getColleges();
        console.log('Colegios cargados:', data);
        
        if (!Array.isArray(data)) {
          console.error('La respuesta no es un array:', data);
          throw new Error('Formato de respuesta inválido');
        }
        
        // Mapear los datos para asegurar el formato correcto
        const colegiosFormateados = data.map(colegio => ({
          id: colegio.id,
          nombre: colegio.nombre,
          direccion: colegio.direccion,
          telefono: colegio.telefono
        }));
        
        setColegios(colegiosFormateados);
      } catch (error) {
        console.error('Error al cargar colegios:', error);
        // Cargar datos de colegios de respaldo si falla la carga desde el servidor
        const colegiosRespaldo = [
          { id: 1, nombre: 'Instituto Eduardo Laredo', direccion: 'Av. Principal #123', telefono: '75123456' },
          { id: 2, nombre: 'Colegio Gualberto Villaroel', direccion: 'Calle Sucre #456', telefono: '75654321' },
          { id: 3, nombre: 'Colegio La Salle', direccion: 'Av. La Paz #654', telefono: '75789123' },
          { id: 4, nombre: 'Colegio Loyola', direccion: 'Av. América #789', telefono: '75987654' },
          { id: 5, nombre: 'Colegio Don Bosco', direccion: 'Calle Potosí #987', telefono: '75321654' },
          { id: 6, nombre: 'Colegio Marryknoll', direccion: 'Av. Educación #567', telefono: '75369852' },
          { id: 7, nombre: 'Instituto Domingo Sabio', direccion: 'Calle Escolar #741', telefono: '75147258' }
        ];
        console.log('Usando colegios de respaldo');
        setColegios(colegiosRespaldo);
      } finally {
        setCargandoColegios(false);
      }
    };

    cargarColegios();
  }, []);

  // Reiniciar campos no necesarios cuando cambia el tipo de usuario
  useEffect(() => {
    let newFormData = { ...formData };
    
    if (tipoUsuario === 'administrador') {
      newFormData = {
        ...newFormData,
        fechaNacimiento: '',
        curso: '',
        emailTutor: '',
        celular: '',
        celularTutor: '',
        nombreTutor: '',
        apellidosTutor: '',
        colegio: ''
      };
    } else if (tipoUsuario === 'tutor') {
      newFormData = {
        ...newFormData,
        fechaNacimiento: '',
        curso: '',
        emailTutor: '',
        celularTutor: '',
        nombreTutor: '',
        apellidosTutor: ''
      };
      
      // Establecer colegio predeterminado si hay colegios disponibles
      if (colegios.length > 0 && !newFormData.colegio) {
        newFormData.colegio = colegios[0].id;
      }
    } else if (tipoUsuario === 'estudiante') {
      // Si hay un tutor con sesión iniciada, usar su colegio
      if (tutorColegio) {
        newFormData.colegio = tutorColegio;
      }
      // Si no hay tutor pero hay colegios disponibles
      else if (colegios.length > 0 && !newFormData.colegio) {
        newFormData.colegio = colegios[0].id;
      }
    }
    
    setFormData(newFormData);
  }, [tipoUsuario, colegios, tutorColegio, formData]); // Agregamos formData como dependencia

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación específica para el campo CI
    if (name === 'ci') {
      // Solo permitir números
      const onlyNumbers = value.replace(/\D/g, '');
      
      // Limitar a 9 dígitos
      const limitedValue = onlyNumbers.slice(0, 9);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } else if (name === 'celular' || name === 'celularTutor') {
      // Solo permitir números para celulares
      const onlyNumbers = value.replace(/\D/g, '');
      
      // Limitar a 8 dígitos
      const limitedValue = onlyNumbers.slice(0, 8);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar el error del campo cuando el usuario comienza a escribir
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };

  const handleTipoUsuarioChange = (e) => {
    setTipoUsuario(e.target.value);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validaciones comunes para todos los tipos de usuario
    if (!formData.nombre) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras y espacios';
    }
    
    if (!formData.apellidos) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.length < 2) {
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) {
      nuevosErrores.apellidos = 'Los apellidos solo deben contener letras y espacios';
    }
    
    // Validación de CI
    if (!formData.ci) {
      nuevosErrores.ci = 'El carnet de identidad es requerido';
    } else if (formData.ci.length < 6 || formData.ci.length > 9) {
      nuevosErrores.ci = 'El CI debe tener entre 6 y 9 dígitos';
    } else if (!/^\d+$/.test(formData.ci)) {
      nuevosErrores.ci = 'El CI solo debe contener números';
    }
    
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    } else if (formData.email.length > 100) {
      nuevosErrores.email = 'El email no puede tener más de 100 caracteres';
    }
    
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      nuevosErrores.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    // Validaciones específicas por tipo de usuario
    if (tipoUsuario === 'estudiante') {
      // Validación de fecha de nacimiento
      if (!formData.fechaNacimiento) {
        nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
      } else {
        const fechaNacimiento = new Date(formData.fechaNacimiento);
        const fechaLimite = new Date('2017-07-01');
        const fechaMinima = new Date('2000-01-01');
        
        if (fechaNacimiento >= fechaLimite) {
          nuevosErrores.fechaNacimiento = 'Solo se permiten registros de personas nacidas antes de julio de 2017';
        } else if (fechaNacimiento < fechaMinima) {
          nuevosErrores.fechaNacimiento = 'La fecha de nacimiento no puede ser anterior al año 2000';
        }
      }
      
      if (!formData.curso) {
        nuevosErrores.curso = 'Debe seleccionar un curso';
      }
      
      // Validación de nombre y correo del tutor
      if (!formData.nombreTutor) {
        nuevosErrores.nombreTutor = 'El nombre del tutor es requerido';
      } else if (formData.nombreTutor.length < 2) {
        nuevosErrores.nombreTutor = 'El nombre del tutor debe tener al menos 2 caracteres';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombreTutor)) {
        nuevosErrores.nombreTutor = 'El nombre del tutor solo debe contener letras y espacios';
      } else if (formData.nombreTutor === formData.nombre && formData.apellidosTutor === formData.apellidos) {
        nuevosErrores.nombreTutor = 'El nombre del tutor no puede ser igual al del estudiante';
      }
      
      if (!formData.apellidosTutor) {
        nuevosErrores.apellidosTutor = 'Los apellidos del tutor son requeridos';
      } else if (formData.apellidosTutor.length < 2) {
        nuevosErrores.apellidosTutor = 'Los apellidos del tutor deben tener al menos 2 caracteres';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidosTutor)) {
        nuevosErrores.apellidosTutor = 'Los apellidos del tutor solo deben contener letras y espacios';
      }
      
      if (!formData.emailTutor) {
        nuevosErrores.emailTutor = 'El email del tutor es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.emailTutor)) {
        nuevosErrores.emailTutor = 'El email del tutor no es válido';
      } else if (formData.emailTutor === formData.email) {
        nuevosErrores.emailTutor = 'El email del tutor no puede ser igual al del estudiante';
      } else if (formData.emailTutor.length > 100) {
        nuevosErrores.emailTutor = 'El email del tutor no puede tener más de 100 caracteres';
      }
      
      // Validación de celular de estudiante
      if (!formData.celular) {
        nuevosErrores.celular = 'El número de celular es requerido';
      } else if (formData.celular.length !== 8) {
        nuevosErrores.celular = 'El número de celular debe tener 8 dígitos';
      } else if (!/^[67]\d{7}$/.test(formData.celular)) {
        nuevosErrores.celular = 'El número debe comenzar con 6 o 7 seguido de 7 dígitos';
      }
      
      // Validación de celular de tutor
      if (!formData.celularTutor) {
        nuevosErrores.celularTutor = 'El número de celular del tutor es requerido';
      } else if (formData.celularTutor.length !== 8) {
        nuevosErrores.celularTutor = 'El número de celular del tutor debe tener 8 dígitos';
      } else if (!/^[67]\d{7}$/.test(formData.celularTutor)) {
        nuevosErrores.celularTutor = 'El número debe comenzar con 6 o 7 seguido de 7 dígitos';
      } else if (formData.celularTutor === formData.celular) {
        nuevosErrores.celularTutor = 'El número de celular del tutor no puede ser igual al del estudiante';
      }
    }
    
    if (tipoUsuario === 'tutor') {
      // Validación de código de verificación
      if (!formData.verificationCode) {
        nuevosErrores.verificationCode = 'El código de verificación del colegio es requerido';
      } else if (formData.verificationCode.length !== 4) {
        nuevosErrores.verificationCode = 'El código de verificación debe tener exactamente 4 dígitos';
      } else if (!/^\d{4}$/.test(formData.verificationCode)) {
        nuevosErrores.verificationCode = 'El código de verificación solo debe contener números';
      }

      // Validación de celular de tutor
      if (!formData.celular) {
        nuevosErrores.celular = 'El número de celular es requerido';
      } else if (formData.celular.length !== 8) {
        nuevosErrores.celular = 'El número de celular debe tener 8 dígitos';
      } else if (!/^[67]\d{7}$/.test(formData.celular)) {
        nuevosErrores.celular = 'El número debe comenzar con 6 o 7 seguido de 7 dígitos';
      }
      
      if (!formData.colegio) {
        nuevosErrores.colegio = 'Debe seleccionar un colegio';
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      setIsLoading(true);
      try {
        // Preparar los datos según el tipo de usuario
        const userData = {
          tipoUsuario: tipoUsuario,  // Usar camelCase como espera el backend
          nombre: formData.nombre,
          apellidos: formData.apellidos,  // Usar plural como espera el backend
          ci: `${formData.ci}-${formData.departamento}`,
          email: formData.email,
          password: formData.password
        };
        
        if (tipoUsuario === 'estudiante') {
          // Enviamos en formato camelCase (para validación) y también snake_case (para creación)
          userData.fechaNacimiento = formData.fechaNacimiento;
          userData.curso = Number(formData.curso);
          userData.colegio = Number(formData.colegio);
          userData.emailTutor = formData.emailTutor;
          userData.celular = formData.celular;
          userData.celularTutor = formData.celularTutor;
          userData.nombreTutor = formData.nombreTutor;
          userData.apellidosTutor = formData.apellidosTutor;
          
          // También enviamos en snake_case para la creación del modelo
          userData.fecha_nacimiento = formData.fechaNacimiento;
          userData.colegio_id = Number(formData.colegio);
          userData.email_tutor = formData.emailTutor;
          userData.celular_tutor = formData.celularTutor;
          userData.nombre_tutor = formData.nombreTutor;
          userData.apellido_tutor = formData.apellidosTutor;
          
          // Imprimir en consola para verificar
          console.log('Datos de estudiante para enviar:', {
            curso: userData.curso,
            colegio: userData.colegio,
            colegio_id: userData.colegio_id
          });
        } else if (tipoUsuario === 'tutor') {
          // Enviamos en formato camelCase y snake_case
          userData.celular = formData.celular;
          userData.colegio = Number(formData.colegio);
          
          // También enviamos en snake_case
          userData.telefono = formData.celular;
          userData.colegio_id = Number(formData.colegio);
          userData.verification_code = formData.verificationCode;
          
          // Imprimir en consola para verificar
          console.log('Datos de tutor para enviar:', {
            celular: userData.celular,
            colegio: userData.colegio,
            telefono: userData.telefono,
            colegio_id: userData.colegio_id
          });
        }
        
        // Enviar los datos al servidor
        const result = await apiService.createUser(userData);
        console.log('Usuario registrado:', result);
        
        // Enviar correo de registro
        await sendRegistrationEmail(formData.email, formData.email, formData.password);
        
        // Mostrar notificación en lugar de alert
        setNotificationMessage('Registro exitoso. Se ha enviado un correo con tus credenciales.');
        setShowNotification(true);
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error al registrar:', error);
        
        // Manejar errores específicos
        if (error.response && error.response.data && error.response.data.message) {
          if (error.response.data.message.includes('Código de verificación incorrecto')) {
            setNotificationMessage('Error: El código de verificación del colegio es incorrecto');
          } else {
            setNotificationMessage(`Error al registrar: ${error.response.data.message}`);
          }
        } else {
          setNotificationMessage('Error al registrar usuario');
        }
        setShowNotification(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setNotificationMessage('Por favor, corrija los errores en el formulario');
      setShowNotification(true);
    }
  };

  return (
    <div className="registro-container">
      {showNotification && (
        <div className="notification-modal">
          <div className="notification-content">
            <div className="notification-icon">✓</div>
            <p>{notificationMessage}</p>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <div className="registro-header">
        <Link to="/">
          <img src="/logo_umss.png" alt="Logo UMSS" className="logo" style={{ cursor: 'pointer' }} />
        </Link>
        <h1>Registro de Usuario</h1>
      </div>

      <div className="tipo-usuario-selector">
        <h2>Selecciona el tipo de usuario:</h2>
        <div className="tipo-usuario-options">
          <label>
            <input
              type="radio"
              name="tipoUsuario"
              value="estudiante"
              checked={tipoUsuario === 'estudiante'}
              onChange={handleTipoUsuarioChange}
            />
            Estudiante
          </label>
          <label>
            <input
              type="radio"
              name="tipoUsuario"
              value="tutor"
              checked={tipoUsuario === 'tutor'}
              onChange={handleTipoUsuarioChange}
            />
            Tutor
          </label>
        </div>
      </div>

      <form className="registro-form" onSubmit={handleSubmit}>
        {/* Campos comunes para todos los usuarios */}
        <div className="form-group">
          <label htmlFor="nombre">Nombres</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className={errores.nombre ? 'error' : ''}
          />
          {errores.nombre && <span className="error-message">{errores.nombre}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="apellidos">Apellidos</label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleInputChange}
            className={errores.apellidos ? 'error' : ''}
          />
          {errores.apellidos && <span className="error-message">{errores.apellidos}</span>}
        </div>

        <div className="form-group ci-container" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: '2' }}>
            <label htmlFor="ci">Carnet de Identidad</label>
            <input
              type="text"
              id="ci"
              name="ci"
              value={formData.ci}
              onChange={handleInputChange}
              className={errores.ci ? 'error' : ''}
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Ingrese solo números"
            />
            {errores.ci && <span className="error-message">{errores.ci}</span>}
          </div>
          <div style={{ flex: '1' }}>
            <label htmlFor="departamento">Departamento</label>
            <select
              id="departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
            >
              {departamentos.map(depto => (
                <option key={depto.codigo} value={depto.codigo}>
                  {depto.codigo} - {depto.nombre}
                </option>
              ))}
            </select>
            {errores.departamento && <span className="error-message">{errores.departamento}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errores.email ? 'error' : ''}
          />
          {errores.email && <span className="error-message">{errores.email}</span>}
        </div>

        {/* Campo de selección de colegio - Solo visible para estudiantes y tutores */}
        {tipoUsuario !== 'administrador' && (
          <div className="form-group">
            <label htmlFor="colegio">Colegio</label>
            <select
              id="colegio"
              name="colegio"
              value={formData.colegio}
              onChange={handleInputChange}
              className={errores.colegio ? 'error' : ''}
              required={tipoUsuario !== 'administrador'}
            >
              <option value="">Seleccione un colegio</option>
              {cargandoColegios ? (
                <option value="" disabled>Cargando colegios...</option>
              ) : (
                colegios.map((colegio) => (
                  <option key={colegio.id} value={colegio.id}>
                    {colegio.nombre}
                  </option>
                ))
              )}
            </select>
            {errores.colegio && <span className="error-message">{errores.colegio}</span>}
          </div>
        )}

        {tipoUsuario === 'estudiante' && tutorColegio !== null && (
          <div className="form-group">
            <div className="info-box">
              <p>Tu colegio será asignado automáticamente según el tutor.</p>
            </div>
          </div>
        )}

        {/* Campos específicos para estudiantes */}
        {tipoUsuario === 'estudiante' && (
          <>
            <div className="form-group">
              <label htmlFor="fechaNacimiento">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className={errores.fechaNacimiento ? 'error' : ''}
                max="2017-06-30"
              />
              {errores.fechaNacimiento && <span className="error-message">{errores.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="curso">Curso</label>
              <select
                id="curso"
                name="curso"
                value={formData.curso}
                onChange={handleInputChange}
                className={errores.curso ? 'error' : ''}
              >
                <option value="">Seleccione un curso</option>
                <option value="1">1° Primaria</option>
                <option value="2">2° Primaria</option>
                <option value="3">3° Primaria</option>
                <option value="4">4° Primaria</option>
                <option value="5">5° Primaria</option>
                <option value="6">6° Primaria</option>
                <option value="7">1° Secundaria</option>
                <option value="8">2° Secundaria</option>
                <option value="9">3° Secundaria</option>
                <option value="10">4° Secundaria</option>
                <option value="11">5° Secundaria</option>
                <option value="12">6° Secundaria</option>
              </select>
              {errores.curso && <span className="error-message">{errores.curso}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombreTutor">Nombres del Tutor</label>
              <input
                type="text"
                id="nombreTutor"
                name="nombreTutor"
                value={formData.nombreTutor}
                onChange={handleInputChange}
                className={errores.nombreTutor ? 'error' : ''}
              />
              {errores.nombreTutor && <span className="error-message">{errores.nombreTutor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellidosTutor">Apellidos del Tutor</label>
              <input
                type="text"
                id="apellidosTutor"
                name="apellidosTutor"
                value={formData.apellidosTutor}
                onChange={handleInputChange}
                className={errores.apellidosTutor ? 'error' : ''}
              />
              {errores.apellidosTutor && <span className="error-message">{errores.apellidosTutor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emailTutor">Correo Electrónico del Tutor</label>
              <input
                type="email"
                id="emailTutor"
                name="emailTutor"
                value={formData.emailTutor}
                onChange={handleInputChange}
                className={errores.emailTutor ? 'error' : ''}
              />
              {errores.emailTutor && <span className="error-message">{errores.emailTutor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="celularTutor">Número de Celular del Tutor</label>
              <input
                type="tel"
                id="celularTutor"
                name="celularTutor"
                value={formData.celularTutor}
                onChange={handleInputChange}
                className={errores.celularTutor ? 'error' : ''}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Ej: 60123456, 71234567"
              />
              {errores.celularTutor && <span className="error-message">{errores.celularTutor}</span>}
            </div>
          </>
        )}

        {/* Campos específicos para tutores */}
        {tipoUsuario === 'tutor' && (
          <>
            <div className="form-group">
              <label htmlFor="verificationCode">Código de Verificación del Colegio</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                className={errores.verificationCode ? 'error' : ''}
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="4"
                placeholder="Ej: 1234"
              />
              {errores.verificationCode && <span className="error-message">{errores.verificationCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="celular">Número de Celular</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                className={errores.celular ? 'error' : ''}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Ej: 60123456, 71234567"
              />
              {errores.celular && <span className="error-message">{errores.celular}</span>}
            </div>
          </>
        )}

        {/* Campos de contraseña para todos los usuarios */}
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errores.password ? 'error' : ''}
          />
          {errores.password && <span className="error-message">{errores.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmarPassword"
            name="confirmarPassword"
            value={formData.confirmarPassword}
            onChange={handleInputChange}
            className={errores.confirmarPassword ? 'error' : ''}
          />
          {errores.confirmarPassword && <span className="error-message">{errores.confirmarPassword}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || (tipoUsuario !== 'administrador' && colegios.length === 0)}
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </button>

        <div className="login-link">
          <p>¿Ya tienes una cuenta? <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Inicia sesión</a></p>
        </div>
      </form>
    </div>
  );
}

const styles = `
  .notification-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .notification-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  .notification-icon {
    font-size: 3rem;
    color: #4CAF50;
    margin-bottom: 1rem;
  }

  .notification-content p {
    margin: 1rem 0;
    font-size: 1.1rem;
    color: #333;
  }

  .notification-close {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .notification-close:hover {
    background-color: #45a049;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Registro;