import { useState } from 'react';
import axios from 'axios';

function SubidaExcel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Por favor, seleccione un archivo Excel válido (.xlsx)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, seleccione un archivo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/subida-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Archivo subido correctamente');
      setFile(null);
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subida-excel">
      <h2>Subida de Excel</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="excel-file">Seleccione el archivo Excel</label>
          <input
            type="file"
            id="excel-file"
            accept=".xlsx"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>
    </div>
  );
}

export default SubidaExcel; 