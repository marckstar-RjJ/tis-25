import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';
import Logger from './services/logger';

function Registro() {
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    fechaNacimiento: '',
    curso: '3', // Valor predeterminado: 3° primaria
    email: '',
    emailTutor: '',
    celular: '',
    celularTutor: '',
    nombreTutor: '',
    apellidosTutor: '',
    colegio: '',
    password: '',
    confirmarPassword: '',
    departamento: ''
  });
  const [errores, setErrores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [colegios, setColegios] = useState([]);
  const [cargandoColegios, setCargandoColegios] = useState(true);

  // Cargar la lista de colegios disponibles al iniciar
  useEffect(() => {
    const fetchColegios = async () => {
      try {
        const data = await apiService.getAllColleges();
        setColegios(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, colegio: data[0].id }));
        }
      } catch (error) {
        console.error('Error al cargar colegios:', error);
      } finally {
        setCargandoColegios(false);
      }
    };
    
    fetchColegios();
  }, []);

  // Reiniciar campos no necesarios cuando cambia el tipo de usuario
  useEffect(() => {
    let newFormData = { ...formData };
    
    if (tipoUsuario === 'tutor') {
      newFormData = {
        ...newFormData,
        fechaNacimiento: '',
        curso: '',
        emailTutor: '',
        celularTutor: '',
        nombreTutor: '',
        apellidosTutor: '',
        departamento: ''
      };
      
      // Establecer colegio predeterminado si hay colegios disponibles
      if (colegios.length > 0 && !newFormData.colegio) {
        newFormData.colegio = colegios[0].id;
      }
    } else if (tipoUsuario === 'estudiante') {
      // Establecer curso predeterminado para estudiante
      if (!newFormData.curso) {
        newFormData.curso = '3'; // 3° primaria por defecto
      }
      
      // Establecer colegio predeterminado si hay colegios disponibles
      if (colegios.length > 0 && !newFormData.colegio) {
        newFormData.colegio = colegios[0].id;
      }
    }
    
    setFormData(newFormData);
  }, [tipoUsuario, colegios]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: name=${name}, value=${value}`);
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
      
      if (!formData.curso) {
        nuevosErrores.curso = 'Debe seleccionar un curso';
      }
      
      if (!formData.colegio) {
        nuevosErrores.colegio = 'Debe seleccionar un colegio';
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
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiService.register({
        ...formData,
        tipoUsuario
      });
      
      if (response.success) {
        navigate('/');
      } else {
        setErrores({
          submit: response.message || 'Error al registrar usuario'
        });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setErrores({
        submit: 'Error al registrar usuario. Por favor, intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Usuario:</label>
          <select
            name="tipoUsuario"
            value={tipoUsuario}
            onChange={handleTipoUsuarioChange}
            required
          >
            <option value="estudiante">Estudiante</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
          {errores.nombre && <span className="error">{errores.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Apellidos:</label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleInputChange}
            required
          />
          {errores.apellidos && <span className="error">{errores.apellidos}</span>}
        </div>

        <div className="form-group">
          <label>Carnet de Identidad:</label>
          <input
            type="text"
            name="ci"
            value={formData.ci}
            onChange={handleInputChange}
            required
          />
          {errores.ci && <span className="error">{errores.ci}</span>}
        </div>

        {tipoUsuario === 'estudiante' && (
          <>
            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                required
              />
              {errores.fechaNacimiento && <span className="error">{errores.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label>Curso:</label>
              <select
                name="curso"
                value={formData.curso}
                onChange={handleInputChange}
                required
              >
                <option value="3">3° Primaria</option>
                <option value="4">4° Primaria</option>
                <option value="5">5° Primaria</option>
                <option value="6">6° Primaria</option>
              </select>
              {errores.curso && <span className="error">{errores.curso}</span>}
            </div>

            <div className="form-group">
              <label>Colegio:</label>
              <select
                name="colegio"
                value={formData.colegio}
                onChange={handleInputChange}
                required
                disabled={cargandoColegios}
              >
                {colegios.map(colegio => (
                  <option key={colegio.id} value={colegio.id}>
                    {colegio.nombre}
                  </option>
                ))}
              </select>
              {errores.colegio && <span className="error">{errores.colegio}</span>}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errores.email && <span className="error">{errores.email}</span>}
        </div>

        {tipoUsuario === 'estudiante' && (
          <>
            <div className="form-group">
              <label>Email del Tutor:</label>
              <input
                type="email"
                name="emailTutor"
                value={formData.emailTutor}
                onChange={handleInputChange}
                required
              />
              {errores.emailTutor && <span className="error">{errores.emailTutor}</span>}
            </div>

            <div className="form-group">
              <label>Celular:</label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                required
              />
              {errores.celular && <span className="error">{errores.celular}</span>}
            </div>

            <div className="form-group">
              <label>Celular del Tutor:</label>
              <input
                type="tel"
                name="celularTutor"
                value={formData.celularTutor}
                onChange={handleInputChange}
                required
              />
              {errores.celularTutor && <span className="error">{errores.celularTutor}</span>}
            </div>

            <div className="form-group">
              <label>Nombre del Tutor:</label>
              <input
                type="text"
                name="nombreTutor"
                value={formData.nombreTutor}
                onChange={handleInputChange}
                required
              />
              {errores.nombreTutor && <span className="error">{errores.nombreTutor}</span>}
            </div>

            <div className="form-group">
              <label>Apellidos del Tutor:</label>
              <input
                type="text"
                name="apellidosTutor"
                value={formData.apellidosTutor}
                onChange={handleInputChange}
                required
              />
              {errores.apellidosTutor && <span className="error">{errores.apellidosTutor}</span>}
            </div>
          </>
        )}

        {tipoUsuario === 'tutor' && (
          <div className="form-group">
            <label>Celular:</label>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleInputChange}
              required
            />
            {errores.celular && <span className="error">{errores.celular}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          {errores.password && <span className="error">{errores.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            name="confirmarPassword"
            value={formData.confirmarPassword}
            onChange={handleInputChange}
            required
          />
          {errores.confirmarPassword && <span className="error">{errores.confirmarPassword}</span>}
        </div>

        {errores.submit && <div className="error-message">{errores.submit}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}

export default Registro; 