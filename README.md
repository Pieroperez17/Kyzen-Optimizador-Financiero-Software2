# Kyzen – Optimizador Financiero

Kyzen es una plataforma web de optimización financiera pensada para jóvenes universitarios y recién egresados. Permite registrar ingresos y gastos, ver el estado financiero en un panel, recibir una alerta cuando el gasto del mes supera el 80 % del presupuesto, definir metas de ahorro en soles o dólares y exportar reportes en CSV y PDF.

El proyecto se desarrolló para el curso Ingeniería de Software II y aplica dos estilos de arquitectura: **cliente-servidor**, que separa la aplicación React de la API REST, y **arquitectura en capas**, que organiza el código dentro de cada parte.

## Funcionalidades

| Historia | Funcionalidad |
| --- | --- |
| HU-07 | Registro de usuario con verificación por código enviado al correo |
| HU-08 | Inicio de sesión con JWT y mensaje genérico ante credenciales inválidas |
| HU-14 | Recuperación de contraseña en tres pasos (correo, código y nueva contraseña) |
| HU-01 / HU-02 | Registro de ingresos y gastos con categoría obligatoria para los gastos |
| HU-03 | Comprobante opcional en JPG o PNG de hasta 5 MB |
| HU-04 | Historial de movimientos con filtros por periodo y tipo |
| HU-12 | Dashboard con balance, ingresos, gastos y gráfico por categoría |
| HU-20 | Alerta roja cuando los gastos del mes superan el 80 % del presupuesto |
| HU-11 / HU-25 | Metas de ahorro con cuota mensual y recálculo en PEN o USD |
| HU-13 | Exportación de reportes en CSV (desde la API) y PDF (desde el navegador) |
| HU-06 / HU-24 | Perfil, presupuesto mensual, moneda de visualización y cambio de contraseña |

## Tecnologías

- **Frontend:** React 18, React Router, Vite, CSS y jsPDF.
- **Backend:** Node.js, Express 5, Sequelize, bcryptjs, JSON Web Token y Nodemailer.
- **Base de datos:** PostgreSQL.
- **Despliegue:** Docker, Docker Compose y Nginx.

## Arquitectura

```
Navegador (React)  ──HTTPS/JSON + JWT──>  API Express  ──Sequelize──>  PostgreSQL
```

El cliente solo muestra la información y envía solicitudes. La API aplica las reglas de negocio, la validación y la seguridad. Cada parte está organizada en capas:

- **Cliente:** páginas y componentes → contextos de estado (`AuthenticationContext`, `FinancialContext`) → servicios (`ApiClient`, `AuthenticationService`, `FinanceService`).
- **API:** rutas → controladores → reglas de negocio (`rules`) y modelos (`models`).

Todo el código está escrito con programación orientada a objetos: los modelos extienden `Model` de Sequelize, y los controladores, rutas, servicios y reglas de negocio son clases.

```
Kyzen-Optimizador-Financiero-Software2/
├── backend/
│   ├── src/
│   │   ├── config/        ApplicationConfiguration, Database
│   │   ├── controllers/   Authentication, Transaction, Dashboard, Goal, Category
│   │   ├── middleware/    AuthenticationMiddleware, ErrorHandler
│   │   ├── models/        User, Category, Transaction, Goal
│   │   ├── routes/        Una clase de rutas por recurso
│   │   ├── rules/         AlertEngine, Validator, CurrencyConverter, CsvExporter, VoucherStorage, PeriodRange
│   │   ├── services/      TokenService, MailService, VerificationCode, CategorySeeder, HttpError
│   │   ├── tests/unit/    Pruebas unitarias con node:test
│   │   ├── Server.js
│   │   ├── index.js
│   │   └── seed.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    Layout, gráficos, listas y mensajes
│   │   ├── context/       Gestor de sesión y gestor financiero
│   │   ├── domain/        MoneyFormatter, FormValidator, PdfReportGenerator
│   │   ├── pages/         Login, Registro, Verificación, Recuperación, Panel, Movimientos, Metas, Perfil
│   │   ├── services/      ApiClient, SessionStorage, AuthenticationService, FinanceService
│   │   └── styles/
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

### Modelo de datos

- **Users:** datos personales, credenciales cifradas con bcrypt, presupuesto mensual y códigos de verificación.
- **Categories:** catálogo de categorías de ingreso y gasto (se cargan automáticamente al iniciar).
- **Transactions:** movimientos del usuario con tipo, monto, fecha, categoría y comprobante.
- **Goals:** metas de ahorro con monto objetivo, monto ahorrado y fecha límite.

Un usuario tiene muchas transacciones y muchas metas, y cada transacción pertenece a una categoría. Las tablas se crean automáticamente con Sequelize al iniciar la API.

## Instalación en local

### Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Kyzen-Optimizador-Financiero-Software2
```

