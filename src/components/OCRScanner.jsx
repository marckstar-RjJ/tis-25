import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Button, Spinner, Alert } from 'react-bootstrap';

const OCRScanner = ({ onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const processImage = async (file) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const result = await Tesseract.recognize(file, 'spa', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = result;
      
      if (text.trim()) {
        // Buscar el patrón de la orden en el texto
        const orderPattern = /Orden:\s*ORDEN-\d+/i;
        const match = text.match(orderPattern);
        
        if (match) {
          setVerificationStatus('success');
          onTextExtracted({
            text,
            verified: true,
            orderNumber: match[0]
          });
        } else {
          setVerificationStatus('error');
          setError('No se encontró un número de orden válido en el comprobante');
        }
      } else {
        setVerificationStatus('error');
        setError('No se pudo extraer texto de la imagen');
      }
    } catch (err) {
      setError('Error al procesar la imagen: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        setError('Por favor, seleccione un archivo de imagen válido');
      }
    }
  };

  return (
    <div className="ocr-scanner mb-4">
      <div className="mb-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="form-control"
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="text-center mb-3">
          <Spinner animation="border" role="status" className="me-2" />
          <span>Procesando imagen... {progress}%</span>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {verificationStatus === 'success' && (
        <Alert variant="success" className="mb-3">
          Verificación aceptada
        </Alert>
      )}
      
      <small className="text-muted d-block mb-3">
        Formatos soportados: JPG, PNG, BMP, GIF
      </small>
    </div>
  );
};

export default OCRScanner;
