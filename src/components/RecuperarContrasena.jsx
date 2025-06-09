import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUserEmail, generateResetToken } from '../services/api';
import emailjs from '@emailjs/browser';
import '../styles/auth.css';
const logo = '/logo_umss.png'; // Logo desde la carpeta public // Asegúrate de tener una imagen de logo en esta ruta

// Inicializar EmailJS con los mismos IDs que en el registro
emailjs.init({
  publicKey: "UG8Ii-NDlFP7m-iXP",
  blockHeadless: true,
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Verificar que el correo existe en la base de datos
      const response = await checkUserEmail(email);
      
      // Verificar si el usuario existe
      if (!response.exists) {
        setMessage('No existe un usuario registrado con este correo electrónico');
        return;
      }

      // Generar un token de recuperación
      const tokenResponse = await generateResetToken(email);
      const resetToken = tokenResponse.token;

      // Validar el correo electrónico
      if (!email || !email.includes('@')) {
        setMessage('Por favor, ingresa un correo electrónico válido');
        return;
      }

      // Enviar correo usando EmailJS
      const templateParams = {
        email: email,
        subject: 'Recuperación de Contraseña - TIS-25',
        message: `
          Hemos recibido una solicitud para recuperar tu contraseña.
          
          Para continuar con el proceso de recuperación, haz clic en el siguiente enlace:
          
          ${window.location.origin}/reset-password/${resetToken}
          
          Este enlace expirará en 24 horas.
          Si no solicitaste este cambio, puedes ignorar este correo.
        `
      };

      const emailResponse = await emailjs.send(
        "service_pj9u56o",
        "template_30m993y",
        templateParams,
        {
          publicKey: "UG8Ii-NDlFP7m-iXP"
        }
      );

      if (emailResponse.status === 200) {
        setMessage('Se ha enviado un correo con instrucciones para recuperar tu contraseña');
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        setMessage('Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar la solicitud de recuperación');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="TIS-25 Logo" className="logo" />
        <h2>Recuperar Contraseña</h2>
        {message && (
          <div className={`message ${showSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="recuperar-contrasena-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <button type="submit" className="submit-button">
            Recuperar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
