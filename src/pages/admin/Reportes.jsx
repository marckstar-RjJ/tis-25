import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import axios from 'axios';
import './Reportes.css';

const Reportes = () => {
    const [reportes, setReportes] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ total_inscritos: 0, pagos_pendientes: 0, pagos_completados: 0 });
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [estadoPago, setEstadoPago] = useState('');
    const [areas, setAreas] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarReportes();
        cargarEstadisticas();
        cargarAreas();
    }, []);

    const cargarReportes = async (params = {}) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/reportes', { params });
            setReportes(response.data);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await axios.get('/api/estadisticas');
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const cargarAreas = async () => {
        try {
            const response = await axios.get('/api/areas');
            setAreas(response.data);
        } catch (error) {
            console.error('Error al cargar áreas:', error);
        }
    };

    const aplicarFiltros = async () => {
        const params = {};
        if (fechaInicio) {
            params.fecha_inicio = fechaInicio.toISOString().split('T')[0];
        }
        if (fechaFin) {
            params.fecha_fin = fechaFin.toISOString().split('T')[0];
        }
        if (estadoPago) {
            params.estado_pago = estadoPago;
        }
        if (areaSeleccionada) {
            params.area_id = areaSeleccionada;
        }
        await cargarReportes(params);
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
                        <Grid item xs={12} sm={6} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                                <DatePicker
                                    label="Fecha Inicio"
                                    value={fechaInicio}
                                    onChange={setFechaInicio}
                                    renderInput={(params) => <TextField {...params} fullWidth style={{ minWidth: '350px' }} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                                <DatePicker
                                    label="Fecha Fin"
                                    value={fechaFin}
                                    onChange={setFechaFin}
                                    renderInput={(params) => <TextField {...params} fullWidth style={{ minWidth: '350px' }} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                select
                                label="Estado de Pago"
                                value={estadoPago}
                                onChange={(e) => setEstadoPago(e.target.value)}
                                fullWidth
                                style={{ minWidth: '350px' }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="pagado">Pagado</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                select
                                label="Área"
                                value={areaSeleccionada}
                                onChange={(e) => setAreaSeleccionada(e.target.value)}
                                fullWidth
                                style={{ minWidth: '350px' }}
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
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                Total Inscritos: {estadisticas.total_inscritos}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                Pagos Pendientes: {estadisticas.pagos_pendientes}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                Pagos Completados: {estadisticas.pagos_completados}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="reportes-table-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Lista de Inscritos
                    </Typography>
                    <div className="table-container">
                        {loading ? (
                            <Typography>Cargando...</Typography>
                        ) : (
                        <table className="reportes-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Área</th>
                                    <th>Fecha Inscripción</th>
                                    <th>Estado Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportes.length === 0 ? (
                                    <tr><td colSpan={5}>No hay datos para mostrar</td></tr>
                                ) : (
                                    reportes.map((reporte) => (
                                        <tr key={reporte.id}>
                                            <td>{reporte.id}</td>
                                            <td>{reporte.nombre}</td>
                                            <td>{reporte.area}</td>
                                            <td>{reporte.fecha_inscripcion ? new Date(reporte.fecha_inscripcion).toLocaleDateString() : ''}</td>
                                            <td>{reporte.estado_pago}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reportes; 