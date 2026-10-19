import ApplicationConfiguration from './config/ApplicationConfiguration.js';
import MailService from './services/MailService.js';

class MailTest {
  constructor(configuration) {
    this.mailService = new MailService(configuration.mail);
  }

  async run(recipient) {
    if (!recipient) {
      console.error('[Kyzen] Indica el correo de destino: npm run mail:test -- correo@ejemplo.com');
      return false;
    }
    if (!this.mailService.isConfigured()) {
      console.error('[Kyzen] SMTP_HOST está vacío. Configura las variables SMTP_* antes de probar.');
      return false;
    }

    console.log(`[Kyzen] Probando ${this.mailService.describe()}`);
    if (!(await this.mailService.verifyConnection())) {
      return false;
    }

    try {
      await this.mailService.send(
        recipient,
        'Kyzen - Correo de prueba',
        'Si recibes este mensaje, el envío de correos de Kyzen está configurado correctamente.'
      );
      console.log('[Kyzen] Prueba terminada. Revisa la bandeja de entrada y la carpeta de spam.');
      return true;
    } catch (error) {
      console.error(`[Kyzen] No se pudo enviar el correo de prueba. ${MailService.explain(error)}`);
      return false;
    }
  }
}

const succeeded = await new MailTest(new ApplicationConfiguration()).run(process.argv[2]);
process.exit(succeeded ? 0 : 1);
