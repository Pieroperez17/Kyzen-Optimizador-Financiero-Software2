import nodemailer from 'nodemailer';

export default class MailService {
  static TIMEOUT_MILLISECONDS = 15000;

  constructor(mailConfiguration) {
    this.configuration = mailConfiguration;
    this.from = mailConfiguration.from;
    this.transporter = null;
    if (mailConfiguration.host) {
      this.transporter = nodemailer.createTransport({
        host: mailConfiguration.host,
        port: mailConfiguration.port,
        secure: mailConfiguration.secure,
        auth: mailConfiguration.user
          ? { user: mailConfiguration.user, pass: mailConfiguration.password }
          : undefined,
        connectionTimeout: MailService.TIMEOUT_MILLISECONDS,
        greetingTimeout: MailService.TIMEOUT_MILLISECONDS,
        socketTimeout: MailService.TIMEOUT_MILLISECONDS
      });
    }
  }

  isConfigured() {
    return Boolean(this.transporter);
  }

  describe() {
    const { host, port, secure, user } = this.configuration;
    return `${host}:${port} (secure=${secure}, usuario=${user || 'sin usuario'})`;
  }

  static explain(error) {
    const hints = {
      EAUTH: 'Usuario o contraseña SMTP incorrectos. En Gmail usa una contraseña de aplicación con la verificación en 2 pasos activa.',
      ETIMEDOUT: 'El servidor no respondió. Revisa que el VPS permita conexiones salientes al puerto SMTP.',
      ECONNECTION: 'No se pudo conectar al servidor SMTP. Revisa SMTP_HOST, SMTP_PORT y el firewall del VPS.',
      ESOCKET: 'Error de conexión segura. Usa SMTP_PORT=465 con SMTP_SECURE=true, o SMTP_PORT=587 con SMTP_SECURE=false.',
      EDNS: 'No se pudo resolver SMTP_HOST. Revisa que el nombre del servidor esté bien escrito.'
    };
    const hint = hints[error.code] || 'Revisa las variables SMTP_* del archivo .env.';
    return `${error.code || 'ERROR'}: ${error.message}. ${hint}`;
  }

  async verifyConnection() {
    if (!this.transporter) {
      console.log('[Kyzen] Correo sin configurar: los códigos se mostrarán en esta consola.');
      return false;
    }
    try {
      await this.transporter.verify();
      console.log(`[Kyzen] Conexión SMTP correcta con ${this.describe()}`);
      return true;
    } catch (error) {
      console.error(`[Kyzen] Falló la conexión SMTP con ${this.describe()}. ${MailService.explain(error)}`);
      return false;
    }
  }

  async send(email, subject, text) {
    const information = await this.transporter.sendMail({ from: this.from, to: email, subject, text });
    console.log(`[Kyzen] Correo enviado a ${email} (${information.messageId})`);
    return information;
  }

  async sendCode(email, code, purpose) {
    const subject = purpose === 'reset'
      ? 'Kyzen - Código para recuperar tu contraseña'
      : 'Kyzen - Código de verificación de tu cuenta';
    const text = `Tu código de Kyzen es ${code}. Vence en 15 minutos. Si no solicitaste este código, ignora este mensaje.`;

    if (!this.transporter) {
      console.log(`[Kyzen] ${subject} para ${email}: ${code}`);
      return;
    }

    try {
      await this.send(email, subject, text);
    } catch (error) {
      console.error(`[Kyzen] No se pudo enviar el correo a ${email}. ${MailService.explain(error)}`);
      console.log(`[Kyzen] ${subject} para ${email}: ${code}`);
    }
  }
}
