import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Product } from './products'

let crawledAt: number = 0

export function getCrawledAt () {
  return crawledAt
}

export async function crawl () {
  const html = (await axios.get('https://www.jksshop.co/categories/jks-new-arrival?page=1&sort_by=created_at&order_by=desc&limit=100')).data as string
  const dom = new JSDOM(html)

  const productElements = [...dom.window.document.querySelectorAll('product-item')]

  crawledAt = +new Date()

  const products = productElements.map<Product>((el) => {
    const $ = (selector: string) => el.querySelector(selector)

    const name = $('.title')?.textContent ?? '-'
    const rawPrice = $('.price:not(.price-crossed)')?.textContent
    const price = Number(rawPrice?.replaceAll('NT$', '').replaceAll(',', '')) ?? 0
    const link = $('a')?.getAttribute('href') ?? '-'
    const srcSetString = $('.boxify-image img')?.getAttribute('data-srcset')
    const img = srcSetString?.split('?')[0] ?? ''

    return { name, price, link, img, crawledAt }
  })

  return products
}
