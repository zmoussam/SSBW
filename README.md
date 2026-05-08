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
├── package.json
├── tsconfig.json
├── productos.json           # Scraped product data
├── imagenes/                # Downloaded product images
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── prisma.client.ts     # Prisma client configuration
├── generated/
│   └── prisma/              # Auto-generated Prisma client
└── scripts/
    ├── scrap-tp.js          # Web scraper (Playwright)
    └── seed.ts              # Database seeder
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

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `node --watch --env-file=.env index.ts` | Start Express server in watch mode |
| `npm run scrap` | `node --env-file=.env scripts/scrap-tp.js` | Run the web scraper |
| `npm run seed` | `npx tsx --env-file=.env scripts/seed.ts` | Seed the database with scraped data |

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