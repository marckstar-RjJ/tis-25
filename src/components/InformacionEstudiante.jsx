import React from 'react';
import { FaUser, FaIdCard, FaGraduationCap, FaSchool, FaPhone, FaEnvelope } from 'react-icons/fa';

const InformacionEstudiante = ({ estudiante }) => {
    if (!estudiante) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Aviso: </strong>
                    <span className="block sm:inline">No se encontraron datos del estudiante</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header con foto de perfil y nombre */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 rounded-full">
                            <FaUser className="h-10 w-10 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white leading-tight">
                                {estudiante.nombre} {estudiante.apellido}
                            </h1>
                            <p className="text-blue-100 text-sm">Estudiante</p>
                        </div>
                    </div>
                </div>

                {/* Información del estudiante */}
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Datos personales */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                Datos Personales
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-6 flex-shrink-0 mt-1">
                                        <FaIdCard className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">CI</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{estudiante.ci}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 flex-shrink-0 mt-1">
                                        <FaPhone className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{estudiante.celular}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 flex-shrink-0 mt-1">
                                        <FaEnvelope className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Correo</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{estudiante.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Datos académicos */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-base font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                Datos Académicos
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-6 flex-shrink-0 mt-1">
                                        <FaGraduationCap className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Curso</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{estudiante.curso}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 flex-shrink-0 mt-1">
                                        <FaSchool className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Colegio</p>
                                        <p className="text-sm font-medium text-gray-800 break-all">{estudiante.colegio}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InformacionEstudiante; 