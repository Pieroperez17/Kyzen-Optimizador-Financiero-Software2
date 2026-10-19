import nodemailer from 'nodemailer';

export default class MailService {
  constructor(mailConfiguration) {
    this.from = mailConfiguration.from;
    this.transporter = null;
    if (mailConfiguration.host) {
      this.transporter = nodemailer.createTransport({
        host: mailConfiguration.host,
        port: mailConfiguration.port,
        secure: mailConfiguration.secure,
        auth: mailConfiguration.user
          ? { user: mailConfiguration.user, pass: mailConfiguration.password }
          : undefined
      });
    }
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
      await this.transporter.sendMail({ from: this.from, to: email, subject, text });
    } catch (error) {
      console.error(`[Kyzen] No se pudo enviar el correo a ${email}: ${error.message}`);
      console.log(`[Kyzen] ${subject} para ${email}: ${code}`);
    }
  }
}
