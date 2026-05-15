# SSBW — Tienda Prado Impresiones

A Multi-Page Application (MPA) built with Node.js, Express, and Nunjucks, featuring web scraping, PostgreSQL database, and ORM integration. This project replicates part of the Tienda Prado online store (Impresiones section).

---

## Requirements

- Node.js >= 23
- Docker and Docker Compose
- npm

---

## Project Structure

```
SSBW/
├── docker-compose.yml       # PostgreSQL container
├── .env                     # Environment variables (not committed)
├── index.ts                 # Express server
├── logger.ts                # Winston logger configuration
├── package.json
├── tsconfig.json
├── productos.json           # Scraped product data
├── imagenes/                # Downloaded product images
├── logs/
│   ├── info.log             # Info and above log entries
│   └── error.log            # Error log entries
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── prisma.client.ts     # Prisma client configuration
│   └── usuario.ts           # Password hashing and authentication methods
├── generated/
│   └── prisma/              # Auto-generated Prisma client
├── routes/
│   ├── productos.ts         # Product controllers (MVC)
│   └── usuarios.ts          # Authentication controllers
├── types/
│   └── session.d.ts         # Express session and request type declarations
├── views/
│   ├── base.njk             # Base template
│   ├── portada.njk          # Home and search page
│   ├── detalle.njk          # Product detail page
│   └── login.njk            # Login page
└── scripts/
    ├── scrap-tp.js          # Web scraper (Playwright)
    ├── seed.ts              # Database seeder
    └── registra_usuarios.ts # User registration and verification script
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/zmoussam/SSBW.git
cd SSBW
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root:

```env
POSTGRES_USER=yo
POSTGRES_PASSWORD=una_clave_muy_segura_123
POSTGRES_DB=ssbw
DATABASE_URL="postgresql://yo:una_clave_muy_segura_123@localhost:5432/ssbw?schema=public"
LOG_LEVEL=debug
SECRET_KEY=your_secret_key_here
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name esquema_inicial
npx prisma generate
```

### 5. Seed the database

```bash
npm run seed
```

### 6. Register test users

```bash
npm run registra
```

### 7. Start the server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Tasks

### Task 1 — Express + Node.js Server

Sets up the base web server using:
- **Express** — web framework
- **Nunjucks** — templating engine (compatible with Jinja/Twig/Django templates)
- **Node.js 23** — native TypeScript support, watch mode, `.env` file support

Run the development server:

```bash
npm run dev
```

The server starts with `--watch` mode, so it automatically restarts when files change.

---

### Task 2 — Web Scraping

Scrapes all products from the [Tienda Prado Impresiones](https://tiendaprado.com/es/385-impresiones?resultsPerPage=999) page using **Playwright**, which launches a real Chromium browser to handle dynamically loaded content.

For each product it collects:
- Title
- Description
- Price
- Image (downloaded locally)

Results are saved to `productos.json` and images to the `imagenes/` folder.

Install Playwright browsers (first time only):

```bash
npx playwright install
```

Run the scraper:

```bash
npm run scrap
```

---

### Task 3 — Database with ORM (Prisma + PostgreSQL)

Uses **Prisma ORM** with **PostgreSQL** (running in Docker) to store the scraped product data.

The database schema defines a `Producto` model with:
- `id` — auto-increment primary key
- `título` — product title (max 127 chars)
- `descripción` — full description (text)
- `precio` — decimal price
- `imagen` — image filename (max 127 chars)

Full-Text Search (PostgreSQL preview feature) is enabled in the schema.

Seed the database (loads `productos.json` into PostgreSQL):

```bash
npm run seed
```

Reset the database (clears all data and reruns migrations):

```bash
npx prisma migrate reset
```

Open Prisma Studio (visual database browser):

```bash
npx prisma studio
```

---

### Task 4 — Home Page, Search and Product Detail Pages

Implements the MVC pattern with Prisma as the Model and Nunjucks as the View.

Routes available:

| Route | Description |
|-------|-------------|
| `GET /` | Home page — all products grid |
| `GET /producto/:id` | Product detail page |
| `GET /buscar?busqueda=` | Search by title or description |

The UI closely matches the real Tienda Prado design using EB Garamond font, Bootstrap 5, and the same layout structure.

---

### Task 5 — Logger and Shopping Cart

**Logger** — Winston is configured with three transports:

| Transport | Level | Output |
|-----------|-------|--------|
| Console | debug | All messages with colors and timestamps |
| File | info | `logs/info.log` in JSON format |
| File | error | `logs/error.log` in JSON format |

The log level can be controlled via the `LOG_LEVEL` environment variable (default: `debug`).

**Shopping Cart** — Cart functionality using server-side sessions:
- Add products to cart from the product detail page with a quantity input
- Cart data stored in `express-session` and persists until the browser is closed
- Cart icon in the header shows the total number of items in the cart
- Cart middleware in `index.ts` makes cart data available in all templates via `res.locals`

Route added:

| Route | Description |
|-------|-------------|
| `POST /al-carrito/:id` | Add product to cart with quantity |

---

### Task 6 — Authentication

Adds user authentication using JWT tokens stored in httpOnly cookies.

**Database** — A new `Usuario` model was added to the schema:
- `email` — primary key
- `nombre` — display name
- `contraseña` — bcrypt hashed password
- `admin` — boolean role flag

**Password hashing** — `prisma/usuario.ts` provides two methods:
- `registra(email, nombre, contraseña, admin)` — hashes the password with bcrypt and creates the user
- `autentifica(email, contraseña)` — verifies credentials and throws an error if invalid

**Test users** — Run the registration script to create test users:

```bash
npm run registra
```

Default test users:

| Email | Password | Admin |
|-------|----------|-------|
| admin@prado.es | admin123 | Yes |
| user@prado.es | user123 | No |

**Authentication flow:**
1. User submits login form at `GET /login`
2. Server verifies credentials with bcrypt
3. On success, a JWT token is signed and stored in an `httpOnly` cookie
4. Authentication middleware in `index.ts` reads and verifies the token on every request
5. User info is available in all templates via `app.locals.usuario` and `app.locals.admin`
6. Logout at `GET /logout` clears the cookie

**Header** — Shows username and logout link when logged in, login link when not.

Routes added:

| Route | Description |
|-------|-------------|
| `GET /login` | Show login page |
| `POST /login` | Handle login form |
| `GET /logout` | Clear cookie and redirect to home |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `tsx --watch --env-file=.env index.ts` | Start Express server in watch mode |
| `npm run scrap` | `node --env-file=.env scripts/scrap-tp.js` | Run the web scraper |
| `npm run seed` | `npx tsx --env-file=.env scripts/seed.ts` | Seed the database with scraped data |
| `npm run registra` | `npx tsx --env-file=.env scripts/registra_usuarios.ts` | Register test users |

---

## Technologies

| Technology | Purpose |
|------------|---------|
| Node.js 23 | Runtime with native TypeScript support |
| Express | Web framework |
| Nunjucks | HTML templating engine |
| Playwright | Web scraping with real browser |
| PostgreSQL | Relational database |
| Prisma 7 | ORM with migrations and studio |
| Docker | PostgreSQL container |
| tsx | TypeScript script runner |
| Bootstrap 5 | CSS framework |
| Winston | Logging framework |
| express-session | Server-side session management |
| jsonwebtoken | JWT token generation and verification |
| bcrypt | Password hashing |
| cookie-parser | Cookie parsing middleware |
