import { crawl } from './crawler'
import { addProductFirebase } from './database'
import { sendToAllSubscribers } from './telegram'

export async function task () {
  try {
    const products = await crawl()
    for (const product of products) {
      const success = await addProductFirebase(product)
      if (!success) continue

      console.log('New Product!', product)
      await sendToAllSubscribers(product)
    }
  } catch (e) {
    console.error('😢 Failed to crawl, will try again later\n', e)
  }

  return task
}
