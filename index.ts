import express from 'express'
import nunjucks from 'nunjucks'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import ProductosRouter from './routes/productos.ts'
import UsuariosRouter from './routes/usuarios.ts'
import ApiRouter from './routes/api.ts'
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

// Middleware: JSON for API
app.use(express.json())

// Middleware: cookie parser
app.use(cookieParser())

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

// Middleware: authentication
app.use((req, res, next) => {
  const token = req.cookies.access_token
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY as string) as any
      req.usuario = data.usuario
      req.admin = data.admin
      app.locals.usuario = data.usuario
      app.locals.admin = data.admin
      logger.info(`Authenticated ${data.usuario} admin:${data.admin}`)
    } catch (error) {
      app.locals.usuario = undefined
      app.locals.admin = undefined
    }
  } else {
    app.locals.usuario = undefined
    app.locals.admin = undefined
  }
  next()
})

// Routers
app.use('/', ProductosRouter)
app.use('/', UsuariosRouter)
app.use('/', ApiRouter)

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`)
})