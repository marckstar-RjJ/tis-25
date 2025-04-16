import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Registro() {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    identificacion: '',
    curso: '',
    universidad: 'universidad1',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});

  const cursos = [
    'Curso 1',
    'Curso 2',
    'Curso 3',
    'Curso 4',
    'Curso 5',
    'Curso 6',
    'Curso 7',
    'Curso 8',
    'Curso 9',
    'Curso 10'
  ];

  // Reiniciar campos no necesarios cuando cambia el tipo de usuario
  useEffect(() => {
    let newFormData = { ...formData };
    
    if (tipoUsuario === 'administrador') {
      newFormData = {
        ...newFormData,
        nombre: '',
        apellidos: '',
        curso: '',
        universidad: ''
      };
    } else if (tipoUsuario === 'tutor') {
      newFormData = {
        ...newFormData,
        curso: '',
        universidad: ''
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
    if (!formData.identificacion) {
      nuevosErrores.identificacion = 'La identificación es requerida';
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
    if (tipoUsuario === 'estudiante' || tipoUsuario === 'tutor') {
      if (!formData.nombre) {
        nuevosErrores.nombre = 'El nombre es requerido';
      }
      
      if (!formData.apellidos) {
        nuevosErrores.apellidos = 'Los apellidos son requeridos';
      }
    }
    
    if (tipoUsuario === 'estudiante') {
      if (!formData.curso) {
        nuevosErrores.curso = 'Debe seleccionar un curso';
      }
      
      if (!formData.universidad) {
        nuevosErrores.universidad = 'Debe seleccionar una universidad';
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      // Aquí iría la lógica para enviar los datos al servidor
      console.log('Datos de registro:', { tipoUsuario, ...formData });
      
      // Por ahora, redirigimos al usuario a la página principal
      alert('Registro exitoso');
      navigate('/');
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
            Estudiante Universitario
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
        {(tipoUsuario === 'estudiante' || tipoUsuario === 'tutor') && (
          <>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
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
          </>
        )}

        <div className="form-group">
          <label htmlFor="identificacion">Identificación</label>
          <input
            type="text"
            id="identificacion"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleInputChange}
            className={errores.identificacion ? 'error' : ''}
          />
          {errores.identificacion && <span className="error-message">{errores.identificacion}</span>}
        </div>

        {tipoUsuario === 'estudiante' && (
          <>
            <div className="form-group">
              <label htmlFor="curso">Curso</label>
              <select
                id="curso"
                name="curso"
                value={formData.curso}
                onChange={handleInputChange}
                className={errores.curso ? 'error' : ''}
              >
                <option value="">Selecciona un curso</option>
                {cursos.map((curso, index) => (
                  <option key={index} value={curso}>
                    {curso}
                  </option>
                ))}
              </select>
              {errores.curso && <span className="error-message">{errores.curso}</span>}
            </div>

            <div className="form-group">
              <label>Universidad</label>
              <div className="universidad-options">
                <label>
                  <input
                    type="radio"
                    name="universidad"
                    value="universidad1"
                    checked={formData.universidad === 'universidad1'}
                    onChange={handleInputChange}
                  />
                  Universidad 1
                </label>
                <label>
                  <input
                    type="radio"
                    name="universidad"
                    value="universidad2"
                    checked={formData.universidad === 'universidad2'}
                    onChange={handleInputChange}
                  />
                  Universidad 2
                </label>
              </div>
              {errores.universidad && <span className="error-message">{errores.universidad}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
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

        <button type="submit" className="submit-button">
          Registrarse
        </button>
      </form>

      <div className="login-link">
        <p>¿Ya tienes una cuenta? <a href="/">Iniciar sesión</a></p>
      </div>
    </div>
  );
}

export default Registro; 