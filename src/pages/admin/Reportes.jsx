import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import './Reportes.css';

const Reportes = () => {
    const [reportes, setReportes] = useState([]);
    const [reportesFiltrados, setReportesFiltrados] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ 
        total_inscritos: 0, 
        pagos_pendientes: 0, 
        pagos_completados: 0,
        monto_total: 0
    });
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [estadoPago, setEstadoPago] = useState('');
    const [areas, setAreas] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState('');
    const [loading, setLoading] = useState(false);
    const [busquedaNombre, setBusquedaNombre] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!busquedaNombre.trim()) {
            setReportesFiltrados(reportes);
            return;
        }

        const terminoBusqueda = busquedaNombre.toLowerCase().trim();
        const filtrados = reportes.filter(reporte => 
            reporte.estudiante.nombre.toLowerCase().includes(terminoBusqueda) ||
            reporte.estudiante.ci.toLowerCase().includes(terminoBusqueda)
        );
        setReportesFiltrados(filtrados);
    }, [busquedaNombre, reportes]);

    const cargarDatos = () => {
        setLoading(true);
        try {
            // Cargar inscripciones desde localStorage
            const inscripciones = JSON.parse(localStorage.getItem('olimpiadas_inscripciones') || '[]');
            console.log('Inscripciones cargadas:', inscripciones);
            
            // Cargar áreas desde localStorage
            const areasData = JSON.parse(localStorage.getItem('olimpiadas_areas') || '[]');
            setAreas(areasData);

            // Procesar inscripciones para el reporte
            const reportesProcesados = inscripciones.map(inscripcion => {
                // Asegurarse de que tenemos todos los datos necesarios
                if (!inscripcion.estudiante || !inscripcion.convocatoria || !inscripcion.areas) {
                    console.warn('Inscripción con datos incompletos:', inscripcion);
                    return null;
                }

                return {
                    id: inscripcion.id,
                    estudiante: {
                        nombre: `${inscripcion.estudiante.nombre || ''} ${inscripcion.estudiante.apellido || ''}`.trim(),
                        ci: inscripcion.estudiante.ci || 'No disponible'
                    },
                    area: inscripcion.areas.map(area => area.nombre).join(', '),
                    convocatoria: inscripcion.convocatoria.nombre || 'No disponible',
                    fecha_inscripcion: inscripcion.fechaInscripcion || inscripcion.fecha || new Date().toISOString(),
                    estado_pago: inscripcion.estado || 'pendiente',
                    costo: inscripcion.costoTotal || (inscripcion.convocatoria.costo_por_area || 16) * inscripcion.areas.length
                };
            }).filter(reporte => reporte !== null);

            console.log('Reportes procesados:', reportesProcesados);
            setReportes(reportesProcesados);
            setReportesFiltrados(reportesProcesados);

            // Calcular estadísticas
            const totalInscritos = reportesProcesados.length;
            const pagosPendientes = reportesProcesados.filter(r => r.estado_pago === 'pendiente').length;
            const pagosCompletados = reportesProcesados.filter(r => r.estado_pago === 'pagado').length;
            const montoTotal = reportesProcesados.reduce((sum, r) => sum + (r.estado_pago === 'pagado' ? r.costo : 0), 0);

            setEstadisticas({
                total_inscritos: totalInscritos,
                pagos_pendientes: pagosPendientes,
                pagos_completados: pagosCompletados,
                monto_total: montoTotal
            });

        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        setLoading(true);
        try {
            // Obtener todas las inscripciones
            const inscripciones = JSON.parse(localStorage.getItem('olimpiadas_inscripciones') || '[]');
            
            // Procesar inscripciones con filtros
            let reportesFiltrados = inscripciones.map(inscripcion => {
                // Filtrar por fecha si se especificó
                const fechaInscripcion = new Date(inscripcion.fechaInscripcion || inscripcion.fecha);
                if (fechaInicio && fechaInscripcion < fechaInicio) return null;
                if (fechaFin && fechaInscripcion > fechaFin) return null;

                // Verificar si el área seleccionada está en las áreas de la inscripción
                if (areaSeleccionada && !inscripcion.areas.some(area => area.id === areaSeleccionada)) {
                    return null;
                }

                // Verificar estado de pago
                if (estadoPago && inscripcion.estado !== estadoPago) {
                    return null;
                }

                return {
                    id: inscripcion.id,
                    estudiante: {
                        nombre: `${inscripcion.estudiante.nombre || ''} ${inscripcion.estudiante.apellido || ''}`.trim(),
                        ci: inscripcion.estudiante.ci || 'No disponible'
                    },
                    area: inscripcion.areas.map(area => area.nombre).join(', '),
                    convocatoria: inscripcion.convocatoria.nombre || 'No disponible',
                    fecha_inscripcion: inscripcion.fechaInscripcion || inscripcion.fecha || new Date().toISOString(),
                    estado_pago: inscripcion.estado || 'pendiente',
                    costo: inscripcion.costoTotal || (inscripcion.convocatoria.costo_por_area || 16) * inscripcion.areas.length
                };
            }).filter(reporte => reporte !== null);

            setReportes(reportesFiltrados);
            setReportesFiltrados(reportesFiltrados);

        } catch (error) {
            console.error('Error al aplicar filtros:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reportes-container">
            <h2>Reportes y Estadísticas</h2>
            
            <Card className="filtros-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Filtros
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Buscar por nombre o CI"
                                variant="outlined"
                                value={busquedaNombre}
                                onChange={(e) => setBusquedaNombre(e.target.value)}
                                placeholder="Ingrese nombre o CI del estudiante..."
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{ color: 'action.active', mr: 1, my: 0.5 }}>
                                            🔍
                                        </Box>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    marginBottom: 2
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                                <DatePicker
                                    label="Fecha Inicio"
                                    value={fechaInicio}
                                    onChange={setFechaInicio}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                                <DatePicker
                                    label="Fecha Fin"
                                    value={fechaFin}
                                    onChange={setFechaFin}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                label="Estado de Pago"
                                value={estadoPago}
                                onChange={(e) => setEstadoPago(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="pagado">Pagado</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                label="Área"
                                value={areaSeleccionada}
                                onChange={(e) => setAreaSeleccionada(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {areas.map((area) => (
                                    <MenuItem key={area.id} value={area.id}>
                                        {area.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={aplicarFiltros}>
                            Aplicar Filtros
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card className="estadisticas-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Estadísticas Generales
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1">
                                Total Inscritos: {estadisticas.total_inscritos}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1">
                                Pagos Pendientes: {estadisticas.pagos_pendientes}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1">
                                Pagos Completados: {estadisticas.pagos_completados}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1">
                                Monto Total: Bs. {estadisticas.monto_total}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="reportes-table-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Lista de Inscritos {busquedaNombre && `(${reportesFiltrados.length} resultados)`}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>CI</TableCell>
                                    <TableCell>Convocatoria</TableCell>
                                    <TableCell>Área</TableCell>
                                    <TableCell>Fecha Inscripción</TableCell>
                                    <TableCell>Estado Pago</TableCell>
                                    <TableCell>Costo</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">Cargando...</TableCell>
                                    </TableRow>
                                ) : reportesFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            {busquedaNombre ? 
                                                'No se encontraron resultados para la búsqueda' : 
                                                'No hay datos para mostrar'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reportesFiltrados.map((reporte) => (
                                        <TableRow key={reporte.id}>
                                            <TableCell>{reporte.estudiante.nombre}</TableCell>
                                            <TableCell>{reporte.estudiante.ci}</TableCell>
                                            <TableCell>{reporte.convocatoria}</TableCell>
                                            <TableCell>{reporte.area}</TableCell>
                                            <TableCell>{new Date(reporte.fecha_inscripcion).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className={`estado-pago ${reporte.estado_pago}`}>
                                                    {reporte.estado_pago}
                                                </span>
                                            </TableCell>
                                            <TableCell>Bs. {reporte.costo}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reportes; 