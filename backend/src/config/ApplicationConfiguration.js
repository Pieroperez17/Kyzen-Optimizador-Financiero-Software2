import dotenv from 'dotenv';

dotenv.config();

export default class ApplicationConfiguration {
  constructor(environment = process.env) {
    this.port = Number(environment.PORT || 4000);
    this.clientUrl = environment.CLIENT_URL || 'http://localhost:5173';
    this.database = {
      host: environment.DATABASE_HOST || 'localhost',
      port: Number(environment.DATABASE_PORT || 5432),
      name: environment.DATABASE_NAME || 'kyzen',
      user: environment.DATABASE_USER || 'postgres',
      password: environment.DATABASE_PASSWORD || 'postgres'
    };
    this.jsonWebToken = {
      secret: environment.JWT_SECRET || 'kyzen_clave_de_desarrollo',
      expiration: environment.JWT_EXPIRATION || '7d'
    };
    this.uploadsDirectory = environment.UPLOADS_DIRECTORY || 'uploads';
    this.exchangeRateUsd = Number(environment.EXCHANGE_RATE_USD || 3.75);
    this.mail = {
      host: environment.SMTP_HOST || '',
      port: Number(environment.SMTP_PORT || 587),
      secure: environment.SMTP_SECURE === 'true',
      user: environment.SMTP_USER || '',
      password: environment.SMTP_PASSWORD || '',
      from: environment.SMTP_FROM || 'Kyzen <no-responder@kyzen.app>'
    };
  }
}
