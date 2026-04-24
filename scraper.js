import { chromium } from 'playwright'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { createWriteStream } from 'fs'
import { get } from 'https'
import path from 'path'

const nombre_archivo_desde = (título) =>
  título.replace(/[^a-z0-9]/gi, '_').toLowerCase()

async function descargarImagen(url, destino) {
  return new Promise((resolve, reject) => {
    const archivo = createWriteStream(destino)
    get(url, (res) => {
      res.pipe(archivo)
      archivo.on('finish', () => { archivo.close(); resolve() })
    }).on('error', reject)
  })
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.3'
})

// Page 1: listing page to get all product URLs + images
const listPage = await context.newPage()
try {
  await listPage.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', { timeout: 15000 })
} catch (error) {
  console.error('Error cargando la página:', error)
  await browser.close()
  process.exit(1)
}
await listPage.waitForTimeout(3000)

if (!existsSync('imagenes')) await mkdir('imagenes')

const articulos = await listPage.locator('article.product-miniature').all()
console.log(`Encontrados ${articulos.length} productos`)

// Collect basic info + URL from listing
const basicData = []
for (const articulo of articulos) {
  const título = (await articulo.locator('.product-title a').innerText()).trim()
  
  let texto_precio = ''
  const precioLoc = articulo.locator('.product-price')
  if (await precioLoc.count() > 0) {
    texto_precio = (await precioLoc.innerText()).trim()
  }

  let imagen = ''
  const imgLoc = articulo.locator('img.product-thumbnail-first')
  if (await imgLoc.count() > 0) {
    const dataSrc = await imgLoc.getAttribute('data-src')
    if (dataSrc) {
      const nombreArchivo = nombre_archivo_desde(título) + '.jpg'
      imagen = nombreArchivo
      const destino = path.join('imagenes', nombreArchivo)
      try {
        await descargarImagen(dataSrc, destino)
        console.log(`✓ imagen: ${nombreArchivo}`)
      } catch {
        console.error(`✗ Error descargando imagen de ${título}`)
      }
    }
  }

  let url = ''
  const urlLoc = articulo.locator('.product-title a')
  if (await urlLoc.count() > 0) {
    url = await urlLoc.getAttribute('href')
  }

  basicData.push({ título, texto_precio, imagen, url })
}

await listPage.close()

// Page 2: visit each product page to get full description
const productos = []
const detailPage = await context.newPage()

for (const item of basicData) {
  console.log(`Scraping: ${item.título}`)
  try {
    await detailPage.goto(item.url, { timeout: 12000 })
    await detailPage.waitForTimeout(1000)

    let descripción = ''
    const descLoc = detailPage.locator('.product-description.rte-content')
    if (await descLoc.count() > 0) {
      descripción = (await descLoc.innerText()).trim()
    }

    productos.push({
      título: item.título,
      descripción,
      texto_precio: item.texto_precio,
      imagen: item.imagen
    })
  } catch (e) {
    console.error(`✗ Error en producto: ${item.título}`)
    productos.push({ título: item.título, descripción: '', texto_precio: item.texto_precio, imagen: item.imagen })
  }
}

await detailPage.close()
await browser.close()

await writeFile('productos.json', JSON.stringify(productos, null, 2), 'utf-8')
console.log(`\nGuardados ${productos.length} productos en productos.json`)