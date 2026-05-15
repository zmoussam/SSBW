import usuario from '../prisma/usuario.ts'
import prisma from '../prisma/prisma.client.ts'

// Register test users
console.log('Registering test users...')

try {
  await usuario.registra('admin@prado.es', 'Administrador', 'admin123', true)
  console.log('✓ Admin user created')
} catch (error: any) {
  console.error('Admin user error:', error.message)
}

try {
  await usuario.registra('user@prado.es', 'Usuario Test', 'user123', false)
  console.log('✓ Test user created')
} catch (error: any) {
  console.error('Test user error:', error.message)
}

// Verify authentication
console.log('\nVerifying authentication...')

try {
  const u = await usuario.autentifica('admin@prado.es', 'admin123')
  console.log(`✓ Admin authenticated: ${u.nombre}, admin: ${u.admin}`)
} catch (error: any) {
  console.error('Auth error:', error.message)
}

try {
  const u = await usuario.autentifica('user@prado.es', 'user123')
  console.log(`✓ User authenticated: ${u.nombre}, admin: ${u.admin}`)
} catch (error: any) {
  console.error('Auth error:', error.message)
}

// Test wrong password
console.log('\nTesting wrong password...')
try {
  await usuario.autentifica('admin@prado.es', 'wrongpassword')
} catch (error: any) {
  console.log(`✓ Correctly rejected: ${error.message}`)
}

await prisma.$disconnect()