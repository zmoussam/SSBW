import express from 'express'
import prisma from '../prisma/prisma.client.ts'
import logger from '../logger.ts'

const router = express.Router()

// GET /api/productos?desde=0&hasta=20&ordenación=ascendente
router.get('/api/productos', async (req, res) => {
  try {
    const desde = Number(req.query.desde) || 0
    const hasta = Number(req.query.hasta) || 20
    const ordenación = req.query.ordenación === 'descendente' ? 'desc' : 'asc'

    const productos = await prisma.producto.findMany({
      skip: desde,
      take: hasta,
      orderBy: { precio: ordenación }
    })

    logger.info(`GET /api/productos desde:${desde} hasta:${hasta} ordenación:${ordenación}`)
    res.json(productos)

  } catch (error: any) {
    logger.error(`GET /api/productos — ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/productos/:id
router.get('/api/productos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const producto = await prisma.producto.findUnique({ where: { id } })

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    logger.info(`GET /api/productos/${id}`)
    res.json(producto)

  } catch (error: any) {
    logger.error(`GET /api/productos/:id — ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/productos
router.post('/api/productos', async (req, res) => {
  try {
    const { título, descripción, precio, imagen } = req.body

    const producto = await prisma.producto.create({
      data: { título, descripción, precio, imagen }
    })

    logger.info(`POST /api/productos — created id:${producto.id}`)
    res.status(201).json(producto)

  } catch (error: any) {
    logger.error(`POST /api/productos — ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/productos/:id
router.put('/api/productos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { título, descripción, precio } = req.body

    const producto = await prisma.producto.update({
      where: { id },
      data: { título, descripción, precio }
    })

    logger.info(`PUT /api/productos/${id}`)
    res.json(producto)

  } catch (error: any) {
    logger.error(`PUT /api/productos/:id — ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/productos/:id
router.delete('/api/productos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.producto.delete({ where: { id } })

    logger.info(`DELETE /api/productos/${id}`)
    res.json({ message: `Producto ${id} eliminado` })

  } catch (error: any) {
    logger.error(`DELETE /api/productos/:id — ${error.message}`)
    res.status(500).json({ error: error.message })
  }
})

export default router