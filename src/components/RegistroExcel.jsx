import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import * as XLSX from 'xlsx';
import { descargarPlantillaExcel } from './utils/generarPlantillaExcel';
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
          // Imprimir cabeceras para depuración
          console.log('Cabeceras encontradas en el archivo:', headers);
          
          // Crear un mapa para buscar índices de columnas necesarias (insensible a mayúsculas/minúsculas)
          const headerIndices = {};
          
          // Definir las cabeceras requeridas y sus posibles variantes
          const headerMapping = {
            'nombre': ['nombre', 'name', 'nombres', 'first name', 'firstname', 'NOMBRE', 'NOMBRES'],
            'apellido': ['apellido', 'apellidos', 'last name', 'lastname', 'surname', 'APELLIDO', 'APELLIDOS'],
            'ci': ['ci', 'c.i.', 'carnet', 'carnet de identidad', 'documento', 'dni', 'CI', 'C.I.', 'CARNET'],
            'fecha_nacimiento': ['fecha_nacimiento', 'fecha de nacimiento', 'birth date', 'birthdate', 'nacimiento', 'FECHA_NACIMIENTO', 'FECHA NACIMIENTO', 'NACIMIENTO'],
            'curso': ['curso', 'grado', 'nivel', 'año escolar', 'grade', 'CURSO', 'GRADO'],
            'email': ['email', 'correo', 'correo electrónico', 'e-mail', 'mail', 'EMAIL', 'CORREO', 'E-MAIL']
          };
          
          const requiredHeaders = Object.keys(headerMapping);
          const missingHeaders = [];
          
          // Buscar coincidencias para cada cabecera requerida
          for (const requiredHeader of requiredHeaders) {
            let found = false;
            const possibleMatches = headerMapping[requiredHeader];
            
            for (let i = 0; i < headers.length; i++) {
              const headerText = headers[i];
              
              if (typeof headerText === 'string') {
                // Verificar coincidencia exacta o coincidencia normalizada (sin espacios, mayúsculas/minúsculas)
                const normalizedHeader = headerText.toLowerCase().trim();
                
                if (possibleMatches.some(match => 
                  normalizedHeader === match.toLowerCase() || 
                  normalizedHeader.replace(/[\s_-]/g, '') === match.toLowerCase().replace(/[\s_-]/g, '')
                )) {
                  headerIndices[requiredHeader] = i;
                  found = true;
                  console.log(`Coincidencia encontrada para ${requiredHeader}: ${headerText} en posición ${i}`);
                  break;
                }
              }
            }
            
            if (!found) {
              missingHeaders.push(requiredHeader);
            }
          }
          
          // Imprimir resultados para depuración
          console.log('Mapeo de cabeceras:', headerIndices);
          console.log('Cabeceras faltantes:', missingHeaders);
          
          if (missingHeaders.length > 0) {
            setError(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
            return;
          }
          
          console.log('Cabeceras encontradas:', headerIndices);
          
          // Mostrar vista previa (primeras 5 filas)
          const previewRows = jsonData.slice(1, Math.min(6, jsonData.length));
          setPreview({
            headers,
            rows: previewRows,
            headerIndices // Guardar también los índices para usarlos después
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
          
          // Leer los datos como array de arrays para procesar manualmente
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (rawData.length <= 1) {
            setError('El archivo no contiene datos suficientes');
            setIsLoading(false);
            return;
          }
          
          // Imprimir cabeceras para depuración
          console.log('Cabeceras en el archivo (submit):', rawData[0]);
          const headers = rawData[0];
          
          // Definir las cabeceras requeridas y sus posibles variantes
          const headerMapping = {
            'nombre': ['nombre', 'name', 'nombres', 'first name', 'firstname', 'NOMBRE', 'NOMBRES'],
            'apellido': ['apellido', 'apellidos', 'last name', 'lastname', 'surname', 'APELLIDO', 'APELLIDOS'],
            'ci': ['ci', 'c.i.', 'carnet', 'carnet de identidad', 'documento', 'dni', 'CI', 'C.I.', 'CARNET'],
            'fecha_nacimiento': ['fecha_nacimiento', 'fecha de nacimiento', 'birth date', 'birthdate', 'nacimiento', 'FECHA_NACIMIENTO', 'FECHA NACIMIENTO', 'NACIMIENTO'],
            'curso': ['curso', 'grado', 'nivel', 'año escolar', 'grade', 'CURSO', 'GRADO'],
            'email': ['email', 'correo', 'correo electrónico', 'e-mail', 'mail', 'EMAIL', 'CORREO', 'E-MAIL']
          };
          
          const headerIndices = {};
          const requiredHeaders = Object.keys(headerMapping);
          const missingHeaders = [];
          
          // Buscar coincidencias para cada cabecera requerida
          for (const requiredHeader of requiredHeaders) {
            let found = false;
            const possibleMatches = headerMapping[requiredHeader];
            
            for (let i = 0; i < headers.length; i++) {
              const headerText = headers[i];
              
              if (typeof headerText === 'string') {
                // Verificar coincidencia exacta o coincidencia normalizada (sin espacios, mayúsculas/minúsculas)
                const normalizedHeader = headerText.toLowerCase().trim();
                
                if (possibleMatches.some(match => 
                  normalizedHeader === match.toLowerCase() || 
                  normalizedHeader.replace(/[\s_-]/g, '') === match.toLowerCase().replace(/[\s_-]/g, '')
                )) {
                  headerIndices[requiredHeader] = i;
                  found = true;
                  console.log(`Coincidencia encontrada para ${requiredHeader}: ${headerText} en posición ${i}`);
                  break;
                }
              }
            }
            
            if (!found) {
              missingHeaders.push(requiredHeader);
            }
          }
          
          // Imprimir para depuración
          console.log('Mapeo de cabeceras (submit):', headerIndices);
          
          // Verificar si faltan cabeceras requeridas
          if (missingHeaders.length > 0) {
            setError(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
            setIsLoading(false);
            return;
          }
          
          // Ahora procesamos los datos usando los índices encontrados
          const jsonData = [];
          for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const rowData = {};
            
            // Extraer datos usando los índices mapeados
            for (const header of requiredHeaders) {
              const index = headerIndices[header];
              rowData[header] = row[index];
            }
            
            jsonData.push(rowData);
          }
          
          console.log('Datos procesados:', jsonData);
          
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
            errors: [],
            duplicates: [] // Array específico para estudiantes con CI duplicado
          };
          
          // Pre-procesamiento: Verificar CIs duplicados dentro del mismo archivo
          const cisEnArchivo = new Map();
          jsonData.forEach((row, index) => {
            if (row.ci) {
              const ciNormalizado = typeof row.ci === 'string' ? row.ci.toString().trim() : String(row.ci).trim();
              if (cisEnArchivo.has(ciNormalizado)) {
                // Encontramos un CI duplicado dentro del archivo
                const filaPrevia = cisEnArchivo.get(ciNormalizado);
                console.log(`CI duplicado en el archivo: ${ciNormalizado}, filas ${filaPrevia + 1} y ${index + 1}`);
              } else {
                cisEnArchivo.set(ciNormalizado, index);
              }
            }
          });
          
          console.log('Total de filas a procesar:', jsonData.length);
          
          // Registrar cada estudiante
          for (const row of jsonData) {
            try {
              console.log('Procesando fila:', row);
              // Verificar datos mínimos requeridos
              if (!row.nombre || !row.apellido || !row.ci || !row.fecha_nacimiento || !row.curso) {
                results.failed++;
                results.errors.push({
                  estudiante: `${row.nombre || ''} ${row.apellido || ''}`,
                  ci: row.ci ? (typeof row.ci === 'string' ? row.ci : String(row.ci)) : 'No proporcionado',
                  error: 'Faltan campos obligatorios',
                  tipo: 'DATOS_INCOMPLETOS'
                });
                continue;
              }
              
              // Validar formato del CI (solo números y letras)
              const ciNormalizado = typeof row.ci === 'string' ? row.ci.toString().trim() : String(row.ci).trim();
              if (!/^[0-9a-zA-Z-]+$/.test(ciNormalizado)) {
                results.failed++;
                results.errors.push({
                  estudiante: `${row.nombre} ${row.apellido}`,
                  ci: ciNormalizado,
                  error: 'El número de carnet (CI) contiene caracteres no válidos',
                  tipo: 'FORMATO_CI_INVALIDO'
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
              } else if (typeof fechaNacimiento === 'string') {
                // Intentar parsear la fecha si es una cadena
                try {
                  const fecha = new Date(fechaNacimiento);
                  if (!isNaN(fecha.getTime())) {
                    fechaNacimiento = fecha.toISOString().split('T')[0];
                  }
                } catch (e) {
                  console.warn('Error al parsear fecha:', e);
                  // Mantener el valor original si no se puede parsear
                }
              }
              
              // Validar que el curso sea un número entre 1 y 12
              const curso = parseInt(row.curso, 10);
              if (isNaN(curso) || curso < 1 || curso > 12) {
                results.failed++;
                results.errors.push({
                  estudiante: `${row.nombre} ${row.apellido}`,
                  ci: ciNormalizado,
                  error: 'El curso debe ser un número entre 1 y 12',
                  tipo: 'CURSO_INVALIDO'
                });
                continue;
              }
              
              // Preparar datos del estudiante
              const studentData = {
                nombre: row.nombre,
                apellido: row.apellido,
                ci: ciNormalizado,
                fechaNacimiento: fechaNacimiento,
                curso: curso,
                email: row.email || '',
                colegio: currentUser.colegio || (colegios.length > 0 ? colegios[0].id : null),
                tutorId: currentUser.id
              };
              
              console.log('Enviando datos del estudiante:', studentData);
              
              // Registrar estudiante
              await apiService.registerStudentByTutor(currentUser.id, studentData);
              results.successful++;
            } catch (error) {
              console.error('Error al registrar estudiante:', error);
              results.failed++;
              
              // Manejar específicamente el caso de CI duplicado
              if (error.code === 'DUPLICATE_CI') {
                const duplicateInfo = {
                  estudiante: `${row.nombre} ${row.apellido}`,
                  ci: row.ci,
                  error: `Ya existe un estudiante con este CI: ${error.duplicateInfo?.nombre || ''} ${error.duplicateInfo?.apellido || ''}`,
                  tipo: 'CI_DUPLICADO',
                  estudianteExistente: error.duplicateInfo
                };
                
                results.duplicates.push(duplicateInfo);
                results.errors.push(duplicateInfo);
              } else {
                // Otros errores
                results.errors.push({
                  estudiante: `${row.nombre || ''} ${row.apellido || ''}`,
                  ci: row.ci ? (typeof row.ci === 'string' ? row.ci : String(row.ci)) : 'No proporcionado',
                  error: error.message || 'Error desconocido',
                  tipo: 'ERROR_GENERAL'
                });
              }
            }
          }
          
          // Asegurarse de que los resultados se establezcan correctamente
          console.log('Resultados finales:', results);
          setResults({ ...results }); // Usar spread para crear una nueva referencia y forzar la actualización
          
          if (results.successful > 0) {
            setSuccess(`Se registraron ${results.successful} estudiantes exitosamente.`);
          } else if (results.failed > 0) {
            setError(`No se pudo registrar ningún estudiante. Se encontraron ${results.failed} errores.`);
          }
          
          // Mostrar un mensaje si no hay errores específicos pero tampoco hay éxitos
          if (results.successful === 0 && results.failed === 0) {
            setError('No se procesó ningún estudiante. Verifique el formato del archivo.');
          }
          
          setIsLoading(false);
          
          // Hacer un pequeño retraso para asegurar que la tabla se renderice
          setTimeout(() => {
            // Scroll hacia la sección de resultados
            const resultsElement = document.querySelector('.results-container');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
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
    // Utilizar nuestra utilidad para generar y descargar la plantilla de Excel
    try {
      descargarPlantillaExcel();
      
      // Mostrar mensaje de éxito
      setSuccess('Plantilla de Excel descargada correctamente. Complete los datos y súbala para registrar estudiantes.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error al generar la plantilla:', error);
      setError('Ocurrió un error al generar la plantilla de Excel. Inténtelo de nuevo.');
    }
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
          <h3>Resultados del Proceso</h3>
          <div className="results-summary">
            <div className="result-item" style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px', margin: '5px' }}>
              <p><strong>Total de registros procesados:</strong> {results.total}</p>
            </div>
            <div className="result-item" style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '5px', margin: '5px' }}>
              <p><strong>Registros exitosos:</strong> {results.successful}</p>
            </div>
            <div className="result-item" style={{ backgroundColor: results.failed > 0 ? '#ffebee' : '#e8f5e9', padding: '10px', borderRadius: '5px', margin: '5px' }}>
              <p><strong>Registros fallidos:</strong> {results.failed}</p>
            </div>
          </div>
          
          {results.duplicates && results.duplicates.length > 0 && (
            <div className="duplicates-list" style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '5px', marginTop: '15px', border: '1px solid #ffcc80' }}>
              <h4>📋 Estudiantes con CI Duplicado</h4>
              <p>Los siguientes estudiantes no fueron registrados porque sus números de carnet ya existen en el sistema:</p>
              <table className="table table-bordered" style={{ width: '100%', marginTop: '10px' }}>
                <thead style={{ backgroundColor: '#ffcc80' }}>
                  <tr>
                    <th>Nombre</th>
                    <th>CI</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {results.duplicates.map((dup, index) => (
                    <tr key={index}>
                      <td>{dup.estudiante}</td>
                      <td><strong>{dup.ci}</strong></td>
                      <td>{dup.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {results.errors.filter(err => err.tipo !== 'CI_DUPLICADO').length > 0 && (
            <div className="errors-list" style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '5px', marginTop: '15px', border: '1px solid #ef9a9a' }}>
              <h4>⚠️ Otros Errores Encontrados</h4>
              <table className="table table-bordered" style={{ width: '100%', marginTop: '10px' }}>
                <thead style={{ backgroundColor: '#ef9a9a' }}>
                  <tr>
                    <th>Estudiante</th>
                    <th>CI</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.errors
                    .filter(err => err.tipo !== 'CI_DUPLICADO')
                    .map((err, index) => (
                      <tr key={index}>
                        <td>{err.estudiante}</td>
                        <td>{err.ci}</td>
                        <td>{err.error}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {results.successful > 0 && (
            <div className="success-message" style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '5px', marginTop: '15px', border: '1px solid #a5d6a7' }}>
              <h4>✅ Estudiantes Registrados Exitosamente</h4>
              <p>Se han registrado correctamente {results.successful} estudiantes en el sistema.</p>
              <p>Ahora puede proceder a inscribir a estos estudiantes en las áreas académicas desde el panel principal.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistroExcel;