### 2. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE kyzen;"
```

### 3. Configurar y ejecutar la API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Edita `backend/.env` con las credenciales de tu PostgreSQL. La API queda disponible en `http://localhost:4000`. Al iniciar, crea las tablas y carga las categorías.

Si no configuras un servidor SMTP, los códigos de verificación y de recuperación se muestran en la consola de la API, lo que permite probar el registro en local sin enviar correos.

### 4. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Vite redirige las rutas `/api` y `/uploads` hacia la API.

### Scripts útiles

| Comando | Carpeta | Descripción |
| --- | --- | --- |
| `npm run dev` | backend | Inicia la API y la reinicia al detectar cambios |
| `npm start` | backend | Inicia la API en modo producción |
| `npm run seed` | backend | Verifica las tablas y carga las categorías |
| `npm run seed -- --reset` | backend | Recrea todas las tablas (borra los datos) |
| `npm test` | backend | Ejecuta las pruebas unitarias |
| `npm run build` | frontend | Genera la versión de producción en `dist/` |

## Endpoints principales

Todas las rutas están bajo `/api`. Las rutas privadas requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Crea la cuenta y envía el código de verificación |
| POST | `/auth/verify-otp` | Verifica la cuenta y devuelve el token |
| POST | `/auth/resend-otp` | Reenvía el código de verificación |
| POST | `/auth/login` | Inicia sesión |
| POST | `/auth/forgot-password` | Envía el código de recuperación |
| POST | `/auth/verify-code` | Valida el código de recuperación |
| POST | `/auth/reset-password` | Guarda la nueva contraseña |
| GET / PUT | `/auth/profile` | Consulta o actualiza el perfil |
| PUT | `/auth/budget` | Actualiza el presupuesto mensual |
| PUT | `/auth/change-password` | Cambia la contraseña |
| GET / POST | `/transactions` | Lista o registra movimientos |
| DELETE | `/transactions/:id` | Elimina un movimiento |
| GET | `/transactions/export?period=month\|year\|all` | Exporta los movimientos en CSV |
| GET | `/dashboard/summary` | Balance, gastos por categoría y alerta del 80 % |
| GET / POST | `/goals?currency=PEN\|USD` | Lista o crea metas de ahorro |
| PUT / DELETE | `/goals/:id` | Actualiza, registra un aporte o elimina una meta |
| GET / POST | `/categories` | Lista o crea categorías |
| GET | `/health` | Estado de la API |

## Pruebas

```bash
cd backend
npm test
```

Las pruebas unitarias cubren las reglas de negocio: validación de registro y transacciones, motor de alertas del 80 %, suma de gastos del mes, conversión de divisas, exportación CSV, validación de comprobantes y filtros por periodo.

## Despliegue en un VPS

El proyecto está preparado para instalarse en un VPS con Linux (por ejemplo, Ubuntu 22.04 o superior) usando Docker Compose. Se levantan tres contenedores:

| Contenedor | Función |
| --- | --- |
| `frontend` | Nginx que sirve la aplicación React y redirige `/api` y `/uploads` a la API |
| `backend` | API Express en el puerto interno 4000 |
| `database` | PostgreSQL 16 con un volumen persistente |

