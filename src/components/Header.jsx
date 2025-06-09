import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="hamburger-menu" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Link to="/" className="logo">
          {/* Aquí puedes agregar tu logo o nombre de la aplicación */}
          TIS-25
        </Link>
      </div>

      <div className="header-right">
        {currentUser ? (
          <div className="auth-buttons">
            <button className="btn-ingresar" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-ingresar">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="btn-registrar">
              Crear Cuenta
            </Link>
          </div>
        )}
      </div>

      {/* Menú móvil */}
      <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={toggleMenu}>
              Inicio
            </Link>
          </li>
          {currentUser && (
            <>
              <li>
                <Link to="/dashboard" onClick={toggleMenu}>
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          )}
          {!currentUser && (
            <>
              <li>
                <Link to="/login" onClick={toggleMenu}>
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/registro" onClick={toggleMenu}>
                  Crear Cuenta
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
