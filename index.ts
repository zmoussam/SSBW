import express from 'express'
import nunjucks from 'nunjucks'
import session from 'express-session'
import ProductosRouter from './routes/productos.ts'
import logger from './logger.ts'

const app = express()
const PORT = process.env.PORT || 3000

// Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app
})

// Middleware: form parameters
app.use(express.urlencoded({ extended: true }))

// Middleware: sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-secret',
  resave: false,
  saveUninitialized: false
}))

// Middleware: static files
app.use('/public/imagenes', express.static('imagenes'))

// Middleware: make cart info available in all templates
app.use((req, res, next) => {
  res.locals.total_carrito = req.session.total_carrito || 0
  next()
})

// Router
app.use('/', ProductosRouter)

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`)
})