import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword, getEmailFromToken } from '../services/api';
import '../styles/auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');

  // Obtener el email del usuario usando el token
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const emailResponse = await getEmailFromToken(token);
        if (emailResponse.data && emailResponse.data.email) {
          setEmail(emailResponse.data.email);
        } else {
          setMessage('Token inválido o expirado');
        }
      } catch (error) {
        setMessage('Error al obtener el email');
      }
    };
    fetchEmail();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await resetPassword(token, email, password);
      
      if (response.status === 200) {
        setMessage('Contraseña actualizada exitosamente');
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setMessage('Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al restablecer la contraseña');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo_umss.png" alt="TIS-25 Logo" className="logo" />
        <h2>Restablecer Contraseña</h2>
        {message && (
          <div className={`message ${showSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        {!showSuccess && (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
            <button type="submit" className="submit-button">
              Restablecer Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
