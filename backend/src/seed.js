import ApplicationConfiguration from './config/ApplicationConfiguration.js';
import Database from './config/Database.js';
import CategorySeeder from './services/CategorySeeder.js';

class DatabaseSeed {
  constructor(configuration) {
    this.database = new Database(configuration.database);
  }

  async run() {
    const shouldReset = process.argv.includes('--reset');
    await this.database.sequelize.authenticate();
    await this.database.sequelize.sync({ force: shouldReset });
    await new CategorySeeder(this.database.models.Category).seed();
    console.log(shouldReset
      ? '[Kyzen] Tablas recreadas y categorías cargadas.'
      : '[Kyzen] Tablas verificadas y categorías cargadas.');
    await this.database.close();
  }
}

new DatabaseSeed(new ApplicationConfiguration()).run().catch((error) => {
  console.error('[Kyzen] Error al ejecutar el seed:', error.message);
  process.exit(1);
});
