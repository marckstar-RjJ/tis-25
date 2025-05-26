import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';
import Logger from './services/logger';

function InscripcionPorLista() {
  const [archivo, setArchivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errores, setErrores] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      setIsLoading(true);
      try {
        // Registrar intento de inscripción por lista
        await Logger.log('intento_inscripcion_lista', {
          colegioId: formData.colegioId,
          categoria: formData.categoria,
          modalidad: formData.modalidad,
          cantidadEstudiantes: formData.estudiantes.length
        });

        // Enviar los datos al servidor
        const result = await apiService.createInscripcionPorLista(formData);
        
        // Registrar inscripción exitosa
        await Logger.log('inscripcion_lista_exitosa', {
          inscripcionId: result.id,
          colegioId: formData.colegioId,
          categoria: formData.categoria,
          modalidad: formData.modalidad,
          cantidadEstudiantes: formData.estudiantes.length
        });
        
        alert('Inscripción por lista exitosa');
        navigate('/dashboard');
      } catch (error) {
        // Registrar error en la inscripción
        await Logger.logError(error, {
          colegioId: formData.colegioId,
          categoria: formData.categoria,
          modalidad: formData.modalidad,
          cantidadEstudiantes: formData.estudiantes.length
        });

        console.error('Error al inscribir por lista:', error);
        if (error.response && error.response.data && error.response.data.errors) {
          setErrores(error.response.data.errors);
        } else {
          alert('Error al realizar la inscripción por lista. Por favor, intente nuevamente.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="subida-excel">
      <h2>Inscripción por Lista (Archivo Excel)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx, .xls" onChange={handleChange} />
        <button type="submit">Subir Archivo</button>
      </form>
    </div>
  );
}

export default InscripcionPorLista;
