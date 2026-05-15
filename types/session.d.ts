import 'express-session'
import 'express'

declare module 'express-session' {
  interface SessionData {
    carrito: { id: number; cantidad: number }[]
    total_carrito: number
  }
}

declare module 'express' {
  interface Request {
    usuario?: string
    admin?: boolean
  }
}