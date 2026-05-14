import express from 'express'
import prisma from '../prisma/prisma.client.ts'

const router = express.Router()

// Home page - all products
router.get('/', async (req, res) => {
  try {
    const cards = await prisma.producto.findMany({
      omit: { descripción: true }
    })
    res.render('portada.njk', { cards })
  } catch (error: any) {
    console.error('~ error:', error.message)
    res.status(500).send(`Error: ${error.message}`)
  }
})

// Detail page
router.get('/producto/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const producto = await prisma.producto.findUnique({
      where: { id }
    })
    if (!producto) return res.status(404).send('Producto no encontrado')
    res.render('detalle.njk', { producto })
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`)
  }
})

// Search
router.get('/buscar', async (req, res) => {
  try {
    const busqueda = req.query.busqueda as string || ''
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
    res.status(500).send(`Error: ${error.message}`)
  }
})

export default router