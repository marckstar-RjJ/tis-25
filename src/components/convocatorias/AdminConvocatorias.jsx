import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ListaConvocatorias from './ListaConvocatorias';
import FormularioConvocatoria from './FormularioConvocatoria';
import GestionAreasConvocatoria from './GestionAreasConvocatoria';

const AdminConvocatorias = () => {
  const [vista, setVista] = useState('lista');
  const [convocatoriaSeleccionadaId, setConvocatoriaSeleccionadaId] = useState(null);
  const [mostrarGestionAreas, setMostrarGestionAreas] = useState(false);
  
  const handleCrearNueva = () => {
    setConvocatoriaSeleccionadaId(null);
    setVista('formulario');
    setMostrarGestionAreas(false);
  };
  
  const handleEditar = (id, seccion = 'general') => {
    setConvocatoriaSeleccionadaId(id);
    setVista('formulario');
    setMostrarGestionAreas(seccion === 'areas');
  };
  
  const handleGuardado = () => {
    setVista('lista');
    setConvocatoriaSeleccionadaId(null);
    setMostrarGestionAreas(false);
  };
  
  const handleCancelar = () => {
    setVista('lista');
    setMostrarGestionAreas(false);
  };
  
  const renderizarContenido = () => {
    if (vista === 'lista') {
      return (
        <ListaConvocatorias 
          onEditar={handleEditar}
          onCrearNueva={handleCrearNueva}
        />
      );
    } else if (vista === 'formulario') {
      if (mostrarGestionAreas) {
        return (
          <GestionAreasConvocatoria
            convocatoriaId={convocatoriaSeleccionadaId}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        );
      } else {
        return (
          <FormularioConvocatoria
            convocatoriaId={convocatoriaSeleccionadaId}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        );
      }
    }
  };
  
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="border-bottom pb-2">Administración de Convocatorias</h1>
          <p className="text-muted">
            Crea y administra convocatorias para las olimpiadas académicas.
            Configura fechas, costos y áreas habilitadas para cada convocatoria.
          </p>
          
          {vista !== 'lista' && (
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={handleCancelar}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a lista de convocatorias
            </Button>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col>
          {renderizarContenido()}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminConvocatorias;
