import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Convocatoria() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleRegistro = () => {
    navigate('/registro');
  };

  return (
    <div className="container">
      <div className="left-section">
        <h1>Bienvenido a TIS 25</h1>
        <p>
          La Olimpiada TIS 25 es un evento académico que busca promover el desarrollo
          de habilidades en Tecnologías de la Información y Software entre los
          estudiantes de nivel secundario.
        </p>
        <p>
          Participa en esta emocionante competencia y demuestra tus conocimientos
          en programación, desarrollo web y más.
        </p>
      </div>
      <div className="convocatoria">
        <h2>¡Inscríbete ahora!</h2>
        <button
          onClick={handleRegistro}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Convocatoria; 