import path from 'node:path';
import express from 'express';
import cors from 'cors';
import Database from './config/Database.js';
import CurrencyConverter from './rules/CurrencyConverter.js';
import VoucherStorage from './rules/VoucherStorage.js';
import TokenService from './services/TokenService.js';
import MailService from './services/MailService.js';
import CategorySeeder from './services/CategorySeeder.js';
import AuthenticationMiddleware from './middleware/AuthenticationMiddleware.js';
import ErrorHandler from './middleware/ErrorHandler.js';
import AuthenticationController from './controllers/AuthenticationController.js';
import TransactionController from './controllers/TransactionController.js';
import DashboardController from './controllers/DashboardController.js';
import GoalController from './controllers/GoalController.js';
import CategoryController from './controllers/CategoryController.js';
import AuthenticationRoutes from './routes/AuthenticationRoutes.js';
import TransactionRoutes from './routes/TransactionRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import GoalRoutes from './routes/GoalRoutes.js';
import CategoryRoutes from './routes/CategoryRoutes.js';

export default class Server {
  constructor(configuration) {
    this.configuration = configuration;
    this.database = new Database(configuration.database);
    this.application = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  configureMiddleware() {
    this.application.use(cors({ origin: this.configuration.clientUrl.split(',').map((origin) => origin.trim()) }));
    this.application.use(express.json({ limit: '8mb' }));
    this.application.use('/uploads', express.static(path.resolve(this.configuration.uploadsDirectory)));
  }

  configureRoutes() {
    const { User, Category, Transaction, Goal } = this.database.models;
    const tokenService = new TokenService(this.configuration.jsonWebToken);
    const mailService = new MailService(this.configuration.mail);
    this.mailService = mailService;
    const currencyConverter = new CurrencyConverter(this.configuration.exchangeRateUsd);
    const voucherStorage = new VoucherStorage(this.configuration.uploadsDirectory);
    const authenticationMiddleware = new AuthenticationMiddleware(tokenService, User);

    const routes = {
      '/api/auth': new AuthenticationRoutes(new AuthenticationController({ User, tokenService, mailService }), authenticationMiddleware),
      '/api/transactions': new TransactionRoutes(new TransactionController({ Transaction, Category, voucherStorage }), authenticationMiddleware),
      '/api/dashboard': new DashboardRoutes(new DashboardController({ Transaction, Category, exchangeRateUsd: this.configuration.exchangeRateUsd }), authenticationMiddleware),
      '/api/goals': new GoalRoutes(new GoalController({ Goal, currencyConverter }), authenticationMiddleware),
      '/api/categories': new CategoryRoutes(new CategoryController({ Category }), authenticationMiddleware)
    };

    this.application.get('/api/health', (request, response) => {
      response.json({ success: true, status: 'ok' });
    });
    Object.entries(routes).forEach(([routePath, routeGroup]) => {
      this.application.use(routePath, routeGroup.createRouter());
    });
    this.application.use(ErrorHandler.notFound);
    this.application.use(ErrorHandler.handle);
  }

  async start() {
    await this.database.connect();
    await new CategorySeeder(this.database.models.Category).seed();
    this.application.listen(this.configuration.port, () => {
      console.log(`[Kyzen] API escuchando en el puerto ${this.configuration.port}`);
    });
    this.mailService.verifyConnection();
  }
}
