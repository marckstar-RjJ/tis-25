import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';

function Registro() {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    fechaNacimiento: '',
    email: '',
    emailTutor: '',
    celular: '',
    celularTutor: '',
    nombreTutor: '',
    apellidosTutor: '',
    colegio: '',
    password: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const colegios = [
    'Colegio 1',
    'Colegio 2',
    'Colegio 3',
    'Colegio 4',
    'Colegio 5',
    'Colegio 6',
    'Colegio 7',
    'Colegio 8',
    'Colegio 9',
    'Colegio 10'
  ];

  // Reiniciar campos no necesarios cuando cambia el tipo de usuario
  useEffect(() => {
    let newFormData = { ...formData };
    
    if (tipoUsuario === 'administrador') {
      newFormData = {
        ...newFormData,
        fechaNacimiento: '',
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
        emailTutor: '',
        celularTutor: '',
        nombreTutor: '',
        apellidosTutor: ''
      };
    }
    
    setFormData(newFormData);
  }, [tipoUsuario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    }
    
    if (!formData.apellidos) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos';
    }
    
    if (!formData.ci) {
      nuevosErrores.ci = 'El carnet de identidad es requerido';
    }
    
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    // Validaciones específicas por tipo de usuario
    if (tipoUsuario === 'estudiante') {
      if (!formData.fechaNacimiento) {
        nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
      }
      
      if (!formData.emailTutor) {
        nuevosErrores.emailTutor = 'El email del tutor es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.emailTutor)) {
        nuevosErrores.emailTutor = 'El email del tutor no es válido';
      }
      
      if (!formData.celular) {
        nuevosErrores.celular = 'El número de celular es requerido';
      }
      
      if (!formData.celularTutor) {
        nuevosErrores.celularTutor = 'El número de celular del tutor es requerido';
      }
      
      if (!formData.nombreTutor) {
        nuevosErrores.nombreTutor = 'El nombre del tutor es requerido';
      }
      
      if (!formData.apellidosTutor) {
        nuevosErrores.apellidosTutor = 'Los apellidos del tutor son requeridos';
      }
    }
    
    if (tipoUsuario === 'tutor') {
      if (!formData.celular) {
        nuevosErrores.celular = 'El número de celular es requerido';
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
          tipoUsuario,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          ci: formData.ci,
          email: formData.email,
          password: formData.password
        };
        
        if (tipoUsuario === 'estudiante') {
          userData.fechaNacimiento = formData.fechaNacimiento;
          userData.emailTutor = formData.emailTutor;
          userData.celular = formData.celular;
          userData.celularTutor = formData.celularTutor;
          userData.nombreTutor = formData.nombreTutor;
          userData.apellidosTutor = formData.apellidosTutor;
        } else if (tipoUsuario === 'tutor') {
          userData.celular = formData.celular;
          userData.colegio = formData.colegio;
        }
        
        // Enviar los datos al servidor
        const result = await apiService.createUser(userData);
        console.log('Usuario registrado:', result);
        
        alert('Registro exitoso');
        navigate('/');
      } catch (error) {
        console.error('Error al registrar:', error);
        alert(error.message || 'Error al registrar usuario');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Por favor, corrija los errores en el formulario');
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-header">
        <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
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
          <label>
            <input
              type="radio"
              name="tipoUsuario"
              value="administrador"
              checked={tipoUsuario === 'administrador'}
              onChange={handleTipoUsuarioChange}
            />
            Administrador
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

        <div className="form-group">
          <label htmlFor="ci">Carnet de Identidad</label>
          <input
            type="text"
            id="ci"
            name="ci"
            value={formData.ci}
            onChange={handleInputChange}
            className={errores.ci ? 'error' : ''}
          />
          {errores.ci && <span className="error-message">{errores.ci}</span>}
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

        {/* Campos específicos para estudiantes */}
        {tipoUsuario === 'estudiante' && (
          <>
            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className={errores.fechaNacimiento ? 'error' : ''}
              />
              {errores.fechaNacimiento && <span className="error-message">{errores.fechaNacimiento}</span>}
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
              />
              {errores.celular && <span className="error-message">{errores.celular}</span>}
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
              />
              {errores.celularTutor && <span className="error-message">{errores.celularTutor}</span>}
            </div>
          </>
        )}

        {/* Campos específicos para tutores */}
        {tipoUsuario === 'tutor' && (
          <>
            <div className="form-group">
              <label htmlFor="celular">Número de Celular</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                className={errores.celular ? 'error' : ''}
              />
              {errores.celular && <span className="error-message">{errores.celular}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="colegio">Colegio</label>
              <select
                id="colegio"
                name="colegio"
                value={formData.colegio}
                onChange={handleInputChange}
                className={errores.colegio ? 'error' : ''}
              >
                <option value="">Selecciona un colegio</option>
                {colegios.map((colegio, index) => (
                  <option key={index} value={colegio}>
                    {colegio}
                  </option>
                ))}
              </select>
              {errores.colegio && <span className="error-message">{errores.colegio}</span>}
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

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>

      <div className="login-link">
        <p>¿Ya tienes una cuenta? <a href="/">Iniciar sesión</a></p>
      </div>
    </div>
  );
}

export default Registro; 