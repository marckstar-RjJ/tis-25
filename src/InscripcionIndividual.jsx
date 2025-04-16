import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function InscripcionIndividual() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    ci: '',
    nacimiento: '',
    correo: '',
    celular: '',
    colegio: '',
    curso: '',
    area: [],
  });

  const [errors, setErrors] = useState({
    nombres: '',
    apellidos: '',
    nacimiento: '',
    correo: '',
    celular: '',
    area: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const cursos = [
    '4to de Primaria',
    '5to de Primaria',
    '6to de Primaria',
    '1ro de Secundaria',
    '2do de Secundaria',
    '3ro de Secundaria',
    '4to de Secundaria',
    '5to de Secundaria',
    '6to de Secundaria',
  ];

  const areasInscripcion = [
    'Matemática',
    'Física',
    'Química',
    'Biología',
    'Astronomía y Astrofísica',
    'Informática',
    'Robótica',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: value });
    if (isSubmitted) { // Only clear errors if the form has been submitted
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }

    if (name === 'area') {
      let updatedAreas = [...form.area];
      if (checked) {
        updatedAreas = [...updatedAreas, value];
      } else {
        updatedAreas = updatedAreas.filter(area => area !== value);
      }
      setForm(prevForm => ({ ...prevForm, [name]: updatedAreas }));
      if (isSubmitted && updatedAreas.length > 2) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: 'Solo se pueden seleccionar hasta 2 áreas de inscripción.' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    let newErrors = {};
    let isValid = true;

    if (/\d/.test(form.nombres)) {
      newErrors.nombres = 'Este campo no debe contener números.';
      isValid = false;
    }

    if (/\d/.test(form.apellidos)) {
      newErrors.apellidos = 'Este campo no debe contener números.';
      isValid = false;
    }

    const birthDate = new Date(form.nacimiento);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();

    let validAge = true;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      // Date is in the future, no error here but age calculation needs adjustment
    } else if (age < 10 || age > 18) {
      newErrors.nacimiento = 'La edad debe estar entre 10 y 18 años.';
      isValid = false;
      validAge = false;
    } else if (age === 10) {
      const limitDate = new Date();
      limitDate.setFullYear(currentDate.getFullYear() - 10);
      if (birthDate > limitDate) {
        newErrors.nacimiento = 'La edad debe estar entre 10 y 18 años.';
        isValid = false;
        validAge = false;
      }
    } else if (age === 18) {
      const limitDate = new Date();
      limitDate.setFullYear(currentDate.getFullYear() - 18);
      if (birthDate < limitDate) {
        newErrors.nacimiento = 'La edad debe estar entre 10 y 18 años.';
        isValid = false;
        validAge = false;
      }
    }

    if (!form.correo.endsWith('@gmail.com')) {
      newErrors.correo = 'El correo electrónico debe terminar en @gmail.com';
      isValid = false;
    }

    if (!/^\d+$/.test(form.celular) || form.celular.length < 6 || form.celular.length > 9) {
      newErrors.celular = 'El número de celular debe contener solo dígitos y tener entre 6 y 9 caracteres.';
      isValid = false;
    }

    if (!form.area || form.area.length === 0) {
      newErrors.area = 'Debes seleccionar al menos un área de inscripción.';
      isValid = false;
    } else if (form.area.length > 2) {
      newErrors.area = 'Solo se pueden seleccionar hasta 2 áreas de inscripción.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      console.log('Formulario enviado:', form);
      // Aquí se conectaría al backend para guardar datos
    } else {
      alert('Por favor, corrige los errores en el formulario.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="inscripcion-form">
      <h2>Inscripción Individual</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombres</label>
            <input
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              required
              className={errors.nombres ? 'error' : ''}
            />
            {errors.nombres && <p className="error-message">{errors.nombres}</p>}
          </div>
          <div className="form-group">
            <label>Apellidos</label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className={errors.apellidos ? 'error' : ''}
            />
            {errors.apellidos && <p className="error-message">{errors.apellidos}</p>}
          </div>
          <div className="form-group">
            <label>CI</label>
            <input name="ci" value={form.ci} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="nacimiento"
              value={form.nacimiento}
              onChange={handleChange}
              required
              className={errors.nacimiento ? 'error' : ''}
            />
            {errors.nacimiento && <p className="error-message">{errors.nacimiento}</p>}
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              className={errors.correo ? 'error' : ''}
            />
            {errors.correo && <p className="error-message">{errors.correo}</p>}
          </div>
          <div className="form-group">
            <label>Número de Celular</label>
            <input
              name="celular"
              value={form.celular}
              onChange={handleChange}
              required
              className={errors.celular ? 'error' : ''}
            />
            {errors.celular && <p className="error-message">{errors.celular}</p>}
          </div>
          <div className="form-group">
            <label>Colegio</label>
            <input name="colegio" value={form.colegio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Curso</label>
            <select name="curso" value={form.curso} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {cursos.map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>
          <div className="form-group area-select">
            <label>Área de Inscripción (Selecciona 1 o 2)</label>
            <div className="checkbox-group">
              {areasInscripcion.map(area => (
                <div key={area} className={errors.area ? 'error-checkbox' : ''}>
                  <input
                    type="checkbox"
                    name="area"
                    value={area}
                    checked={form.area.includes(area)}
                    onChange={handleChange}
                  />
                  <label>{area}</label>
                </div>
              ))}
            </div>
            {errors.area && <p className="error-message">{errors.area}</p>}
          </div>
        </div>
        <button type="submit">Registrar Estudiante</button>
      </form>
      <button onClick={handleBack} className="back-button">Volver al Panel</button>
    </div>
  );
}

export default InscripcionIndividual;