import emailjs from '@emailjs/browser';

// Inicializar EmailJS con tu User ID
emailjs.init({
  publicKey: "UG8Ii-NDlFP7m-iXP",
  blockHeadless: true,
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

// Función para enviar correo
const sendEmail = async (toEmail, subject, message, templateParams = {}) => {
  try {
    // Verificar que el correo del destinatario no esté vacío
    if (!toEmail || !toEmail.includes('@')) {
      console.error('Correo del destinatario inválido:', toEmail);
      return false;
    }

    console.log('Intentando enviar correo con EmailJS...');
    console.log('Parámetros:', {
      email: toEmail,
      subject: subject,
      message: message,
      ...templateParams
    });

    // Asegurarse de que el correo se pase como email (no to_email)
    const emailParams = {
      email: toEmail,
      subject: subject,
      message: message,
      ...templateParams
    };

    console.log('Parámetros finales para EmailJS:', emailParams);

    const response = await emailjs.send(
      "service_7db38qa",
      "template_30m993y",
      emailParams,
      {
        publicKey: "UG8Ii-NDlFP7m-iXP"
      }
    );

    console.log("Respuesta de EmailJS:", response);
    
    if (response.status === 200) {
      console.log("Correo enviado exitosamente!");
      return true;
    } else {
      console.error("Error en la respuesta de EmailJS:", response);
      return false;
    }
  } catch (error) {
    console.error("Error detallado al enviar el correo:", {
      message: error.message,
      status: error.status,
      text: error.text,
      stack: error.stack
    });
    return false;
  }
};

// Función para enviar correo de registro
export const sendRegistrationEmail = async (email, username, password) => {
  const subject = "Bienvenido a TIS - Tus credenciales de acceso";
  const message = `¡Bienvenido a TIS! 
  
Tus credenciales de acceso son:
Usuario: ${username}
Contraseña: ${password}

Por favor, guarda esta información en un lugar seguro.`;

  return sendEmail(email, subject, message);
};

// Función para enviar correo de inscripción
export const sendInscriptionEmail = async (email, areas, total) => {
  const subject = "Confirmación de Inscripción - TIS";
  const message = `¡Tu inscripción ha sido registrada exitosamente!

Áreas inscritas:
${areas.map(area => `- ${area.nombre}`).join('\n')}

Total a pagar: $${total}

Por favor, procede a generar tu orden de pago.`;

  return sendEmail(email, subject, message);
};

// Función para enviar correo de orden de pago
export const sendPaymentOrderEmail = async (email, areas, total, paymentDetails) => {
  const subject = "Orden de Pago Generada - TIS";
  const message = `Tu orden de pago ha sido generada exitosamente.

Detalles de la inscripción:
${areas.map(area => `- ${area.nombre}`).join('\n')}

Total a pagar: $${total}

Detalles del pago:
${paymentDetails}

Por favor, realiza el pago según las instrucciones proporcionadas.`;

  return sendEmail(email, subject, message);
}; 