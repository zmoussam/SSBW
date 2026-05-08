import prisma from "../prisma/prisma.client.ts";

type Producto = {
  título: string
  descripción: string
  texto_precio: string
  imagen: string
}
type Productos = Producto[]

import productos from "../productos.json" with { type: 'json' }
await Guadar_en_DB(productos)

// Test query: products whose description starts with 'Papel' ordered by price
const láminas = await prisma.producto.findMany({
  where: {
    descripción: { startsWith: 'Papel' }
  },
  orderBy: { precio: 'asc' },
  select: { título: true, precio: true }
})

console.log('\n--- Products whose description starts with "Papel" ordered by price ---')
for (const p of láminas) {
  console.log(`${p.precio} € — ${p.título}`)
}

await prisma.$disconnect()

async function Guadar_en_DB(productos: Productos): Promise<void> {
  for (const producto of productos) {
    const título = producto.título
    const descripción = producto.descripción
    const imagen = producto.imagen
    const precio = Number(producto.texto_precio.slice(0, -2).replace(/,/, '.'))
    try {
      const prod = await prisma.producto.create({
        data: {
          título,
          descripción,
          imagen,
          precio
        }
      })
      console.log('Created', prod)
    } catch(error: any) {
      console.error(error.message)
    }
  }
}