import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Product } from './products'

let crawledAt: number = 0

function extractBackground (background: string) {
  const pattern = /(?:\(['"]?)(.*?)(?:['"]?\))/
  return pattern.exec(background)?.[1] ?? ''
}

export function getCrawledAt () {
  return crawledAt
}

export async function crawl () {
  const html = (await axios.get('https://www.jksshop.co/categories/jks-new-arrival?page=1&sort_by=created_at&order_by=desc&limit=100')).data as string
  const dom = new JSDOM(html)

  const productItems = [...dom.window.document.querySelectorAll('product-item')]

  crawledAt = +new Date()

  const products = await Promise.all(
    productItems.map<Promise<Product>>(async (el) => {
      const select = (selector: string) => el.querySelector(selector)

      const name = select('.title')?.textContent ?? '-'
      const rawPrice = select('.price:not(.price-crossed)')?.textContent
      const price = Number(rawPrice?.replaceAll('NT$', '').replaceAll(',', '')) ?? 0
      const link = select('a')?.getAttribute('href') ?? '-'
      const backgroundImage = (select('.boxify-image') as HTMLDivElement)
        .style.backgroundImage
      const img = extractBackground(backgroundImage)

      return { name, price, link, img, crawledAt }
    })
  )

  return products
}
