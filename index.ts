import express from 'express'
import nunjucks from 'nunjucks'
import ProductosRouter from './routes/productos.ts'

const app = express()
const PORT = process.env.PORT || 3000

// Nunjucks setup
nunjucks.configure('views', {
  autoescape: true,
  express: app
})

// Middleware for static files
app.use('/public/imagenes', express.static('imagenes'))

// Router
app.use('/', ProductosRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})