// Servicio de logging para el frontend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class Logger {
    static async log(action, details = {}) {
        try {
            const logData = {
                action,
                details,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                // Obtener el usuario del localStorage si existe
                user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : 'guest'
            };

            // Enviar log al backend
            await axios.post(`${API_URL}/api/logs`, logData);

            // También guardar en localStorage para persistencia
            const logs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
            logs.push(logData);
            localStorage.setItem('frontend_logs', JSON.stringify(logs.slice(-100))); // Mantener últimos 100 logs

        } catch (error) {
            console.error('Error al registrar log:', error);
        }
    }

    // Métodos específicos para diferentes tipos de acciones
    static async logLogin(success, details = {}) {
        await this.log('login', { success, ...details });
    }

    static async logLogout() {
        await this.log('logout');
    }

    static async logFormSubmission(formName, success, details = {}) {
        await this.log('form_submission', { formName, success, ...details });
    }

    static async logError(error, context = {}) {
        await this.log('error', { 
            errorMessage: error.message,
            errorStack: error.stack,
            ...context 
        });
    }

    static async logNavigation(from, to) {
        await this.log('navigation', { from, to });
    }

    // Método para obtener logs locales
    static getLocalLogs() {
        return JSON.parse(localStorage.getItem('frontend_logs') || '[]');
    }

    // Método para limpiar logs locales
    static clearLocalLogs() {
        localStorage.removeItem('frontend_logs');
    }
}

export default Logger; 