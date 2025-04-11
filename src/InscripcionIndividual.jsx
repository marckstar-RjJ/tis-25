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
    departamento: '',
    provincia: '',
    area: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);
    // Aquí se conectaría al backend para guardar datos
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
            <input name="nombres" value={form.nombres} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellidos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>CI</label>
            <input name="ci" value={form.ci} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="nacimiento" value={form.nacimiento} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Número de Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Colegio</label>
            <input name="colegio" value={form.colegio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Curso</label>
            <input name="curso" value={form.curso} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Departamento</label>
            <input name="departamento" value={form.departamento} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Provincia</label>
            <input name="provincia" value={form.provincia} onChange={handleChange} required />
          </div>
          <div className="form-group area-select">
            <label>Área de Inscripción</label>
            <select name="area" value={form.area} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biología">Biología</option>
              <option value="Astronomía">Astronomía y Astrofísica</option>
              <option value="Informática">Informática</option>
              <option value="Robótica">Robótica</option>
            </select>
          </div>
        </div>
        <button type="submit">Registrar Estudiante</button>
      </form>
      <button onClick={handleBack} className="back-button">Volver al Panel</button>
    </div>
  );
}

export default InscripcionIndividual;
