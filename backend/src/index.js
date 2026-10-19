import ApplicationConfiguration from './config/ApplicationConfiguration.js';
import Server from './Server.js';

const server = new Server(new ApplicationConfiguration());

server.start().catch((error) => {
  console.error('[Kyzen] No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
