import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import * as XLSX from 'xlsx';
import '../App.css';

// Componente para registro masivo de estudiantes mediante Excel
const RegistroExcel = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState(null);
  const [colegios, setColegios] = useState([]);
  const [preview, setPreview] = useState([]);

  // Fetch colegios al cargar el componente
  useEffect(() => {
    const fetchColegios = async () => {
      try {
        const data = await apiService.getAllColleges();
        setColegios(data);
      } catch (err) {
        console.error('Error al cargar colegios:', err);
        setError('No se pudieron cargar los colegios disponibles.');
      }
    };
    
    fetchColegios();
  }, []);

  // Manejar la selección del archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview([]);
    setResults(null);
    setError('');
    setSuccess('');

    if (selectedFile) {
      // Validar que sea un archivo Excel
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Por favor, seleccione un archivo Excel válido (.xlsx o .xls)');
        setFile(null);
        return;
      }

      // Leer el archivo para mostrar vista previa
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const binaryData = evt.target.result;
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Validar estructura del archivo
          if (jsonData.length < 2) {
            setError('El archivo no contiene datos suficientes');
            return;
          }
          
          // Verificar cabeceras esperadas
          const headers = jsonData[0];
          const requiredHeaders = ['nombre', 'apellido', 'ci', 'fecha_nacimiento', 'curso', 'email'];
          
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            setError(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
            return;
          }
          
          // Mostrar vista previa (primeras 5 filas)
          const previewRows = jsonData.slice(1, Math.min(6, jsonData.length));
          setPreview({
            headers,
            rows: previewRows
          });
        } catch (error) {
          console.error('Error al leer el archivo:', error);
          setError('Error al procesar el archivo. Asegúrese de que es un archivo Excel válido.');
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
      };
      
      reader.readAsBinaryString(selectedFile);
    }
  };

  // Procesar el archivo y registrar estudiantes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, seleccione un archivo');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const binaryData = evt.target.result;
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convertir a JSON con cabeceras
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            setError('El archivo no contiene datos');
            setIsLoading(false);
            return;
          }
          
          // Resultados del procesamiento
          const results = {
            total: jsonData.length,
            successful: 0,
            failed: 0,
            errors: []
          };
          
          // Registrar cada estudiante
          for (const row of jsonData) {
            try {
              // Verificar datos mínimos requeridos
              if (!row.nombre || !row.apellido || !row.ci || !row.fecha_nacimiento || !row.curso) {
                results.failed++;
                results.errors.push({
                  estudiante: `${row.nombre || ''} ${row.apellido || ''}`,
                  error: 'Faltan campos obligatorios'
                });
                continue;
              }
              
              // Convertir la fecha si es necesario (Excel almacena fechas como números)
              let fechaNacimiento = row.fecha_nacimiento;
              if (typeof fechaNacimiento === 'number') {
                // Convertir fecha de Excel (días desde 1/1/1900) a formato ISO
                const excelEpoch = new Date(1900, 0, 1);
                const fecha = new Date(excelEpoch.getTime() + (fechaNacimiento - 1) * 24 * 60 * 60 * 1000);
                fechaNacimiento = fecha.toISOString().split('T')[0];
              }
              
              // Preparar datos del estudiante
              const studentData = {
                nombre: row.nombre,
                apellido: row.apellido,
                ci: row.ci.toString(),
                fechaNacimiento: fechaNacimiento,
                curso: parseInt(row.curso, 10),
                email: row.email || '',
                colegio: currentUser.colegio || (colegios.length > 0 ? colegios[0].id : null),
                tutorId: currentUser.id
              };
              
              // Registrar estudiante
              await apiService.registerStudentByTutor(currentUser.id, studentData);
              results.successful++;
            } catch (error) {
              results.failed++;
              results.errors.push({
                estudiante: `${row.nombre || ''} ${row.apellido || ''}`,
                error: error.message || 'Error desconocido'
              });
            }
          }
          
          setResults(results);
          
          if (results.successful > 0) {
            setSuccess(`Se registraron ${results.successful} estudiantes exitosamente.`);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error al procesar archivo:', error);
          setError('Error al procesar el archivo. Verifique el formato.');
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
        setIsLoading(false);
      };
      
      reader.readAsBinaryString(file);
      
    } catch (err) {
      console.error('Error general:', err);
      setError(err.message || 'Ocurrió un error durante el procesamiento');
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Crear una plantilla Excel simple
    const data = [
      ['nombre', 'apellido', 'ci', 'fecha_nacimiento', 'curso', 'email'],
      ['Juan', 'Pérez', '12345678', '2010-05-15', '3', 'juan.perez@ejemplo.com'],
      ['María', 'Gómez', '87654321', '2012-10-20', '2', 'maria.gomez@ejemplo.com']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
    
    // Generar archivo
    XLSX.writeFile(wb, 'plantilla_registro_estudiantes.xlsx');
  };

  return (
    <div className="registro-excel-container">
      <h2>Registro Masivo de Estudiantes</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="template-download">
        <p>Descargue nuestra plantilla Excel con el formato correcto:</p>
        <button 
          onClick={handleDownloadTemplate}
          className="download-template-btn"
        >
          Descargar Plantilla
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <label htmlFor="excelFile">Seleccionar archivo Excel:</label>
          <input
            type="file"
            id="excelFile"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
        
        {preview.rows && preview.rows.length > 0 && (
          <div className="preview-container">
            <h3>Vista Previa</h3>
            <div className="table-responsive">
              <table className="preview-table">
                <thead>
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {preview.headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[colIndex] || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="preview-note">Mostrando las primeras {preview.rows.length} filas de datos.</p>
          </div>
        )}
        
        <div className="form-buttons">
          <button 
            type="button" 
            onClick={() => navigate('/tutor')}
            className="back-button"
            disabled={isLoading}
          >
            Volver
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={!file || isLoading}
          >
            {isLoading ? 'Procesando...' : 'Registrar Estudiantes'}
          </button>
        </div>
      </form>
      
      {results && (
        <div className="results-container">
          <h3>Resultados del Registro</h3>
          <div className="results-summary">
            <p><strong>Total procesados:</strong> {results.total}</p>
            <p><strong>Registrados con éxito:</strong> {results.successful}</p>
            <p><strong>Fallidos:</strong> {results.failed}</p>
          </div>
          
          {results.errors.length > 0 && (
            <div className="error-list">
              <h4>Errores encontrados:</h4>
              <ul>
                {results.errors.map((error, index) => (
                  <li key={index}>
                    <strong>{error.estudiante}:</strong> {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistroExcel;
