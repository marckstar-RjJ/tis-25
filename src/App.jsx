import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 relative font-sans overflow-x-hidden">
      {/* Barra de navegación superior blanca */}
      <header className="w-full flex justify-between items-center px-10 py-4 border-b border-gray-200 shadow-sm bg-white fixed top-0 left-0 z-20">
        <div className="flex items-center gap-2">
          <img src="/logo_umss.png" alt="Logo UMSS" className="w-8 h-8" />
        </div>
        <nav className="flex gap-6 items-center">
          <a href="#" className="text-sm font-medium hover:underline">Eventos</a>
          <a href="#" className="text-sm font-medium hover:underline">Reglamento</a>
          <a href="#" className="text-sm font-medium hover:underline">Contactanos</a>
        </nav>
        <div className="flex gap-3 items-center">
          <button className="text-sm font-medium px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Ingresar</button>
          <button className="text-sm font-medium px-4 py-1 border border-gray-400 rounded hover:bg-gray-100">Registrarse</button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-col md:flex-row items-start justify-between px-6 md:px-20 pt-36 pb-10 relative">
        {/* Fondo transparente con logo */}
        <div className="absolute inset-0 opacity-5 z-0 flex items-center justify-center pointer-events-none">
          <img src="tis-25\src\recursos\emblema-actual-san-simon.jpg" alt="Logo umss" className="w-full max-w-4xl" />
        </div>

        {/* Texto informativo */}
        <div className="z-10 bg-white bg-opacity-90 p-8 rounded-xl shadow-md max-w-xl mt-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">Olimpiadas Escolares 2025<br/>Oh Sansi</h1>
          <p className="text-gray-700 text-justify">
            La Universidad Mayor de San Simón (UMSS) invita a los estudiantes de educación básica y secundaria de todo el país a participar en la Olimpiada de Ciencia y Tecnología – Oh Sansi 2025, un evento diseñado para identificar y estimular el talento en las áreas de Matemáticas, Física, Astronomía y Astrofísica, Biología, Química, Informática y Robótica.
            <br/><br/>
            Un espacio para el desarrollo científico. La Olimpiada tiene como objetivo principal desarrollar actividades competitivas en ciencias que permitan identificar a estudiantes con habilidades y aptitudes excepcionales en estas áreas del conocimiento.
          </p>
        </div>

        {/* Formulario de login */}
        <div className="z-10 bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mt-10 md:mt-0 md:ml-10">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Ingresar</h2>
          <form>
            <label className="block mb-2 text-gray-600">Email</label>
            <input
              type="email"
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="example@email.com"
            />

            <label className="block mb-2 text-gray-600">Contraseña</label>
            <input
              type="password"
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="********"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Ingresar
            </button>

            <div className="text-right mt-2">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña ?
              </a>
            </div>
          </form>
        </div>

        {/* Botón de convocatoria */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-center">
          <p className="text-xl font-semibold text-black mb-2">Convocatoria</p>
          <a
            href="#"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow-md"
          >
            Descargar
          </a>
        </div>
      </main>
    </div>
  );
}
