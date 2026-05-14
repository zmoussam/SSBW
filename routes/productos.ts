import express from 'express'
import prisma from '../prisma/prisma.client.ts'
import logger from '../logger.ts'

const router = express.Router()

// Home page
router.get('/', async (req, res) => {
  try {
    logger.info('GET / — home page')
    const cards = await prisma.producto.findMany({
      omit: { descripción: true }
    })
    res.render('portada.njk', { cards })
  } catch (error: any) {
    logger.error(`GET / — ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

// Detail page
router.get('/producto/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    logger.info(`GET /producto/${id}`)
    const producto = await prisma.producto.findUnique({ where: { id } })
    if (!producto) {
      logger.warn(`GET /producto/${id} — not found`)
      return res.status(404).send('Producto no encontrado')
    }
    res.render('detalle.njk', { producto })
  } catch (error: any) {
    logger.error(`GET /producto/:id — ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

// Search
router.get('/buscar', async (req, res) => {
  try {
    const busqueda = req.query.busqueda as string || ''
    logger.info(`GET /buscar?busqueda=${busqueda}`)
    const cards = await prisma.producto.findMany({
      where: {
        OR: [
          { título: { contains: busqueda, mode: 'insensitive' } },
          { descripción: { contains: busqueda, mode: 'insensitive' } }
        ]
      },
      omit: { descripción: true }
    })
    res.render('portada.njk', { cards, busqueda })
  } catch (error: any) {
    logger.error(`GET /buscar — ${error.message}`)
    res.status(500).send(`Error: ${error.message}`)
  }
})

// Add to cart
router.post('/al-carrito/:id', async (req, res) => {
  const id = Number(req.params.id)
  const cantidad = Number(req.body.cantidad)
  logger.debug(`Al carrito: producto ${id}, cantidad ${cantidad}`)

  if (cantidad > 0) {
    if (req.session.carrito !== undefined) {
      const existing = req.session.carrito.find(item => item.id === id)
      if (existing) {
        existing.cantidad += cantidad
      } else {
        req.session.carrito.push({ id, cantidad })
      }
    } else {
      req.session.carrito = [{ id, cantidad }]
    }

    const total_carrito = req.session.carrito.reduce(
      (sum, item) => sum + item.cantidad, 0
    )
    res.locals.total_carrito = total_carrito
    req.session.total_carrito = total_carrito
    logger.info(`POST /al-carrito/${id} — cantidad: ${cantidad}, total carrito: ${total_carrito}`)
  }

  res.redirect(`/producto/${id}`)
})

export default router