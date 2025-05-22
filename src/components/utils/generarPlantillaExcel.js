import * as XLSX from 'xlsx';

/**
 * Aplica estilos a las celdas de Excel (colores, negrita, etc.)
 * @param {Object} worksheet - Hoja de Excel
 * @param {String} cellRef - Referencia de celda (ej. "A1")
 * @param {Object} style - Estilos a aplicar
 */
const applyStyle = (worksheet, cellRef, style) => {
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  
  // Inicializar la propiedad si no existe
  if (!worksheet.s) worksheet.s = {};
  if (!worksheet.s.fills) worksheet.s.fills = [];
  
  // Asignar el estilo a la celda
  if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
  Object.assign(worksheet[cellRef].s, style);
};

/**
 * Genera una plantilla de Excel para registro masivo de estudiantes de Olimpiadas Académicas
 * @returns {Blob} Blob del archivo Excel generado
 */
export const generarPlantillaExcel = () => {
  // Crear un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Plantilla Registro de Estudiantes - Olimpiadas Académicas",
    Subject: "Registro Masivo",
    Author: "Sistema de Olimpiadas Académicas",
    CreatedDate: new Date()
  };
  
  // Cabeceras con nombres amigables
  const headers = [
    'NOMBRE', 
    'APELLIDO', 
    'CI', 
    'FECHA_NACIMIENTO', 
    'CURSO', 
    'EMAIL'
  ];
  
  // Datos de ejemplo para diferentes niveles académicos y áreas
  const data = [
    ['Juan', 'Pérez', '12345678', '2010-05-15', 5, 'juan.perez@gmail.com'], // 5to primaria (Matemáticas, Astronomía)
    ['María', 'González', '87654321', '2008-10-20', 7, 'maria.gonzalez@gmail.com'], // 1ro secundaria (Física, Química)
    ['Carlos', 'Rodríguez', '45678912', '2011-03-08', 4, 'carlos.rodriguez@gmail.com'], // 4to primaria (Robótica)
    ['Ana', 'Martínez', '78912345', '2009-12-01', 6, 'ana.martinez@gmail.com'], // 6to primaria (Biología, Matemáticas)
    ['Luis', 'Morales', '56789123', '2007-08-17', 9, 'luis.morales@gmail.com'], // 3ro secundaria (Informática, Física)
    ['Gabriela', 'Flores', '34567891', '2006-04-22', 10, 'gabriela.flores@gmail.com'] // 4to secundaria (Química, Astronomía)
  ];
  
  // Crear la hoja de cálculo con los datos
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Establecer anchos de columna
  const colWidths = [
    { wch: 20 }, // NOMBRE
    { wch: 20 }, // APELLIDO
    { wch: 15 }, // CI
    { wch: 18 }, // FECHA_NACIMIENTO
    { wch: 10 }, // CURSO
    { wch: 30 }  // EMAIL
  ];
  
  worksheet['!cols'] = colWidths;
  
  // Añadir hoja informativa sobre áreas disponibles por grado
  const areasInfo = [
    ['ÁREAS DISPONIBLES POR CURSO EN OLIMPIADAS ACADÉMICAS'],
    [''],
    ['ÁREA', 'CURSOS PERMITIDOS'],
    ['Astronomía', '4° Primaria - 6° Secundaria'],
    ['Biología', '3° Primaria - 6° Secundaria'],
    ['Física', '1° Secundaria - 6° Secundaria'],
    ['Matemáticas', '3° Primaria - 6° Secundaria'],
    ['Informática', '1° Secundaria - 6° Secundaria'],
    ['Robótica', '3° Primaria - 6° Secundaria'],
    ['Química', '1° Secundaria - 6° Secundaria'],
    [''],
    ['Nota: Cada estudiante puede inscribirse en máximo 2 áreas.'],
    ['El costo por área es de $16']
  ];
  
  const areasSheet = XLSX.utils.aoa_to_sheet(areasInfo);
  areasSheet['!cols'] = [{ wch: 30 }, { wch: 40 }];
  
  // Añadir instrucciones en una hoja separada
  const instrucciones = [
    ['INSTRUCCIONES PARA EL REGISTRO MASIVO DE ESTUDIANTES'],
    [''],
    ['1. No modifique las cabeceras de las columnas (NOMBRE, APELLIDO, CI, etc.)'],
    ['2. La fecha de nacimiento debe estar en formato YYYY-MM-DD (Año-Mes-Día)'],
    ['3. El curso debe ser un número entre 1 y 12:'],
    ['   - 1 a 6: Primaria (1° a 6° de primaria)'],
    ['   - 7 a 12: Secundaria (1° a 6° de secundaria)'],
    ['4. El CI (Carnet de Identidad) debe ser único para cada estudiante y es obligatorio'],
    ['5. Complete los datos de cada estudiante en una fila independiente'],
    ['6. Puede agregar tantas filas como estudiantes necesite registrar'],
    ['7. Puede eliminar las filas de ejemplo antes de subir el archivo'],
    ['8. No deje celdas vacías en los campos obligatorios (NOMBRE, APELLIDO, CI, FECHA_NACIMIENTO, CURSO)'],
    ['9. El campo EMAIL es opcional pero recomendado'],
    [''],
    ['RECOMENDACIONES:'],
    ['- Verifique que los datos estén correctos antes de subir el archivo'],
    ['- El sistema validará que no existan estudiantes duplicados por CI'],
    ['- Después de registrar los estudiantes, deberá inscribirlos en las áreas correspondientes'],
    ['- Recuerde que cada estudiante puede inscribirse en máximo 2 áreas']
  ];
  
  const instruccionesSheet = XLSX.utils.aoa_to_sheet(instrucciones);
  instruccionesSheet['!cols'] = [{ wch: 100 }];
  
  // Añadir todas las hojas al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
  XLSX.utils.book_append_sheet(workbook, areasSheet, 'Áreas Disponibles');
  XLSX.utils.book_append_sheet(workbook, instruccionesSheet, 'Instrucciones');
  
  // Convertir a un blob
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  
  // Convertir la cadena binaria a un Blob
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }
  
  return new Blob([buf], { type: 'application/octet-stream' });
};

/**
 * Descarga la plantilla de Excel generada
 */
export const descargarPlantillaExcel = () => {
  const blob = generarPlantillaExcel();
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_registro_estudiantes.xlsx';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
