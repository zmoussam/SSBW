import bcrypt from 'bcrypt'
import prisma from './prisma.client.ts'

const SALT_ROUNDS = 10

// Register a new user with hashed password
async function registra(
  email: string,
  nombre: string,
  contraseña: string,
  admin: boolean = false
) {
  const hash = await bcrypt.hash(contraseña, SALT_ROUNDS)
  const usuario = await prisma.usuario.create({
    data: { email, nombre, contraseña: hash, admin }
  })
  return usuario
}

// Verify email and password, throw error if invalid
async function autentifica(email: string, contraseña: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email }
  })

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const válida = await bcrypt.compare(contraseña, usuario.contraseña)

  if (!válida) {
    throw new Error('Contraseña incorrecta')
  }

  return usuario
}

export default { registra, autentifica }