Solo el contenedor `frontend` expone un puerto al exterior. La API y la base de datos quedan en la red interna de Docker.

### Requisitos del servidor

- 2 vCPU y 2 GB de RAM como mínimo
- 20 GB de disco
- Docker y el plugin Docker Compose
- Un dominio apuntando a la IP del servidor (recomendado para HTTPS)

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Descargar el proyecto

```bash
git clone <url-del-repositorio> kyzen
cd kyzen
```

### 3. Configurar las variables de entorno

```bash
cp .env.example .env
nano .env
```

Define como mínimo `DATABASE_PASSWORD`, `JWT_SECRET` y `CLIENT_URL`. Para generar una clave aleatoria puedes usar:

```bash
openssl rand -hex 32
```

Para enviar los códigos por correo, completa las variables `SMTP_*` con los datos de tu proveedor de correo. Si las dejas vacías, los códigos se escriben en los logs de la API (`docker compose logs backend`).

### 4. Construir y levantar los contenedores

```bash
docker compose up -d --build
```

La aplicación queda disponible en `http://<ip-del-servidor>` (o en el puerto definido en `APP_PORT`).

### 5. Configurar el dominio y HTTPS

Una opción es instalar Nginx y Certbot en el servidor y usarlos como proxy inverso. Primero cambia `APP_PORT=8080` en `.env` y vuelve a ejecutar `docker compose up -d`. Luego crea el sitio en `/etc/nginx/sites-available/kyzen`:

```nginx
server {
    server_name tu-dominio.com;
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kyzen /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com
```

Si el VPS usa un panel de administración basado en Docker (como Dokploy, Coolify o Portainer), se puede crear una aplicación de tipo Docker Compose apuntando a este repositorio, cargar las variables de `.env.example` y asignar el dominio al servicio `frontend` en el puerto 80.

### Operación

| Acción | Comando |
| --- | --- |
| Ver el estado | `docker compose ps` |
| Ver los logs de la API | `docker compose logs -f backend` |
| Actualizar a la última versión | `git pull && docker compose up -d --build` |
| Detener la aplicación | `docker compose down` |
| Respaldar la base de datos | `docker compose exec database pg_dump -U kyzen kyzen > respaldo.sql` |
| Restaurar un respaldo | `cat respaldo.sql \| docker compose exec -T database psql -U kyzen kyzen` |

Los datos de PostgreSQL y los comprobantes subidos se guardan en los volúmenes `database_data` y `uploads_data`, por lo que se conservan al actualizar o reiniciar los contenedores.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `APP_PORT` | Puerto público del frontend en el VPS | `80` |
| `CLIENT_URL` | URL pública de la aplicación (CORS) | `http://localhost:5173` |
| `DATABASE_HOST` / `DATABASE_PORT` | Servidor de PostgreSQL | `localhost` / `5432` |
| `DATABASE_NAME` / `DATABASE_USER` / `DATABASE_PASSWORD` | Credenciales de la base de datos | `kyzen` / `postgres` / `postgres` |
| `JWT_SECRET` | Clave para firmar los tokens de sesión | — |
| `JWT_EXPIRATION` | Duración de la sesión | `7d` |
| `EXCHANGE_RATE_USD` | Tipo de cambio de soles a dólares | `3.75` |
| `UPLOADS_DIRECTORY` | Carpeta de los comprobantes | `uploads` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Servidor de correo para los códigos | vacío (los códigos se muestran en consola) |

## Seguridad

- Contraseñas cifradas con bcrypt y sesiones con JWT.
- Cada consulta se filtra por el usuario autenticado.
- Validación en el formulario y en el servidor (montos mayores a 0, categoría obligatoria en gastos y comprobantes JPG o PNG de hasta 5 MB).
- Mensaje genérico ante credenciales inválidas.
- Secretos fuera del repositorio mediante variables de entorno.
