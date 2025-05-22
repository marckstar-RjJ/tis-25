import React, { useState } from 'react';
import './App.css';

function InscripcionPorLista() {
  const [archivo, setArchivo] = useState(null);

  const handleChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!archivo) return alert('Debe seleccionar un archivo Excel');
    
    const formData = new FormData();
    formData.append('archivo', archivo);

    // Simulación de envío al backend
    console.log('Archivo a enviar:', archivo);
    alert('Archivo cargado correctamente (simulado)');
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
