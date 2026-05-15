import express from 'express'
import jwt from 'jsonwebtoken'
import usuario from '../prisma/usuario.ts'
import logger from '../logger.ts'

const router = express.Router()

// Show login page
router.get('/login', (req, res) => {
  res.render('login.njk', { error: false })
})

// Handle login form
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body

  try {
    const u = await usuario.autentifica(email, contraseña)
    const token = jwt.sign(
      { usuario: u.nombre, admin: u.admin },
      process.env.SECRET_KEY as string
    )

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }).redirect('/')

  } catch (error: any) {
    logger.error(`Login failed for ${email}: ${error.message}`)
    res.render('login.njk', { error: true })
  }
})

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('access_token').redirect('/')
})

export default router