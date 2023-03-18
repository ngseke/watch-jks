import { crawl } from './crawler'
import { addProduct } from './products'
import { sendToAllReceiver } from './telegram'

export async function task () {
  const products = await crawl()
  for (const product of products) {
    const { isExists } = await addProduct(product)
    if (isExists) continue

    console.log('New Product!', product)
    await sendToAllReceiver(product)
  }
}
